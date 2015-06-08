module Griffin.Yo {


    export interface IRouteExecutionContext {
        routeData: any;
        route: IRoute,
        target?: HTMLElement;
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


    /**
      * Context used when a view model is activated.
      * Do note that the VM MUST invoke either resolve or reject once all data have been loaded. No rendering
      * will take place unless so.
      */
    export interface IActivationContext {
        /**
         * Information resolved from the route mapping.
         * For instance if the route is 'user/:userId' then this will be the object '{ userId: 10 }'.
         */
        routeData: any;

        /**
         * Element that the view is being rendered into. It has not been attached to the document yet.
         */
        viewContainer: HTMLElement;

        /**
         * Should be used to populate the view with information
         * @param data data to populate the view with
         * @param directives directives that adopts the data to fit the view.
         */
        render(data: any, directives?: any);

        /**
         * Render partial view
         * @param partialSelector Id/Selector for the part to update
         * @param data data to populate the part with
         * @param directives directives that adopts the data to fit the view.
         */
        renderPartial(partialSelector: string, data: any, directives?: any);


        /**
         * Used to identify elements in the view
         */
        select: Selector;

        /**
         * Used to subscribe on events in the view.
         */
        handle: EventMapper;

        /**
         * View model has been initialized OK, View can be loaded.
         */
        resolve(): void;

        /**
         * View model failed to load OK
         */
        reject(): void;
    }

    /**
     * A view model (controlling what is presented in a view and also acts on events)
     */
    export interface IViewModel {
        /**
         * Document title
         * Will be invoked after activate as been run
         */
        getTitle(): string;

        /**
         * This viewModel just became active.
         */
        activate(context: IActivationContext): void;

        /**
         * User is navigating away from this view model.
         */
        deactivate();
    }


  
    /**
     * Used when views (html) and view models (js) should be loaded.
     * Default implementation fetches them from the server.
     */
    export interface IResourceLocator {
        getHtml(section: string): string;
        getScript(section: string): string;
    }

    /**
     * Implement if you would like to control how view models are created.
     * The script containing the view model have been loaded before this interface
     * is being called. 
     */
    export interface IViewModelFactory {
        create(applicationName: string, fullViewModelName: string): IViewModel;
    }

    /**
     * Global config for extensibility
     */
    export class GlobalConfig {
        /**
         * Can be used to modify the path which is returned.
         */
        static resourceLocator: IResourceLocator;
        static viewModelFactory: IViewModelFactory;
    }

    export class Selector {
        private scope: any;

        constructor(scope?: HTMLElement) {
            if (typeof scope === "undefined") {
                this.scope = document;
            } else {
                this.scope = scope;
            }
            if (!this.scope)
                throw new Error("Failed to identify scope");
        }

        one(idOrselector: string): HTMLElement {
            const el = document.getElementById(idOrselector);
            if (el) {
                return el;
            }

            return <HTMLElement>this.scope.querySelector(idOrselector);
        }

        all(selector: string): HTMLElement[] {
            const result: HTMLElement[] = [];
            const items = this.scope.querySelectorAll(selector);
            for (let i = 0; i < items.length; i++) {
                result.push(<HTMLElement>items[i]);
            }
            return result;
        }

    }


    export class EventMapper {
        private scope: any;

        constructor(scope?: HTMLElement) {
            if (typeof scope === "undefined") {
                this.scope = document;
            } else {
                this.scope = scope;
            }
        }

        click(selector: string, listener: (ev: MouseEvent) => any, useCapture?: boolean): void {
            const items = this.scope.querySelectorAll(selector);
            if (items.length === 0)
                throw new Error(`Failed to bind "click" to selector "${selector}", no elements found.`);

            for (let i = 0; i < items.length; i++) {
                items[i].addEventListener("click", listener, useCapture);
            }
        }

        change(selector: string, listener: (ev: Event) => any, useCapture?: boolean): void {
            const items = this.scope.querySelectorAll(selector);
            if (items.length === 0)
                throw new Error(`Failed to bind "change" to selector "${selector}", no elements found.`);
            for (let i = 0; i < items.length; i++) {
                items[i].addEventListener("change", listener, useCapture);
            }
        }

        keyUp(selector: string, listener: (ev: KeyboardEvent) => any, useCapture?: boolean): void {
            const items = this.scope.querySelectorAll(selector);
            if (items.length === 0)
                throw new Error(`Failed to bind "keyup" to selector "${selector}", no elements found.`);

            for (let i = 0; i < items.length; i++) {
                items[i].addEventListener("keyup", listener, useCapture);
            }
        }

        keyDown(selector: string, listener: (ev: KeyboardEvent) => any, useCapture?: boolean): void {
            const items = this.scope.querySelectorAll(selector);
            if (items.length === 0)
                throw new Error(`Failed to bind "keydown" to selector "${selector}", no elements found.`);

            for (let i = 0; i < items.length; i++) {
                items[i].addEventListener("keydown", listener, useCapture);
            }
        }
    }


    /**
     * Global mappings
     */
   export class G {
        static select = new Selector();
        static handle = new EventMapper();

        static render(idOrElem: any, dto: any, directives?: any) {
            const r = new ViewRenderer(idOrElem);
            r.render(dto, directives);
        }
    }

    class Doh {
        static removeChildren(n: Node) {
            if (!n) {
                throw new Error(`Element not set: ${n}`);
            }
            while (n.firstChild) {
                n.removeChild(n.firstChild);
            }
        }

        static moveChildren(source: HTMLElement, target: HTMLElement) {
            while (source.firstChild) {
                target.appendChild(source.firstChild);
            }

            if (source.parentElement) {
                source.parentElement.removeChild(source);
            } else {
                source.remove();
            }
        }

        //credits: http://stackoverflow.com/a/2441972/70386
        public static getConstructor(appName: string, viewModelModuleAndName: string): any {
            const nameParts = viewModelModuleAndName.split(".");
            let fn = (window[appName] || this[appName]);
            if (typeof fn === "undefined") {
                throw new Error(`Failed to load application namespace "${appName}'. Have a view model been loaded successfully?`);
            }
            for (var i = 0, len = nameParts.length; i < len; i++) {
                if (fn.hasOwnProperty(nameParts[i])) {
                    fn = fn[nameParts[i]];
                    continue;
                }
                const name = nameParts[i].toLowerCase();
                let foundName;
                for (let propertyName in fn) {
                    if (!fn.hasOwnProperty(propertyName)) {
                        continue;
                    }
                    if (propertyName.toLowerCase() === name) {
                        foundName = propertyName;
                    }
                }


                if (typeof foundName === "undefined")
                    throw new Error(`Could not find "#${nameParts[i]}" from viewModel name, complete name: "#${viewModelModuleAndName}".`);

                fn = fn[foundName];
            }

            if (typeof fn !== "function") {
                throw new Error(`Could not find view model ${viewModelModuleAndName}`);
            }
            return fn;
        }

    }

    /**
     * Executes a specific route (i.e. loads the view model and view from the server, caches them and finally executes the VM).
     */
    class RouteRunner implements IRouteHandler {
        private html: string;
        private viewModelScript: string;
        private viewModel: IViewModel;
        private applicationName: string;

        constructor(public section: string, applicationName: string) {
            if (!applicationName) {
                throw new Error("applicationName must be specified");
            }
            if (!section) {
                throw new Error("section must be specified");
            }
            this.applicationName = applicationName;

        }

        static replaceAll(str, replaceWhat, replaceTo): string {
            replaceWhat = replaceWhat.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            const re = new RegExp(replaceWhat, "g");
            return str.replace(re, replaceTo);
        }

        private applyRouteDataToLinks(viewElement: HTMLElement, routeData: any) {
            const links = viewElement.querySelectorAll("a");
            for (let i = 0; i < links.length; i++) {
                const link = <HTMLLinkElement>links[i];
                for (let dataName in routeData) {
                    if (routeData.hasOwnProperty(dataName)) {
                        link.href = RouteRunner.replaceAll(link.href, `:${dataName}`, routeData[dataName]);
                    }
                }

            }
        }

        private moveNavigationToMain(viewElement: HTMLElement) {
            const navigations = viewElement.querySelectorAll("[data-navigation]");
            for (let i = 0; i < navigations.length; i++) {
                const nav = <HTMLElement>navigations[i];
                const target = nav.getAttribute("data-navigation");
                const targetElem = document.getElementById(target);
                if (!targetElem)
                    throw new Error(`Failed to find target element '${target}' for navigation '${nav.innerHTML}`);
                Doh.removeChildren(targetElem);
                Doh.moveChildren(nav, targetElem);
            }
        }

        invoke(ctx: IRouteExecutionContext): void {
            this.ensureResources(() => {
                var viewElem = document.createElement("div");
                viewElem.className = "ViewContainer";
                viewElem.innerHTML = this.html;
                this.applyRouteDataToLinks(viewElem, ctx.routeData);
                this.moveNavigationToMain(viewElem);

                var viewParent = document.getElementById("YoView");
                if (typeof ctx.target !== "undefined") {

                    viewParent = ctx.target;
                }


//add script
                var scriptElem = document.createElement("script");
                scriptElem.setAttribute("type", "text/javascript");
                viewParent.appendChild(scriptElem);
                scriptElem.innerHTML = this.viewModelScript;

                //load model and run it
                var className = (this.section.replace(/\//g, ".") + "ViewModel");
                this.viewModel = GlobalConfig.viewModelFactory.create(this.applicationName, className);
                var vm = this.viewModel;
                var activationContext = {
                    routeData: ctx.routeData,
                    viewContainer: viewElem,
                    render(data: any, directives?: any) {
                        const r = new ViewRenderer(viewElem);
                        r.render(data, directives);
                    },
                    renderPartial(selector: string, data: any, directives?: any) {
                        const part = viewElem.querySelector(selector);
                        if (!part) {
                            throw new Error(`Failed to find partial '${selector}'.`);
                        }
                        const r = new ViewRenderer(part);
                        r.render(data, directives);
                    },
                    resolve() {
                        document.title = vm.getTitle();

                        //do not count the script element that we added
                        while (viewParent.childElementCount > 1) {
                            viewParent.removeChild(viewParent.firstElementChild);
                        }

                        viewParent.appendChild(viewElem);
                    },
                    reject() {
                        //TODO: Fail?
                    },
                    handle: new EventMapper(viewElem),
                    select: new Selector(viewElem)
                };


                this.viewModel.activate(activationContext);
            });
        }

        

        private ensureResources(callback: () => void) {
            var bothPreloaded = true;
            var self = this;
            if (typeof this.html === "undefined") {
                const path = GlobalConfig.resourceLocator.getHtml(this.section);
                Http.get(path, (xhr, success) => {
                    if (success) {
                        self.html = xhr.responseText;
                        this.doStep(callback);
                    } else {
                        throw new Error(xhr.responseText);
                    }
                    bothPreloaded = false;
                }, "text/html");
            }
            if (typeof this.viewModel === "undefined") {
                const path = GlobalConfig.resourceLocator.getScript(this.section);
                Http.get(path, (xhr, success) => {
                    if (success) {
                        self.viewModelScript = xhr.responseText;
                        this.doStep(callback);
                    } else {
                        throw new Error(xhr.responseText);
                    }
                }, "text/javascript");
                bothPreloaded = false;
            }

            if (bothPreloaded)
                this.doStep(callback);
        }

        private doStep(callback: () => void) {
            if (typeof this.html !== "undefined"
                && typeof this.viewModelScript !== "undefined") {
                callback();
            }
        }
    }

    /**
     * Facade for the SPA handling
     */
    export class Spa {
        private router = new Router();
        private handlers: RouteRunner[] = [];
        private basePath = "";

/**
         * Create Spa.
         * @param applicationName Only used for namespacing of VMs
         */
        constructor(public applicationName: string) {
            this.basePath = window.location.pathname;
        }

        /**
         * Navigate to another view.
         * @param URL Everything after the hash in the complete URI, like 'user/1'
         * @param targetElement If the result should be rendered somewhere else than the main layout div.
         */
        navigate(url: string, targetElement?: any) {
            this.router.execute(url, targetElement);
        }

        /**
         * Map a route
         * @param route Route string like 'user/:userId'
         * @param section Path and name of view/viewModel. 'users/index' will look for '/ViewModels/Users/IndexViewModel' and '/Views/Users/Index.html'
         */
        mapRoute(route: any, section: string, targetElement?: any) {
            const runner = new RouteRunner(section, this.applicationName);
            this.handlers[section] = runner;
            this.router.add(route, runner, targetElement);
        }

        /**
         * Start the spa application (i.e. load the default route)
         */
        run() {

            //no shebang pls.
            let url = window.location.hash.substring(1);
            if (url.substr(0, 1) === "!") {
                url = url.substr(1);
            }

            window.addEventListener("hashchange", () => {

                //no shebang pls.
                var changedUrl = window.location.hash.substring(1);
                if (changedUrl.substr(0, 1) === "!") {
                    changedUrl = changedUrl.substr(1);
                }
                this.router.execute(changedUrl);
            });

            this.router.execute(url);
        }

        private mapFunctionToRouteData(f: Function, routeData: any) {
            const re = /^\s*function\s+(?:\w*\s*)?\((.*?)\)/;
            const args = f.toString().match(re);
            const test = f[1].trim().split(/\s*,\s*/);
        }
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

    export interface IRoute {
        /**
         * Is the URL in the context mathing this route?
         * @param ctx information used for matching
         */
        isMatch(ctx: IRouteContext): boolean;

        /**
         * Invoke this route.
         * @param ctx route information
         */
        invoke(ctx: IRouteContext): void;
    }

    /**
     * Represents a route
     */
    export class Route implements IRoute {
        private parts: string[] = [];

        constructor(public route: string, public handler: IRouteHandler, public target?: any) {
            this.parts = route.replace(/^\//, "").split("/");
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
            const routeData = {};
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
            if (typeof this.target === "string") {
                executionCtx.target = document.getElementById(this.target);
                if (!executionCtx.target)
                    throw new Error(`The specified target '${this.target}' could not be found.`);
            } else if (typeof this.target !== "undefined") {
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

    interface IRenderContext {

    }


    /**
     * Renders views (i.e. takes objects/JSON and identifies where each property should be rendered in the view).
     */
    export class ViewRenderer {
        private elem: HTMLElement;
        private bindAttributeName = "data-name";
        private currentProperty;

        constructor(idOrSelectorOrElem: any) {
            if (!idOrSelectorOrElem) {
                throw new Error("Must specify a selector or an ID that refers to the target element.");
            }

            if (idOrSelectorOrElem instanceof HTMLElement) {
                this.elem = idOrSelectorOrElem;
            } else {
                this.elem = document.getElementById(idOrSelectorOrElem);
                if (!this.elem) {
                    this.elem = <HTMLEmbedElement>document.querySelector(idOrSelectorOrElem);
                    if (!this.elem) {
                        throw new Error(`Failed to find target element '${idOrSelectorOrElem}'.`);
                    }
                }
            }
        }

        render(data: any, directives?: any) {
            if (!data)
                throw new Error("No DTO was specified");

            this.renderItem(data, this.elem, "", {}, directives);
        }

        /**
         * 
         * @param data 
         * @param element 
         * @param lineage 
         * @param parentData required during rendering
         * @param directives 
         * @returns {} 
         */
        private renderItem(data: any, element: HTMLElement, lineage: string, parentData: any, directives?: any) {
            if (typeof data === "number"
                || typeof data === "string"
                || typeof data === "boolean") {
                this.renderValue(data, element, lineage, parentData, directives);
            } else if (data instanceof Array) {
                this.renderArray(element, data, lineage, parentData, directives);
            } else {
                for (let propertyName in data) {
                    if (!data.hasOwnProperty(propertyName)) {
                        continue;
                    }

                    this.currentProperty = propertyName;
                    const item = data[propertyName];
                    if (typeof item === "undefined")
                        throw new Error(`Undefined value in DTO, property "${propertyName}", lineage: "${lineage}".`);

                    let childDirectives;
                    if (directives) {
                        childDirectives = directives[propertyName];
                    }
                    const selectorStr = `[${this.bindAttributeName}="${propertyName}"],[name="${propertyName}"],#${propertyName}`;
                    const childElements = element.querySelectorAll(selectorStr);
                    if (childElements.length === 0) {
                        //console.log("[Element: ", element, '] Failed to find child ' + propertyName + ", current position: ", lineage);
                    }
                    for (let i = 0; i < childElements.length; i++) {
                        const childElement = <HTMLElement>childElements[i];
                        this.renderItem(item, childElement, lineage + "/" + propertyName, data, childDirectives);
                    }
                }
            }
        }


        private renderArray(targetElement: HTMLElement, array: any, lineage: string, parentData: any, directives: any) {
            var template: HTMLElement;
            if (targetElement["Yo.template"]) {
                template = targetElement["Yo.template"];
            } else {
                template = <HTMLElement>targetElement.cloneNode(true);
                targetElement["Yo.template"] = template;
            }
            var parent = targetElement.parentElement;
            parent.removeChild(targetElement);


            if (directives.hasOwnProperty("text")
                || directives.hasOwnProperty("html")
                || directives.hasOwnProperty("value")) {

            }

            var index = 0;
            array.forEach(child => {
                var ourNode = <HTMLElement>template.cloneNode(true);
                parent.appendChild(ourNode);


                //directives are for the children and not for this item
                this.renderItem(child, ourNode, lineage + "[" + (index++) + "]", parentData, directives);
            });
        }


        private renderValue(item: any, e: HTMLElement, lineage: string, parentData: any, directives?: any) {
            if (!e)
                throw new Error(`element is required, missing in path ${lineage}`);

            if (directives) {
                let isValueSet = false;
                for (let directiveName in directives) {
                    if (!directives.hasOwnProperty(directiveName)) {
                        continue;
                    }
                    const currentDirective = directives[directiveName];
                    if (typeof currentDirective === "undefined" || typeof currentDirective.apply === "undefined")
                        throw new Error(`Directive must be a function, maybe you specified your directive incorrectly? Path: ${lineage}`);

                    if (directiveName === "text") {
                        e.innerText = currentDirective.apply(e, [item, parentData]);
                        isValueSet = true;
                    } else if (directiveName === "html") {
                        e.innerHTML = currentDirective.apply(e, [item, parentData]);
                        isValueSet = true;
                    } else {
                        if (directiveName === "value") {
                            isValueSet = true;
                        }
                        const value = currentDirective.apply(e, [item, parentData]);
                        e.setAttribute(directiveName, value);
                    }
                }

                if (isValueSet) {
                    return;
                }
            }

            if (e.hasAttribute("value") || e instanceof HTMLInputElement) {
                e.setAttribute("value", item.toString());
            } else if (e.childElementCount > 0) {
                //TODO: List?
            } else {
                e.innerHTML = item.toString();
            }

        }
    }

    /**
     * Our wrapper around AJAX focused on loading resources and data from the server.
     */
    export class Http {
        private static cache = {};

        /**
         * Whether HTTP caching ('If-Modified-Since' and 'Last-Modified') can be used.
         */
        static useCaching = true;

        /**
         * Get a resource from the server.
         * @param url Server to fetch from
         * @param callback Invoked once the response is received from the server (or when something fails).
         * @param contentType Content type for the request.
         */
        static get(url: string, callback: (name: XMLHttpRequest, success: boolean) => void, contentType: string = "application/json"): void {
            var request = new XMLHttpRequest();
            if (typeof this.cache[url] !== "undefined") {
                const cache = this.cache[url];
                request.setRequestHeader("If-Modified-Since", cache.modifiedAt);
            };
            request.open("GET", url, true);
            request.setRequestHeader("Content-Type", contentType);
            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    if (request.status === 304) {
                        request.responseText = this.cache[url].content;
                    } else {
                        const header = request.getResponseHeader("Last-Modified");
                        if (header) {
                            this.cache[url] = {
                                content: request.responseText,
                                modifiedAt: header
                            };
                        }
                    }

                    if (contentType === "application/json") {
                        request.responseBody = JSON.parse(request.responseText);
                    }
                    callback(request, true);
                } else {
                    callback(request, false);
                }
            };

            request.onerror = () => {
                callback(request, false);
            };
            request.send();
        }
    }



    GlobalConfig.resourceLocator = {
        getHtml(section): string {
            let path = window.location.pathname;
            if (window.location.pathname.indexOf(".") > -1) {
                const pos = window.location.pathname.lastIndexOf("/");
                path = window.location.pathname.substr(0, pos);
            }
            if (path.substring(-1, 1) === '/') {
                path = path.substring(0, -1);
            }
            return path + `/Views/${section}.html`;
        },
        getScript(section): string {
            let path = window.location.pathname;
            if (window.location.pathname.indexOf(".") > -1) {
                const pos = window.location.pathname.lastIndexOf("/");
                path = window.location.pathname.substr(0, pos);
            }
            if (path.substring(-1, 1) === '/') {
                path = path.substring(0, -1);
            }
            return path + `/ViewModels/${section}ViewModel.js`;
        }
    };

    GlobalConfig.viewModelFactory = {
        create(applicationName: string, fullViewModelName: string): IViewModel {
            const viewModelConstructor = Doh.getConstructor(applicationName, fullViewModelName);
            return <IViewModel>new viewModelConstructor();
        }
    };
}