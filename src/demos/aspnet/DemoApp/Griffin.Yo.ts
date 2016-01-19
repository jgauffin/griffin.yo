// Do not modify this file! It's genEraTeD!
//
// Modifications should be done in the lib\ folder.
//
// If you know how to change all files so that everything can be generated as a single file (or for commonJs/AMD) 
// I would be really happy. Because I gave up and built the tool in the Packager folder. Run it if you modify any of the scripts.
// A bit cumbersome, but WTF do you do when you have spend hours and hours trying to figure out the module management in Typescript?


module Griffin.Yo {


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
		request.open("GET", url, true);
		if (typeof this.cache[url] !== "undefined") {
			const cache = this.cache[url];
			request.setRequestHeader("If-Modified-Since", cache.modifiedAt);
		}
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
					request["responseJson"] = JSON.parse(request.responseText);
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


	/**
	 * POST a resource to the server
	 * @param url Server resource to post to
	 * @param callback Invoked once the response is received from the server (or when something fails).
	 * @param options Additional configuration
	 */
	static post(url: string, data: any, callback: (name: XMLHttpRequest, success: boolean) => void, options?: IHttpOptions): void {
		if (!data) {
			throw new Error("You must specify a body when using POST.");
		}
		Http.invokeRequest('POST', url, data, callback, options);
	}

	/**
	 * PUT a resource to the server
	 * @param url Server resource to post to
	 * @param callback Invoked once the response is received from the server (or when something fails).
	 * @param options Additional configuration
	 */
	static put(url: string, data: any, callback: (name: XMLHttpRequest, success: boolean) => void, options?: IHttpOptions): void {
		if (!data) {
			throw new Error("You must specify a body when using PUT.");
		}
		Http.invokeRequest('PUT', url, data, callback, options);
	}


	/**
	 * DELETE a resource on the server
	 * @param url Server resource to post to
	 * @param callback Invoked once the response is received from the server (or when something fails).
	 * @param options Additional configuration
	 */
	static delete(url: string, callback: (name: XMLHttpRequest, success: boolean) => void, options?: IHttpOptions): void {
		Http.invokeRequest('DELETE', url, null, callback, options);
	}


	/**
	 * Make an HTTP request
	 * @param verb HTTP verb
	 * @param url Server resource to make a request to
	 * @param data null if no body should be sent
	 * @param callback Invoked once the response is received from the server (or when something fails).
	 * @param options Additional configuration
	 */
	static invokeRequest(verb: string, url: string, data: any, callback: (name: XMLHttpRequest, success: boolean) => void, options?: IHttpOptions): void {
		if (!verb) {
			throw new Error("You must specify a HTTP verb");
		}

		if (options && options.userName && !options.password) {
			throw new Error("You must provide password when username has been specified.");
		}

		var request = new XMLHttpRequest();
		if (options && options.userName) {
			request.open(verb, url, true, options.userName, options.password);
		} else {
			request.open(verb, url, true);
		}
		

		var requestContentType = "application/json";
		if (options && options.contentType) {
			requestContentType = options.contentType;
		}

		if (options && options.headers) {
			for (let key in options.headers) {
				request.setRequestHeader(key, options.headers[key]);
			}
		}


		request.onload = () => {
			if (request.status >= 200 && request.status < 400) {
				var contentType = request.getResponseHeader("content-type").toLocaleLowerCase();
				if (contentType === "application/json") {
					//this doesn't work in IE
					request.responseBody = JSON.parse(request.responseText);

					//for IE
					request["responseJson"] = JSON.parse(request.responseText);
				}
				callback(request, true);
			} else {
				callback(request, false);
			}
		};

		request.onerror = () => {
			callback(request, false);
		};

		if (typeof data !== "undefined" && data !== null) {
			request.setRequestHeader("Content-Type", requestContentType);
			if (requestContentType === "application/json" && typeof (data) !== "string") {
				data = JSON.stringify(data);
			}
			request.send(data);
		} else {
			request.send();
		}

	}
}

/** Options for requests */
export interface IHttpOptions {

	/** Can contain headers (key: value) */
	headers?: any;
	
	/** Content type if something other than application/json */
	contentType?: string;
	
	/** User name if authentication should be used */
	userName?: string;
	
	/** Required when userName is specified */
	password?: string;
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

/**
 * Used when views (html) and view models (js) should be loaded.
 * Default implementation fetches them from the server.
 */
export interface IResourceLocator {
	getHtml(section: string): string;
	getScript(section: string): string;
}

/**
 * Executes a specific route (i.e. loads the view model and view from the server, caches them and finally executes the VM).
 */
export class RouteRunner implements IRouteHandler {
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
			var ifResult = !ifStatement || !this.evalInContext(ifStatement, context);
			if (!ifResult) {
				nav.parentNode.removeChild(nav);
				continue;
			}
			this.removeConditions(nav, context);

			DomUtils.removeChildren(targetElem);
			DomUtils.moveChildren(nav, targetElem);
		}
	}

	private removeConditions(elem: HTMLElement, context: any) {
		for (var i = 0; i < elem.childElementCount; i++) {
			var child = elem.children[i];
			var ifStatement = child.getAttribute("data-if");
			var ifResult = !ifStatement || !this.evalInContext(ifStatement, context);
			if (!ifResult) {
				child.parentNode.removeChild(child);
				continue;
			}
		}

	}

	private evalInContext(code: string, context: any) {
		var func = function (js) {
			return eval("with (this) { " + js + "}");
		};
		return func.call(context, code);
	}

    private isIE() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }
    
	invoke(ctx: IRouteExecutionContext): void {
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
			this.viewModel = GlobalConfig.viewModelFactory.create(this.applicationName, className);
			var vm = this.viewModel;
		  
			if (vm.hasOwnProperty("getTargetOptions")) {
				var options = vm["hasTargetOptions"]();
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
					const r = new ViewRenderer(viewElem);
					r.render(data, directives);
				},
                readForm(selector:HTMLElement|string): any{
                    var reader = new FormReader(selector);
                    return reader.read();
                },
				renderPartial(selector: string, data: any, directives?: any) {
					const selector1 = new Selector(viewElem);
					const target = selector1.one(selector);
					const r = new ViewRenderer(target);
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
						let value = elem.nodeValue;
						let result = this.evalInContext(value, { model: this.viewModel, ctx: ctx });
						if (!result) {
							elem.parentNode.removeChild(elem);
						}
					}

				},
				reject() {
					//TODO: Fail?
				},
				handle: new EventMapper(viewElem),
				select: new Selector(viewElem),
				applicationScope: GlobalConfig.applicationScope
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

	public loadSources(scripts: string|string[]) {
		if (scripts instanceof Array) {
			for (var i = 0; i < scripts.length; i++) {
				this.loadSource(scripts[i]);
			}
		} else {
			this.loadSource(<string>scripts);
		}
	}

	public loadTags(scripts: HTMLScriptElement|HTMLScriptElement[]) {
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
		while (this.embeddedScripts.length>0) {
			this.embeddedScripts.pop();
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
	private applicationScope = {};
	private viewTargets : IViewTarget[] = [];
	private defaultViewTarget: IViewTarget;

	/**
	 * Create Spa.
	 * @param applicationName Only used for namespacing of VMs
	 */
	constructor(public applicationName: string) {
		this.basePath = window.location.pathname;
		this.defaultViewTarget = new ElementViewTarget("#YoView");
	}

	addTarget(name: string, target: IViewTarget) {
		target.name = name;
		this.viewTargets.push(target);
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
		this.handlers[section] = runner;

		var targetObj: IViewTarget;
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
		const test = f[1].trim().split(/\s*,\s*/);
	}
}

declare var $;

/**
 * Render view into a parent element
 */
export class BootstrapModalViewTarget implements IViewTarget {

	private currentNode: BootstrapModalViewTargetRequest;

	/**
	 * Name is 'BootstrapModal'
	 */
	public name = "BootstrapModal";

	/**
	 * 
	 * @param options {buttons: [{title: 'Ok', callback:function(viewElement)}]
	 * @returns {} 
	 */
	assignOptions(options: any) {
		
		//var body = this.node.querySelector('.modal-body');
		//while (body.firstChild)
		//    body.removeChild(body.firstChild);

		//var footer = this.node.querySelector('.modal-footer');
		//while (footer.firstChild)
		//    footer.removeChild(footer.firstChild);

		//if (options && options.buttons) {
		//    options.buttons.forEach(function (item) {
		//        var button = document.createElement('button');
		//        if (item.className) {
		//            button.setAttribute('class', 'btn ' + item.className);
		//        } else {
		//            button.setAttribute('class', 'btn btn-default');
		//        }

		//        button.setAttribute('data-dismiss', 'modal');
		//        button.innerText = item.title;
		//        button.addEventListener('click', e => {
		//            item.callback(body.firstElementChild);
		//        });
		//        footer.appendChild(button);
		//    });
		//}

	}

	attachViewModel(script: HTMLScriptElement) {
		this.currentNode = new BootstrapModalViewTargetRequest(this.name);
		this.currentNode.attachViewModel(script);
	}

	setTitle(title: string) {
		this.currentNode.setTitle(title);
	}
	/**
	 * Will remove innerHTML and append the specified element as the first child.
	 * @param element generated view
	 */
	public render(element: HTMLElement) {
		this.currentNode.render(element);

		//and release
		this.currentNode = null;
	}
}
/** Load view in a Boostrap modal
 */
export class BootstrapModalViewTargetRequest {
	private node: HTMLElement;
	private name: string;
	private modal: any;

	constructor(name : string) {
		this.name = name;
		this.node = document.createElement('div');
		this.node.setAttribute('id', this.name);
		this.node.setAttribute('class', 'modal fade view-target');
		this.node.setAttribute('role', 'dialog');
		document.body.appendChild(this.node);


		var contents = '\r\n' +
			'  <div class="modal-dialog">\r\n' +
			'\r\n' +
			'    <div class="modal-content">\r\n' +
			'      <div class="modal-header">\r\n' +
			'        <button type="button" class="close" data-dismiss="modal">&times;</button>\r\n' +
			'        <h4 class="modal-title"></h4>\r\n' +
			'      </div>\r\n' +
			'      <div class="modal-body">\r\n' +
			'        \r\n' +
			'      </div>\r\n' +
			'      <div class="modal-footer">\r\n' +
			'        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\r\n' +
			'      </div>\r\n' +
			'    </div>\r\n' +
			'\r\n' +
			'  </div>\r\n' +
			'';
		this.node.innerHTML = contents;

	}

	/**
	 * 
	 * @param options {buttons: [{title: 'Ok', callback:function(viewElement)}]
	 * @returns {} 
	 */
	prepare(options: any) {
		var body = this.node.querySelector('.modal-body');
		while (body.firstChild)
			body.removeChild(body.firstChild);

		var footer = this.node.querySelector('.modal-footer');
		while (footer.firstChild)
			footer.removeChild(footer.firstChild);

		if (options && options.buttons) {
			options.buttons.forEach(function (item) {
				var button = document.createElement('button');
				if (item.className) {
					button.setAttribute('class', 'btn ' + item.className);
				} else {
					button.setAttribute('class', 'btn btn-default');
				}

				button.setAttribute('data-dismiss', 'modal');
				button.innerText = item.title;
				button.addEventListener('click', e => {
					item.callback(body.firstElementChild);
				});
				footer.appendChild(button);
			});
		}

	}

	attachViewModel(script: HTMLScriptElement) {
		this.node.querySelector('.modal-body').appendChild(script);
	}

	setTitle(title: string) {
		(<HTMLElement>this.node.querySelector('.modal-title')).innerText = title;
	}
	/**
	 * Will remove innerHTML and append the specified element as the first child.
	 * @param element generated view
	 */
	public render(element: HTMLElement) {
		this.node.querySelector('.modal-body').appendChild(element);
		var footer = this.node.querySelector('.modal-footer');

		this.modal = $(this.node).modal();
		$(this.modal).on('hidden.bs.modal', () => {
			this.modal.modal('hide').data('bs.modal', null);
			this.node.parentElement.removeChild(this.node);
		});

		var buttons = element.querySelectorAll('button,input[type="submit"],input[type="button"]');
		if (buttons.length > 0) {
			while (footer.firstChild) {
				footer.removeChild(footer.firstChild);
			}
			for (var i = 0; i < buttons.length; i++) {
				(<HTMLElement>buttons[i]).className += ' btn';
				(<HTMLElement>buttons[i]).addEventListener('click', e => {
					this.modal.modal('hide');
					if ((buttons[i].tagName == "input" && buttons[i].type !== "submit") || buttons[i].hasAttribute("data-dismiss")){
						window.history.go(-1);
					}
				});
				footer.appendChild(buttons[i]);
			}
			if (buttons.length === 1) {
				(<HTMLElement>buttons[0]).className += ' btn-primary';
			} else {
				(<HTMLElement>buttons[0]).className += ' btn-primary';
				(<HTMLElement>buttons[buttons.length - 1]).className += ' btn-cancel';
			}
		}


		this.modal.modal('show');
	}
}
/**
 * Render view into a parent element
 */
export class ElementViewTarget implements IViewTarget {
	private container: HTMLElement;

	/**
	 * 
	 * @param elementOrId Element to render view in
	 * @returns {} 
	 */
	constructor(elementOrId: string|HTMLElement) {
		if (typeof elementOrId === "string") {
			this.container = document.getElementById(elementOrId.substr(1));
			if (!this.container) {
				throw `Could not locate "${elementOrId}"`;
			}
		} else {
			this.container = elementOrId;
		}

		this.name = this.container.id;
	}

	/**
	 * Id attribute of the container element.
	 */
	public name = "";

	assignOptions() {
		
	}

	attachViewModel(script: HTMLScriptElement) {
		this.container.appendChild(script);
	}

	setTitle(title: string) {
		
	}
	/**
	 * Will remove innerHTML and append the specified element as the first child.
	 * @param element generated view
	 */
	public render(element: HTMLElement) {
		//delete everything but our view model script.
		while (this.container.firstElementChild && this.container.firstElementChild.nextElementSibling != null)
			this.container.removeChild(this.container.firstElementChild);

		this.container.innerHTML = "";
		this.container.appendChild(element);
	}
}
export class ClassFactory
{
	//credits: http://stackoverflow.com/a/2441972/70386
	public static getConstructor(appName: string, viewModelModuleAndName: string): any {
		const nameParts = viewModelModuleAndName.split(".");
		let fn = (window[appName] || this[appName]);
		if (typeof fn === "undefined") {
			throw new Error(`Failed to load application namespace "${appName}". Have a view model been loaded successfully?`);
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
				throw new Error(`Could not find "${nameParts[i]}" from viewModel name, complete name: "${appName}.${viewModelModuleAndName}".`);

			fn = fn[foundName];
		}

		if (typeof fn !== "function") {
			throw new Error(`Could not find view model ${viewModelModuleAndName}`);
		}
		return fn;
	}
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
	 * @param viewSelector Id/Selector for the part to update
	 * @param data data to populate the part with
	 * @param directives directives that adopts the data to fit the view.
	 */
	renderPartial(viewSelector: string, data: any, directives?: any);

    /**
     * Read a form from your view
     * @param viewSelector Either a "data-name"/"id" or a HTMLElement that contains the form to read
     * @return A JSON object
     */
    readForm(viewSelector: string|HTMLElement);

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
	applicationScope:any;
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
 * Implement if you would like to control how view models are created.
 * The script containing the view model have been loaded before this interface
 * is being called. 
 */
export interface IViewModelFactory {
	create(applicationName: string, fullViewModelName: string): IViewModel;
}

export class DomUtils {
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

	static getIdentifier(e: HTMLElement): string {
		if (e.id)
			return e.id;

		var name = e.getAttribute("name");
		if (name != null)
			return name;

		name = e.getAttribute("data-name");
		if (name != null)
			return name;

		var attrs = '';
		for (var i = 0; i < e.attributes.length; i++) {
			attrs = attrs + e.attributes[i].name + "=" + e.attributes[i].value + ",";
		}

		return e.tagName + "[" + attrs.substr(0, attrs.length - 1) + "]";
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
export class FormReader {
	private container: HTMLElement;
	private stack: string[] = [];
	constructor(elemOrName: HTMLElement|string) {
		if (typeof elemOrName === "string") {
			this.container = <HTMLElement>document.querySelector('#' + elemOrName + ",[data-name=\"" + elemOrName + "\"]");
			if (!this.container) {
				throw new Error("Failed to locate '" + elemOrName + "'.");
			}
		} else {
			this.container = elemOrName;
		}
	}

	public read(): any {
		var motherObject = {};
		for (let i = 0; i < this.container.childElementCount; i++) {
			var element = <HTMLElement>this.container.children[i];
			var name = this.getName(element);

			//no name, maybe got nested data
			if (!name) {
				var data = this.pullElement(element);
				if (data) {
                    this.appendObject(motherObject, data);
				}
				continue;
			}

			var childValue;
			if (this.isCollection(element)) {
				childValue = this.pullCollection(element);
			} else {
				childValue = this.pullElement(element);
                childValue = this.adjustCheckboxes(element, motherObject, childValue);
			}
			this.assignByName(name, motherObject, childValue);
		}

		return motherObject;
	}

	private pullCollection(container: HTMLElement): any {
		var arr = [];
		var currentArrayItem = {};
		var addedItems = [];
		var currentIndexer = null;
		for (let i = 0; i < container.childElementCount; i++) {
			var elem = <HTMLElement>container.children[i];
			var name = this.getName(elem);
			if (!name) {
				var value = this.pullElement(elem);
				if (!this.isObjectEmpty(value)) {
					if (!this.isObjectEmpty(currentArrayItem)) {
						arr.push(currentArrayItem);
					}
					arr.push(value);
					currentArrayItem = {};
					addedItems = [];
				}
				continue;
			}

			// theese can be repeated for the same item
			// so ignore them when processing DOM
			var isOptionOrCheckbox = elem.getAttribute('type') === 'checkbox'
								  || elem.getAttribute('type') === 'radio';

			//keep track of input names
			//so that we can detect when a new item is started.
			if (name !== '[]'
				&& addedItems.indexOf(name) >= 0
				&& !isOptionOrCheckbox) {
				arr.push(currentArrayItem);
				currentArrayItem = {};
				addedItems = [];
			}
			addedItems.push(name);

			var value;
			if (this.isCollection(elem)) {
				value = this.pullCollection(elem);
			} else {
				value = this.pullElement(elem);
				if (value === null) {
					continue;
				}
			}

			//only want a single value array
			if (name === '[]') {
				arr.push(value);
			} else {
				this.assignByName(name, currentArrayItem, value);
			}
		}

		if (!this.isObjectEmpty(currentArrayItem)) {
			arr.push(currentArrayItem);
		}

		return arr;
	}


	private pullElement(container: HTMLElement): any {
		if (container.childElementCount === 0) {
			if (container.tagName == 'SELECT') {
				var select = <HTMLSelectElement>container;
				if (select.selectedIndex == -1) {
					return null;
				}
				let value1 = select.options[select.selectedIndex];
				return this.processValue(value1);
			} else if (container.tagName == 'INPUT') {
				var input = <HTMLInputElement>container;
				var typeStr = container.getAttribute('type');
				if (typeStr === 'radio' || typeStr ==='checkbox') {
					if (input.checked) {
						return this.processValue(input.value);
					}
					return null;
				}
				return this.processValue(input.value);
			} else {
				let value3 = container.getAttribute('value') || '';
				return this.processValue(value3);
			}
		}

		var data = {};
		for (let i = 0; i < container.childElementCount; i++) {
			var element = <HTMLElement>container.children[i];
			var name = this.getName(element);
			if (!name) {
				var value = this.pullElement(element);
				if (!this.isObjectEmpty(value)) {
					this.appendObject(data, value);
				}
				continue;
			}
			var value;

			if (this.isCollection(element)) {
				value = this.pullCollection(element);
			} else {
				value = this.pullElement(element);
                value = this.adjustCheckboxes(element, data, value);
				if (value === null) {
					continue;
				}
			}
			this.assignByName(name, data, value);
		}

		return this.isObjectEmpty(data) ? null : data;
	}

    private adjustCheckboxes(element: HTMLElement, dto: any, value: any): any {
        //checkboxes should be arrays
        if (value !== null && element.tagName === "INPUT" && element.getAttribute("type") === "checkbox") {
            //todo: fetch value using dot notation.
            var name = this.getName(element);
            var currentValue = dto[name];
            if (typeof currentValue !== "undefined") {
                if (currentValue instanceof Array) {
                    currentValue["push"](value);
                    value = currentValue;
                }
                else {
                    value = [currentValue, value];
                }
            }
            else {
                value = [value];
            }
        }

        return value;
    }
	private processValue(value: string): any {
		if (!isNaN(<any>value)) {
			return parseInt(value, 10);
		} else if (value == 'true') {
			return true;
		} else if (value == 'false') {
			return false;
		} 

		return value;
	}
	private assignByName(name: string, parentObject: any, value: any) {
		var parts = name.split('.');
		var obj = parentObject;
		var parent = parentObject;
		var lastKey = '';
		parts.forEach(key => {
			lastKey = key;
			if (!obj.hasOwnProperty(key)) {
				obj[key] = {};
			}
			parent = obj;
			obj = obj[key];
		});
		parent[lastKey] = value;
	}

	private appendObject(target: any, extras: any) {
		for (var key in extras) {
			if (!target.hasOwnProperty(key)) {
				target[key] = extras[key];
			}
		}
	}
	private isObjectEmpty(data: any): boolean {
		for (var name in data) {
			if (data.hasOwnProperty(name)) {
				return false;
			}
		}

		return true;
	}
	private getName(el: HTMLElement): string {
		return el.getAttribute('name') || el.getAttribute('data-name') || el.getAttribute('data-collection');
	}

	private isCollection(el: HTMLElement): boolean {
		return el.hasAttribute('data-collection');
	}
}

export interface IViewDirectiveContext {
	activationContext: IActivationContext;
	model: IViewModel;
	view: HTMLElement;
	execute(code: string, customContext: any):any;
};

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
	setTitle(title: string);

	/**
	 * The container to use when doing context selections (querySelector) in the view model logic.
	 */
	//getSelectionContainer():HTMLElement;

	/**
	 * Prepare the target for a new view model (and view).
	 * @param options Options specific for the implementation
	 * Invoked after attachViewModel
	 */
	assignOptions(options:any);

	/**
	 * Attach the view model script (so that it get loaded into the DOM).
	 * @param script View model
	 */
	attachViewModel(script: HTMLScriptElement);

	/**
	 * Render element into the target
	 * @param element Element containing the view (result generated with the help of the view model)
	 * 
	 * Invoked once the view model has been run and generated a view.
	 */
	render(element:HTMLElement):void;
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
		if (idOrselector.substr(0, 1) === "#") {
			let el2 = this.scope.querySelector(idOrselector);
			if (!el2) {
				throw new Error(`Failed to find element '${idOrselector}'.`);
			}
			return <HTMLElement>el2;
		}

		if (idOrselector.match(/[\s\.\,\[]+/g) === null) {
			var result = this.scope.querySelector(`[data-name='${idOrselector}'],[data-collection='${idOrselector}'],[name="${idOrselector}"],#${idOrselector}`);
			if (result)
				return result;
		}
		var item = <HTMLElement>this.scope.querySelector(idOrselector);
		if (!item)
			throw Error(`Failed to find "${idOrselector}".`);
		return item;
	}

	all(selector: string): HTMLElement[] {
		const result: HTMLElement[] = [];

		const items = selector.match("[\s\.,\[]+").length === 0
			? this.scope.querySelectorAll(`[data-name="${selector}"],[data-collection='${selector}'],[name="${selector}"],#${selector}`)
			: this.scope.querySelectorAll(selector);
		for (let i = 0; i < items.length; i++) {
			result.push(<HTMLElement>items[i]);
		}
		return result;
	}

}

/** Renders views using js/json objects.
 * 
 * This renderer can render objects into views by identifying tags with the help of the attributes "name" (for forms), "data-name" for containers/single value and "data-collection" for collections.
 * 
 * The rendering can be controlled by 
 */
export class ViewRenderer {
	private container: HTMLElement;
	private lineage: string[] = [];
	private dtoStack: any[] = [];
	private directives: IViewRenderDirective[] = [];
	private static globalValueDirectives: IViewRenderDirective[] = [];

	/**Create a new instance
	 * @param elemOrName Either a HTML element or an identifier (value of attribute "id" or "data-name").
	 * @class
	 * 
	 * 
	 */
	constructor(elemOrName: HTMLElement|string) {
		if (typeof elemOrName === "string") {
			if (elemOrName.substr(0,1) === "#") {
				this.container = document.getElementById(elemOrName.substr(1));
			} else {
				this.container = <HTMLElement>document.querySelector(`[data-name='${elemOrName}'],[data-collection='${elemOrName}'],#${elemOrName},[name="${elemOrName}"]`);
			}
			if (!this.container) {
				throw new Error("Failed to locate '" + elemOrName + "'.");
			}
		} else {
			this.container = elemOrName;
		}
	}

	public register(directive: IViewRenderDirective) {
		this.directives.push(directive);
	}

	public static registerGlobal(directive: IViewRenderDirective) {
		ViewRenderer.globalValueDirectives.push(directive);
	}

	public render(data: any = {}, directives: any = {}) {
		this.dtoStack.push(data);
        if (data instanceof Array){
            this.renderCollection(this.container, data, directives);
        } else {
            this.renderElement(this.container, data, directives);
        }
	}

	private renderElement(element: HTMLElement, data: any, directives = {}) {
		if (element.childElementCount === 0 && this.hasName(element)) {
			data = this.runDirectives(element, data);
			if (directives) {
				if (this.applyEmbeddedDirectives(element, data, directives)) {
					return;
				}
			}
			if (typeof data === "undefined") {
				return;
			}
			if (element.tagName === "INPUT") {
				var typeStr = element.getAttribute("type");
				if (typeStr === "radio" || typeStr === "checkbox") {
					if (element["value"] === data) {
						element["checked"] = true;
					}
				} else {
					element["value"] = data;
				}
			} else if (element.tagName === "SELECT") {
				var sel = <HTMLSelectElement>element;
				for (var j = 0; j < sel.options.length; j++) {
					var opt = <HTMLOptionElement>sel.options[j];
					if (opt.value === data || opt.label === data) {
						opt.selected = true;
						break;
					}
				}
			} else if (element.tagName === "TEXTAREA") {
				element.innerText = data;
			} else {
				element.innerHTML = data;
			}
		}

		for (let i = 0; i < element.childElementCount; i++) {
			var item = <HTMLElement>element.children[i];
			var name = this.getName(item);

			//no name, maybe got nested data
			if (!name) {
				this.renderElement(item, data, directives);
				continue;
			}

			var childData = data[name];
			var childDirective = null;
			if (directives && directives.hasOwnProperty(name)) {
				childDirective = directives[name];
			}
			if (typeof childData === "undefined") {
				var gotValueProvider = false;
				if (childDirective) {
					gotValueProvider = childDirective.hasOwnProperty("value")
					|| childDirective.hasOwnProperty("text")
					|| childDirective.hasOwnProperty("html");
				}

				if (!gotValueProvider) {
					continue;
				}
			}
			if (this.isCollection(item)) {
				this.lineage.push(name);
				this.dtoStack.push(childData);
				this.renderCollection(item, childData, childDirective);
				this.dtoStack.pop();
				this.lineage.pop();
			} else {
				this.lineage.push(name);
				this.dtoStack.push(childData);
				this.renderElement(item, childData, childDirective);
				this.dtoStack.pop();
				this.lineage.pop();
			}

		}
	}

	private renderCollection(element: HTMLElement, data: any, directive = null) {
		var container = element;
        
        if (element.hasAttribute("data-unless")) {
            var value = element.getAttribute("data-unless");
            var name = this.getName(element);
            var result = false;
            if (name === value) {
                result = data.length === 0;
            } else {
                var ctx = { element: element, data: data, dto: this.dtoStack[this.dtoStack.length-2] };
                result = this.evalInContext(value, ctx);
            }
            if (result) {
                element.style.display = "";
            } else {
                element.style.display = "none";
            }            
        }
        
		if (container.tagName === "TR"
			|| container.tagName === "LI") {
			container = container.parentElement;
            container.setAttribute("data-collection", element.getAttribute("data-collection"));
            element.setAttribute("data-name", "value");
            element.removeAttribute("data-collection");
		}

		var template = <HTMLElement>container.firstElementChild.cloneNode(true);
		template.removeAttribute("data-template");
		template.style.display = "";
		if (!container.firstElementChild.hasAttribute("data-template")) {
			if (container.childElementCount !== 1) {
				throw new Error("There must be a single child element in collection containers. If you use multiple elements you need to for instance wrap them in a div. Path: '" + this.lineage.join(" -> ") + "'.");
			}
			var el = <HTMLElement>container.firstElementChild;
			el.style.display = "none";
			el.setAttribute("data-template", "true");
		}

		//remove all but template.
		while (container.childElementCount > 1) {
			container.removeChild(container.lastElementChild);
		}

		var index = 0;
		data.forEach(item => {
			var ourNode = <HTMLElement>template.cloneNode(true);
			this.lineage.push(`[${index}]`);
			this.dtoStack.push(item);
			this.renderElement(ourNode, item, directive);
			this.lineage.pop();
			this.dtoStack.pop();
			index = index + 1;
			container.appendChild(ourNode);
		});
	}

	private applyEmbeddedDirectives(element: HTMLElement, data: any, directives: any): boolean {
		var isDirectiveValueSpecified = false;
		for (var key in directives) {
			var value = directives[key].apply(element, [data, this.dtoStack[this.dtoStack.length - 2]]);
			if (key === "html") {
				isDirectiveValueSpecified = true;
				element.innerHTML = value;
			} else if (key === "text") {
				isDirectiveValueSpecified = true;
				element.innerText = value;
			} else {
				if (key === "value") {
					isDirectiveValueSpecified = true;
				}
				element.setAttribute(key, value);
			}
		}
		return isDirectiveValueSpecified;
	}
	private runDirectives(element: HTMLElement, data: any) {
		var context = {
			element: element,
			lineage: this.lineage,
			propertyName: this.lineage[this.lineage.length - 1],
			value: data
		};
		this.directives.forEach(directive => {
			if (!directive.process(context)) {
				return false;
			};
		});
		ViewRenderer.globalValueDirectives.forEach(directive => {
			if (!directive.process(context)) {
				return false;
			};
		});
		return context.value;
	}
	private getName(el: HTMLElement): string {
		return el.getAttribute("name") || el.getAttribute("data-name") || el.getAttribute("data-collection") || el.getAttribute("data-unless");
	}

	private hasName(el: HTMLElement): boolean {
		return el.hasAttribute("name") || el.hasAttribute("data-name") || el.hasAttribute("data-collection") || el.hasAttribute("data-unless");
	}

	private isCollection(el: HTMLElement): boolean {
		return el.hasAttribute("data-collection");
	}
    
    private evalInContext(code: string, context: any) {
		var func = function (js) {
			return eval("with (this) { " + js + "}");
		};
		return func.call(context, code);
	}
    
}

export class ViewValueDirectiveContext {
	/** Value to modify */
	public value: any;

	/** Property name from the DTO */
	public propertyName: string;

	/** Element that the value is being rendered into */
	public element: HTMLElement;

	/** Current location in the DTO. Last value = name of the current property */
	public lineage: string[];
}

/**Used to modify values before they are inserted into the element */
export interface IViewRenderDirective {
	/** Process a value
	 * @return true if the remaining directives can process this value
	 */
	process(context: ViewValueDirectiveContext): boolean;
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
/**
 * Global config for extensibility
 */
export class GlobalConfig {
	/**
	 * Can be used to modify the path which is returned.
	 */
	static resourceLocator: IResourceLocator;
	static viewModelFactory: IViewModelFactory;


	/**
	 * Passed to the constructor of the view model (and in the IActivationContext);
	 */
	static applicationScope = {};
}



GlobalConfig.resourceLocator = {
	getHtml(section): string {
		let path = window.location.pathname;
		if (window.location.pathname.indexOf(".") > -1) {
			const pos = window.location.pathname.lastIndexOf("/");
			path = window.location.pathname.substr(0, pos);
		}
		if (path.substring(-1, 1) === "/") {
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
		if (path.substring(-1, 1) === "/") {
			path = path.substring(0, -1);
		}
		return path + `/ViewModels/${section}ViewModel.js`;
	}
};

GlobalConfig.applicationScope = {};
GlobalConfig.viewModelFactory = {
	create(applicationName: string, fullViewModelName: string): IViewModel {
		const viewModelConstructor = ClassFactory.getConstructor(applicationName, fullViewModelName);
		return <IViewModel>new viewModelConstructor(GlobalConfig.applicationScope);
	}
};
}
