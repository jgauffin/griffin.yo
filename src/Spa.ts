/// <reference path="Routing.ts"/>
/// <reference path="Spa.ViewModels.ts"/>

module Griffin.Yo.Spa {
    import Routing = Yo.Routing;
    import ViewTargets = Yo.Routing.ViewTargets;
    import ViewModels = Yo.Spa.ViewModels;
    import Dom = Yo.Dom;
    import Views = Yo.Views;
    import Net = Yo.Net;

    /**
 * Used when views (html) and view models (js) should be loaded.
 * Default implementation fetches them from the server.
 */
    export interface IResourceLocator {
        getHtml(section: string): string;
        getScript(section: string): string;
    }


    export class Config {
        /**
 * Can be used to modify the path which is returned.
 */
        static resourceLocator: IResourceLocator;
        static viewModelFactory: ViewModels.IViewModelFactory;

        /**
         * Attach your application specific information to this property.
         */
        static applicationScope: any = {};
    }

    /**
 * Executes a specific route (i.e. loads the view model and view from the server, caches them and finally executes the VM).
 */
    export class RouteRunner implements Routing.IRouteHandler {
        private html: string;
        private viewModelScript: string;
        private viewModel: ViewModels.IViewModel;
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

        static replaceAll(str: string, replaceWhat: string, replaceTo: string): string {
            replaceWhat = replaceWhat.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            const re = new RegExp(replaceWhat, "g");
            return str.replace(re, replaceTo);
        }

        private applyRouteDataToLinks(viewElement: HTMLElement, routeData: any) {
            const links = viewElement.querySelectorAll("a");
            for (let i = 0; i < links.length; i++) {
                const link = <HTMLAnchorElement>links[i];

                let pos = link.href.indexOf("#");
                if (pos === -1 || link.href.substr(pos + 1, 1) !== "/") {
                    continue;
                }
                for (let dataName in routeData) {
                    if (routeData.hasOwnProperty(dataName)) {
                        var after = RouteRunner.replaceAll(link.href, `:${dataName}`, routeData[dataName]);
                        var before = link.href;
                        link.href = RouteRunner.replaceAll(link.href, `:${dataName}`, routeData[dataName]);
                    }
                }

            }
        }

        private moveNavigationToMain(viewElement: HTMLElement, context: any) {
            const navigations = viewElement.querySelectorAll("[data-navigation]");
            for (let i = 0; i < navigations.length; i++) {
                const nav = <HTMLElement>navigations[i];
                const target = nav.getAttribute("data-navigation");
                const targetElem = document.getElementById(target);
                if (!targetElem)
                    throw new Error(`Failed to find target element '${target}' for navigation '${nav.innerHTML}'`);


                var ifStatement = nav.getAttribute("data-if");
				if (!ifStatement){
					continue;
				}
				
                var ifResult = this.evalInContext(ifStatement, context);
                if (!ifResult) {
                    nav.parentNode.removeChild(nav);
                    continue;
                }
                this.removeConditions(nav, context);

                Dom.ElemUtils.removeChildren(targetElem);
                Dom.ElemUtils.moveChildren(nav, targetElem);
            }
        }

        private removeConditions(elem: HTMLElement, context: any) {
            for (var i = 0; i < elem.childElementCount; i++) {
                var child = elem.children[i];
				if (!child.hasAttribute("data-if")) {
					continue;
				}
				
                var ifStatement = child.getAttribute("data-if");
				if (!ifStatement) {
					continue;
				}
				
                var ifResult = this.evalInContext(ifStatement, context);
                if (!ifResult) {
                    child.parentNode.removeChild(child);
                    continue;
                }
            }

        }

        private evalInContext(code: string, context: any) {
            var func = function(js: string) {
                return eval("with (this) { " + js + "}");
            };
            return func.call(context, code);
        }

        private isIE() {
            var myNav = navigator.userAgent.toLowerCase();
            return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
        }

        invoke(ctx: Routing.IRouteExecutionContext): void {
			var self = this;
            this.ensureResources(() => {
                var viewElem = document.createElement("div");
                viewElem.className = "ViewContainer";
                viewElem.innerHTML = this.html;


                //add script
                var scriptElem = document.createElement("script");
                scriptElem.setAttribute("type", "text/javascript");
                scriptElem.setAttribute("data-tag", "viewModel");
                ctx.target.attachViewModel(scriptElem);
                if (this.isIE() <= 9) {
                    scriptElem.text = this.viewModelScript;
                } else {
                    scriptElem.innerHTML = this.viewModelScript;
                }

                //load model and run it
                var className = (this.section.replace(/\//g, ".") + "ViewModel");
                this.viewModel = Config.viewModelFactory.create(this.applicationName, className);
                var vm = this.viewModel;

                if (vm.hasOwnProperty("getTargetOptions")) {
                    var options = (<any>vm)["hasTargetOptions"]();
                    ctx.target.assignOptions(options);
                } else {
                    ctx.target.assignOptions({});
                }

                //move nav etc.
                this.applyRouteDataToLinks(viewElem, ctx.routeData);
                this.moveNavigationToMain(viewElem, { model: this.viewModel, ctx: ctx });

                var activationContext = {
                    routeData: ctx.routeData,
                    viewContainer: viewElem,
                    render(data: any, directives?: any) {
                        const r = new Griffin.Yo.Views.ViewRenderer(viewElem);
                        r.render(data, directives);
                    },
                    readForm(selector: HTMLElement | string): any {
                        var reader = new Dom.FormReader(selector);
                        return reader.read();
                    },
                    renderPartial(selector: string, data: any, directives?: any) {
                        const selector1 = new Dom.Selector(viewElem);
                        const target = selector1.one(selector);
                        const r = new Griffin.Yo.Views.ViewRenderer(target);
                        r.render(data, directives);
                    },
                    resolve() {
                        document.title = vm.getTitle();

                        ctx.target.setTitle(vm.getTitle());
                        ctx.target.render(viewElem);
                        const scripts = viewElem.getElementsByTagName("script");
                        const loader = new ScriptLoader();
                        for (var i = 0; i < scripts.length; i++) {
                            loader.loadTags(scripts[i]);
                        }

                        const allIfs = viewElem.querySelectorAll("[data-if]");
                        for (let j = 0; j < allIfs.length; j++) {
                            let elem = allIfs[j];
							var condition = elem.getAttribute("data-if");
							
							//if can also be used during the rendering loop
							if (condition.substr(0,3) != 'vm.' && condition.substr(0,6) != 'model.' && condition.substr(0,4) != 'ctx.') {
								continue;
							}
							
							//model is for backwards compability.
                            let result = self.evalInContext(condition, { model: vm, ctx: ctx, vm:vm });
                            if (!result) {
                                elem.parentNode.removeChild(elem);
                            }
                        }

						const allUnless = viewElem.querySelectorAll("[data-unless]");
                        for (let j = 0; j < allUnless.length; j++) {
                            let elem = allUnless[j];
							var condition = elem.getAttribute("data-unless");
							
							//if can also be used during the rendering loop
							if (condition.substr(0,3) != 'vm.' && condition.substr(0,6) != 'model.' && condition.substr(0,4) != 'ctx.') {
								continue;
							}
							
							//unless is flux. for instance haveRows = true means that we should execute, i.e. remove the node
							//so don't change the if statement to false.
                            let result = self.evalInContext(condition, { ctx: ctx, vm:vm });
                            if (result) {
                                elem.parentNode.removeChild(elem);
                            }
                        }

                    },
                    reject() {
                        //TODO: Fail?
                    },
                    handle: new Dom.EventMapper(viewElem),
                    select: new Dom.Selector(viewElem),
                    applicationScope: Config.applicationScope
                };

                this.viewModel.activate(activationContext);
            });
        }



        private ensureResources(callback: () => void) {
            var bothPreloaded = true;
            var self = this;
            if (typeof this.html === "undefined") {
                const path = Config.resourceLocator.getHtml(this.section);
                Net.Http.get(path, (xhr, success) => {
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
                const path = Config.resourceLocator.getScript(this.section);
                Net.Http.get(path, (xhr, success) => {
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


    export class ScriptLoader {
        private pendingScripts: HTMLScriptElement[] = [];
        private embeddedScripts: HTMLScriptElement[] = [];
        private container: HTMLElement;
        static dummyScriptNode: any;


        constructor(container: HTMLElement = document.head) {
            this.container = container;
            if (!ScriptLoader.dummyScriptNode)
                ScriptLoader.dummyScriptNode = document.createElement("script");
        }
        private stateChange() {
            if (this.pendingScripts.length === 0) {
                if (console && console.log)
                    console.log("Got ready state for a non existent script: ", this);
                return;
            }

            var firstScript = <any>this.pendingScripts[0];
            while (firstScript && firstScript.readyState === "loaded") {
                firstScript.onreadystatechange = null;
                this.container.appendChild(firstScript);

                this.pendingScripts.shift();
                firstScript = <any>this.pendingScripts[0];
            }
            if (this.pendingScripts.length === 0) {
                this.runEmbeddedScripts();
            }
        }

        public loadSources(scripts: string | string[]) {
            if (scripts instanceof Array) {
                for (var i = 0; i < scripts.length; i++) {
                    this.loadSource(scripts[i]);
                }
            } else {
                this.loadSource(<string>scripts);
            }
        }

        public loadTags(scripts: HTMLScriptElement | HTMLScriptElement[]) {
            if (scripts instanceof Array) {
                for (var i = 0; i < scripts.length; i++) {
                    this.loadElement(scripts[i]);
                }
            } else {
                this.loadElement(<HTMLScriptElement>scripts);
            }

            if (this.pendingScripts.length === 0) {
                this.runEmbeddedScripts();
            }
        }



        private loadSource(source: string) {
            if ("async" in ScriptLoader.dummyScriptNode) { // modern browsers
                let script = document.createElement("script");
                script.async = false;
                this.pendingScripts.push(script);
                script.addEventListener("load", e => this.onScriptLoaded(script));
                script.src = source;
                this.container.appendChild(script);
            }
            else if (ScriptLoader.dummyScriptNode.readyState) { // IE<10
                let script = <any>document.createElement("script");
                this.pendingScripts.push(script);
                script.onreadystatechange = this.stateChange;
                script.src = source;
            }
            else { // fall back to defer
                let script = document.createElement("script");
                script.defer = true;
                this.pendingScripts.push(script);
                script.addEventListener("load", e => this.onScriptLoaded(script));
                script.src = source;
                this.container.appendChild(script);
                //document.write('<script src="' + source + '" defer></' + 'script>');
            }
        }

        private loadElement(tag: HTMLScriptElement) {
            if (tag.src) {
                this.loadSource(tag.src);
                return;
            }

            let script = document.createElement("script");
            script.text = tag.text;
            this.embeddedScripts.push(script);
        }

        onScriptLoaded(script: HTMLScriptElement) {
            this.pendingScripts.pop();
            if (this.pendingScripts.length === 0) {
                this.runEmbeddedScripts();
            }

        }

        runEmbeddedScripts() {
            for (var i = 0; i < this.embeddedScripts.length; i++) {
                this.container.appendChild(this.embeddedScripts[i]);
            }
            while (this.embeddedScripts.length > 0) {
                this.embeddedScripts.pop();
            }
        }
    }

    /**
 * Facade for the SPA handling
 */
    export class SpaEngine {
        private router = new Routing.Router();
        //private handlers: RouteRunner[] = [];
        private basePath = "";
        private applicationScope = {};
        private viewTargets: Routing.IViewTarget[] = [];
        private defaultViewTarget: Routing.IViewTarget;

        /**
         * Create Spa.
         * @param applicationName Only used for namespacing of VMs
         */
        constructor(public applicationName: string) {
            this.basePath = window.location.pathname;
            this.defaultViewTarget = new ViewTargets.ElementViewTarget("#YoView");
        }

        /**
         * Add a new target that views can be rendered in.
         * @param name Name of the target (should be used when mapping routes)
         * @param target Either a class that implements Routing.IViewTarget or a string pointing on an element id.
         */
        addTarget(name: string, target: Routing.IViewTarget | string) {
            if (typeof (target) === "string") {
                var id = <string>target;
                if (id.substr(0, 1) != '#')
                    throw new Error("Element id must start with #.");
                target = new Griffin.Yo.Routing.ViewTargets.ElementViewTarget(id);
            }

            let target2 = <Routing.IViewTarget>target;
            target2.name = name;
            console.log('adding view target');
            this.viewTargets.push(target2);
        }

        /**
         * Navigate to another view.
         * @param URL Everything after the hash in the complete URI, like 'user/1'
         * @param targetElement If the result should be rendered somewhere else than the main layout div.
         */
        navigate(url: string, targetElement?: any) {
            this.router.execute.apply(this.applicationScope, [url, targetElement]);
        }

        /**
         * Map a route
         * @param route Route string like 'user/:userId'
         * @param section Path and name of view/viewModel. 'users/index' will look for '/ViewModels/Users/IndexViewModel' and '/Views/Users/Index.html'
         * @param target Name of the target where the result should get rendered. not specified = default location;
         */
        mapRoute(route: any, section: string, target?: string) {
            const runner = new RouteRunner(section, this.applicationName);
            //this.handlers[section] = runner;

            var targetObj: Routing.IViewTarget;
            if (!target) {
                targetObj = this.defaultViewTarget;
            } else {
                for (var i = 0; i < this.viewTargets.length; i++) {
                    if (this.viewTargets[i].name === target) {
                        targetObj = this.viewTargets[i];
                        break;
                    }
                }
                if (!targetObj) {
                    throw `Could not find view target "${target}".`;
                }
            }

            this.router.add(route, runner, targetObj);
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
                var hash = window.location.hash;

                // back button to root page.
                if (!hash) {
                    hash = '#/';
                }

                // allow regular hash links on pages
                // by required hashbangs (#/!) or just hash'slash'em (#/)
                if (hash.substr(1, 1) !== "/")
                    return;

                // remove shebang
                var changedUrl = hash.substr(2);
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
            const test = (<any>f)[1].trim().split(/\s*,\s*/);
        }
    }



    Config.resourceLocator = {
        getHtml(section): string {
            let path = window.location.pathname;
            if (window.location.pathname.indexOf(".") > -1) {
                const pos = window.location.pathname.lastIndexOf("/");
                path = window.location.pathname.substr(0, pos);
            }
            if (path.substring(-1, 1) === "/") {
                path = path.substring(0, path.length - 1);
            }
            return path + `/Views/${section}.html`;
        },
        getScript(section): string {
            let path = window.location.pathname;
            if (window.location.pathname.indexOf(".") > -1) {
                const pos = window.location.pathname.lastIndexOf("/");
                path = window.location.pathname.substr(0, pos);
            }
            if (path.substring(-1, 1) === "/") {
                path = path.substring(0, path.length - 1);
            }
            return path + `/ViewModels/${section}ViewModel.js`;
        }
    };

    Config.viewModelFactory = {
        create(applicationName: string, fullViewModelName: string): ViewModels.IViewModel {
            const viewModelConstructor = ViewModels.ClassFactory.getConstructor(applicationName, fullViewModelName);
            return <ViewModels.IViewModel>new viewModelConstructor(Config.applicationScope);
        }
    };
}
