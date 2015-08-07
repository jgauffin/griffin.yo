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
					//const selectorStr = `[${this.bindAttributeName}="${propertyName}"],[name="${propertyName}"],#${propertyName}`;
					const part = <HTMLElement>viewElem.querySelector(selector);
					if (!part) {
						throw new Error(`Failed to find partial '${selector}'.`);
					}
					const r = new ViewRenderer(part);
					r.render(data, directives);
				},
				resolve() {
					document.title = vm.getTitle();

					ctx.target.setTitle(vm.getTitle());
					ctx.target.render(viewElem);
					var scripts = viewElem.getElementsByTagName("script");
					var loader = new ScriptLoader();
					for (var i = 0; i < scripts.length; i++) {
						loader.loadTags(scripts[i]);
					}

					var allIfs = viewElem.querySelectorAll("[data-if]");
					for (var j = 0; j < allIfs.length; j++) {
						var elem = allIfs[j];
						var value = elem.nodeValue;
						var result = this.evalInContext(value, { model: this.viewModel, ctx: ctx });
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
