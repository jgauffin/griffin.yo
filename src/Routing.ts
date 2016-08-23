
module Griffin.Yo.Routing {

    //#region "interfaces"

    export interface IRoute {
        /**
	 * Is the URL in the context matching this route?
	 * @param ctx information used for matching
	 */
        isMatch(ctx: IRouteContext): boolean;

        /**
	 * Invoke this route.
	 * @param ctx route information
	 */
        invoke(ctx: IRouteContext): void;
    }

    export interface IRouteContext {

        /**
	 * URL being visited (everything after the hash/hashbang)
	 */
        url: string;

        /**
	 * Specified if something else than the main view container is the target.
	 */
        targetElement?: HTMLElement;
    }

    /**
    * Used to render a generated view into a target (could be a HTML div or a generated bootstrap modal).
    */
    export interface IViewTarget {
        /**
	 * Name of this target
	 */
        name: string;

        /**
	 * Set the title for the target.
	 * @param title
	 *
	 * Can be invoked to set the title of the view target.
	 */
        setTitle(title: string): void;

        /**
	 * The container to use when doing context selections (querySelector) in the view model logic.
	 */
        //getSelectionContainer():HTMLElement;

        /**
	 * Prepare the target for a new view model (and view).
	 * @param options Options specific for the implementation
	 * Invoked after attachViewModel
	 */
        assignOptions(options: any): void;

        /**
	 * Attach the view model script (so that it get loaded into the DOM).
	 * @param script View model
	 */
        attachViewModel(script: HTMLScriptElement): void;

        /**
	 * Render element into the target
	 * @param element Element containing the view (result generated with the help of the view model)
	 *
	 * Invoked once the view model has been run and generated a view.
	 */
        render(element: HTMLElement): void;
    }

    export interface IRouteExecutionContext {
        routeData: any;
        route: IRoute;
        target?: IViewTarget;
    };

    /**
 * Takes care of a specific route
 */
    export interface IRouteHandler {
        /**
	 * Invoke handler for the matching route.
	 * @param ctx Information required to invoke the route
	 */
        invoke(ctx: IRouteExecutionContext): void;
    }

    //#endregion "interfaces"



    /**
 * Represents a route
 */
    export class Route implements IRoute {
        private parts: string[] = [];

        constructor(public route: string, public handler: IRouteHandler, public target?: IViewTarget) {
            this.parts = route.replace(/^\//, "")
                .replace(/\/$/, "")
                .split("/");
        }

        isMatch(ctx: IRouteContext): boolean {
            const urlParts = ctx.url.split("/", 10);
            for (let i = 0; i < this.parts.length; i++) {
                const myPart = this.parts[i];
                const pathPart = urlParts[i];
                if (pathPart !== undefined) {
                    if (myPart.charAt(0) === ":") {
                        continue;
                    } else if (myPart !== pathPart) {
                        return false;
                    }
                } else if (myPart.charAt(0) !== ":") {
                    //not an argument, i.e not optional
                    return false;
                } else {
                    return false;
                }
            }

            return true;
        }

        invoke(ctx: IRouteContext) {
            const urlParts = ctx.url.split("/", 10);
            const routeData:any = {};
            for (let i = 0; i < this.parts.length; i++) {
                const myPart = this.parts[i];
                const pathPart = urlParts[i];
                if (pathPart !== "undefined") {
                    if (myPart.charAt(0) === ":") {
                        routeData[myPart.substr(1)] = pathPart;
                    }
                } else if (myPart.charAt(0) === ":") {
                    routeData[myPart.substr(1)] = null;
                }
            }
            const executionCtx: IRouteExecutionContext = {
                routeData: routeData,
                route: this
            };
            if (typeof this.target !== "undefined") {
                executionCtx.target = this.target;
            }

            this.handler.invoke(executionCtx);
        }
    }

    /**
    * Translates a uri to a route.
    */
    export class Router {
        private routes: IRoute[] = [];

        /**
	 * Route an URL
	 * @param route URL to act on (vars should be prefixed with colon: '/user/:userId').
	 * @param handler used to invoke the VM if the route matches.
	 * @param targetElement id or HTML element (where the result should be rendered)
	 * @returns {}
	 */
        add(route: string, handler: IRouteHandler, targetElement?: any) {
            this.routes.push(new Route(route, handler, targetElement));
        }

        /**
	 * Add a custom route
	 * @param route route
	 */
        addRoute(route: IRoute) {
            if (typeof route === "undefined")
                throw new Error("Route must be specified.");

            this.routes.push(route);
        }

        execute(url: string, targetElement?: any): boolean {
            if (url.length) {
                url = url
                    .replace(/\/+/g, "/") //remove double slashes
                    .replace(/^\/|\/($|\?)/, "") //trim slashes
                    .replace(/#.*$/, "");
            }
            const ctx: IRouteContext = {
                url: url
            };
            if (typeof targetElement !== "undefined") {
                if (typeof targetElement === "string") {
                    ctx.targetElement = document.getElementById(targetElement);
                    if (!ctx.targetElement) {
                        throw new Error(`Failed to identify '${targetElement}'`);
                    }
                }
                ctx.targetElement = targetElement;
            }

            for (let i = 0; i < this.routes.length; i++) {
                const route = this.routes[i];
                if (route.isMatch(ctx)) {
                    route.invoke(ctx);
                    return true;
                }
            }

            if (console && console.log) {
                console.log(`Route not found for "${url}"`);
            }
            return false;
        }
    }
}
