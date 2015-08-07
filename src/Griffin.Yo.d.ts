declare module Griffin.Yo {
    /**
     * Our wrapper around AJAX focused on loading resources and data from the server.
     */
    class Http {
        private static cache;
        /**
         * Whether HTTP caching ('If-Modified-Since' and 'Last-Modified') can be used.
         */
        static useCaching: boolean;
        /**
         * Get a resource from the server.
         * @param url Server to fetch from
         * @param callback Invoked once the response is received from the server (or when something fails).
         * @param contentType Content type for the request.
         */
        static get(url: string, callback: (name: XMLHttpRequest, success: boolean) => void, contentType?: string): void;
    }
    interface IRoute {
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
    interface IRouteContext {
        /**
         * URL being visited (everything after the hash/hashbang)
         */
        url: string;
        /**
         * Specified if something else than the main view container is the target.
         */
        targetElement?: HTMLElement;
    }
    interface IRouteExecutionContext {
        routeData: any;
        route: IRoute;
        target?: IViewTarget;
    }
    /**
     * Takes care of a specific route
     */
    interface IRouteHandler {
        /**
         * Invoke handler for the matching route.
         * @param ctx Information required to invoke the route
         */
        invoke(ctx: IRouteExecutionContext): void;
    }
    /**
     * Represents a route
     */
    class Route implements IRoute {
        route: string;
        handler: IRouteHandler;
        target: IViewTarget;
        private parts;
        constructor(route: string, handler: IRouteHandler, target?: IViewTarget);
        isMatch(ctx: IRouteContext): boolean;
        invoke(ctx: IRouteContext): void;
    }
    /**
     * Translates a uri to a route.
     */
    class Router {
        private routes;
        /**
         * Route an URL
         * @param route URL to act on (vars should be prefixed with colon: '/user/:userId').
         * @param handler used to invoke the VM if the route matches.
         * @param targetElement id or HTML element (where the result should be rendered)
         * @returns {}
         */
        add(route: string, handler: IRouteHandler, targetElement?: any): void;
        /**
         * Add a custom route
         * @param route route
         */
        addRoute(route: IRoute): void;
        execute(url: string, targetElement?: any): boolean;
    }
    /**
     * Used when views (html) and view models (js) should be loaded.
     * Default implementation fetches them from the server.
     */
    interface IResourceLocator {
        getHtml(section: string): string;
        getScript(section: string): string;
    }
    /**
     * Executes a specific route (i.e. loads the view model and view from the server, caches them and finally executes the VM).
     */
    class RouteRunner implements IRouteHandler {
        section: string;
        private html;
        private viewModelScript;
        private viewModel;
        private applicationName;
        constructor(section: string, applicationName: string);
        static replaceAll(str: any, replaceWhat: any, replaceTo: any): string;
        private applyRouteDataToLinks(viewElement, routeData);
        private moveNavigationToMain(viewElement, context);
        private removeConditions(elem, context);
        private evalInContext(code, context);
        private isIE();
        invoke(ctx: IRouteExecutionContext): void;
        private ensureResources(callback);
        private doStep(callback);
    }
    class ScriptLoader {
        private pendingScripts;
        private embeddedScripts;
        private container;
        static dummyScriptNode: any;
        constructor(container?: HTMLElement);
        private stateChange();
        loadSources(scripts: string | string[]): void;
        loadTags(scripts: HTMLScriptElement | HTMLScriptElement[]): void;
        private loadSource(source);
        private loadElement(tag);
        onScriptLoaded(script: HTMLScriptElement): void;
        runEmbeddedScripts(): void;
    }
    /**
     * Facade for the SPA handling
     */
    class Spa {
        applicationName: string;
        private router;
        private handlers;
        private basePath;
        private applicationScope;
        private viewTargets;
        private defaultViewTarget;
        /**
                 * Create Spa.
                 * @param applicationName Only used for namespacing of VMs
                 */
        constructor(applicationName: string);
        addTarget(name: string, target: IViewTarget): void;
        /**
         * Navigate to another view.
         * @param URL Everything after the hash in the complete URI, like 'user/1'
         * @param targetElement If the result should be rendered somewhere else than the main layout div.
         */
        navigate(url: string, targetElement?: any): void;
        /**
         * Map a route
         * @param route Route string like 'user/:userId'
         * @param section Path and name of view/viewModel. 'users/index' will look for '/ViewModels/Users/IndexViewModel' and '/Views/Users/Index.html'
         * @param target Name of the target where the result should get rendered. not specified = default location;
         */
        mapRoute(route: any, section: string, target?: string): void;
        /**
         * Start the spa application (i.e. load the default route)
         */
        run(): void;
        private mapFunctionToRouteData(f, routeData);
    }
    /**
     * Render view into a parent element
     */
    class BootstrapModalViewTarget implements IViewTarget {
        private currentNode;
        /**
         * Name is 'BootstrapModal'
         */
        name: string;
        /**
         *
         * @param options {buttons: [{title: 'Ok', callback:function(viewElement)}]
         * @returns {}
         */
        assignOptions(options: any): void;
        attachViewModel(script: HTMLScriptElement): void;
        setTitle(title: string): void;
        /**
         * Will remove innerHTML and append the specified element as the first child.
         * @param element generated view
         */
        render(element: HTMLElement): void;
    }
    class BootstrapModalViewTargetRequest {
        private node;
        private modal;
        constructor();
        /**
         *
         * @param options {buttons: [{title: 'Ok', callback:function(viewElement)}]
         * @returns {}
         */
        prepare(options: any): void;
        attachViewModel(script: HTMLScriptElement): void;
        setTitle(title: string): void;
        /**
         * Will remove innerHTML and append the specified element as the first child.
         * @param element generated view
         */
        render(element: HTMLElement): void;
    }
    /**
     * Render view into a parent element
     */
    class ElementViewTarget implements IViewTarget {
        private container;
        /**
         *
         * @param elementOrId Element to render view in
         * @returns {}
         */
        constructor(elementOrId: string | HTMLElement);
        /**
         * Id attribute of the container element.
         */
        name: string;
        assignOptions(): void;
        attachViewModel(script: HTMLScriptElement): void;
        setTitle(title: string): void;
        /**
         * Will remove innerHTML and append the specified element as the first child.
         * @param element generated view
         */
        render(element: HTMLElement): void;
    }
    class ClassFactory {
        static getConstructor(appName: string, viewModelModuleAndName: string): any;
    }
    /**
      * Context used when a view model is activated.
      * Do note that the VM MUST invoke either resolve or reject once all data have been loaded. No rendering
      * will take place unless so.
      */
    interface IActivationContext {
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
        render(data: any, directives?: any): any;
        /**
         * Render partial view
         * @param viewSelector Id/Selector for the part to update
         * @param data data to populate the part with
         * @param directives directives that adopts the data to fit the view.
         */
        renderPartial(viewSelector: string, data: any, directives?: any): any;
        /**
         * Read a form from your view
         * @param viewSelector Either a "data-name"/"id" or a HTMLElement that contains the form to read
         * @return A JSON object
         */
        readForm(viewSelector: string | HTMLElement): any;
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
        /**
         * Application wide scope (used to store application specific data). Defined in GlobalConfig.
         */
        applicationScope: any;
    }
    /**
     * A view model (controlling what is presented in a view and also acts on events)
     */
    interface IViewModel {
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
        deactivate(): any;
    }
    /**
     * Implement if you would like to control how view models are created.
     * The script containing the view model have been loaded before this interface
     * is being called.
     */
    interface IViewModelFactory {
        create(applicationName: string, fullViewModelName: string): IViewModel;
    }
    class DomUtils {
        static removeChildren(n: Node): void;
        static moveChildren(source: HTMLElement, target: HTMLElement): void;
        static getIdentifier(e: HTMLElement): string;
    }
    class EventMapper {
        private scope;
        constructor(scope?: HTMLElement);
        click(selector: string, listener: (ev: MouseEvent) => any, useCapture?: boolean): void;
        change(selector: string, listener: (ev: Event) => any, useCapture?: boolean): void;
        keyUp(selector: string, listener: (ev: KeyboardEvent) => any, useCapture?: boolean): void;
        keyDown(selector: string, listener: (ev: KeyboardEvent) => any, useCapture?: boolean): void;
    }
    class FormReader {
        private container;
        private stack;
        constructor(elemOrName: HTMLElement | string);
        read(): any;
        private pullCollection(container);
        private pullElement(container);
        private adjustCheckboxes(element, dto, value);
        private processValue(value);
        private assignByName(name, parentObject, value);
        private appendObject(target, extras);
        private isObjectEmpty(data);
        private getName(el);
        private isCollection(el);
    }
    interface IViewDirectiveContext {
        activationContext: IActivationContext;
        model: IViewModel;
        view: HTMLElement;
        execute(code: string, customContext: any): any;
    }
    /**
     * Used to render a generated view into a target (could be a HTML div or a generated bootstrap modal).
     */
    interface IViewTarget {
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
        setTitle(title: string): any;
        /**
         * The container to use when doing context selections (querySelector) in the view model logic.
         */
        /**
         * Prepare the target for a new view model (and view).
         * @param options Options specific for the implementation
         * Invoked after attachViewModel
         */
        assignOptions(options: any): any;
        /**
         * Attach the view model script (so that it get loaded into the DOM).
         * @param script View model
         */
        attachViewModel(script: HTMLScriptElement): any;
        /**
         * Render element into the target
         * @param element Element containing the view (result generated with the help of the view model)
         *
         * Invoked once the view model has been run and generated a view.
         */
        render(element: HTMLElement): void;
    }
    class Selector {
        private scope;
        constructor(scope?: HTMLElement);
        one(idOrselector: string): HTMLElement;
        all(selector: string): HTMLElement[];
    }
    /** Renders views using js/json objects.
     *
     * This renderer can render objects into views by identifying tags with the help of the attributes "name" (for forms), "data-name" for containers/single value and "data-collection" for collections.
     *
     * The rendering can be controlled by
     */
    class ViewRenderer {
        private container;
        private lineage;
        private dtoStack;
        private directives;
        private static globalValueDirectives;
        /**Create a new instance
         * @param elemOrName Either a HTML element or an identifier (value of attribute "id" or "data-name").
         * @class
         *
         *
         */
        constructor(elemOrName: HTMLElement | string);
        register(directive: IViewRenderDirective): void;
        static registerGlobal(directive: IViewRenderDirective): void;
        render(data?: any, directives?: any): void;
        private renderElement(element, data, directives?);
        private renderCollection(element, data, directive?);
        private applyEmbeddedDirectives(element, data, directives);
        private runDirectives(element, data);
        private getName(el);
        private hasName(el);
        private isCollection(el);
        private evalInContext(code, context);
    }
    class ViewValueDirectiveContext {
        /** Value to modify */
        value: any;
        /** Property name from the DTO */
        propertyName: string;
        /** Element that the value is being rendered into */
        element: HTMLElement;
        /** Current location in the DTO. Last value = name of the current property */
        lineage: string[];
    }
    /**Used to modify values before they are inserted into the element */
    interface IViewRenderDirective {
        /** Process a value
         * @return true if the remaining directives can process this value
         */
        process(context: ViewValueDirectiveContext): boolean;
    }
    /**
     * Global mappings
     */
    class G {
        static select: Selector;
        static handle: EventMapper;
        static render(idOrElem: any, dto: any, directives?: any): void;
    }
    /**
     * Global config for extensibility
     */
    class GlobalConfig {
        /**
         * Can be used to modify the path which is returned.
         */
        static resourceLocator: IResourceLocator;
        static viewModelFactory: IViewModelFactory;
        /**
         * Passed to the constructor of the view model (and in the IActivationContext);
         */
        static applicationScope: {};
    }
}
