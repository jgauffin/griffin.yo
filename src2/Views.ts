module Griffin.Yo.Views {
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
        static DEBUG: boolean = false;

        /**Create a new instance
	 * @param elemOrName Either a HTML element or an identifier (value of attribute "id" or "data-name").
	 * @class
	 *
	 *
	 */
        constructor(elemOrName: HTMLElement | string) {
            if (typeof elemOrName === "string") {
                if (elemOrName.substr(0, 1) === "#") {
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
            if (data instanceof Array) {
                this.renderCollection(this.container, data, directives);
            } else {
                this.renderElement(this.container, data, directives);
            }
        }

        private renderElement(element: HTMLElement, data: any, directives: any = {}) {
			var elementName = this.getName(element);
			if (elementName) {
				this.log('renderElement', this.getName(element));
			}
            if (element.childElementCount === 0 && elementName) {
				
				// we are the bottom element, but the data is not at the bottom yet.
				if (data && data.hasOwnProperty(elementName)) {
					data = data[elementName];
				}
				
                data = this.runDirectives(element, data);
                if (directives) {
                    if (this.applyEmbeddedDirectives(element, data, directives)) {
                        this.log('directives applied to element, done.');
                        return;
                    }
                }
                if (typeof data === "undefined") {
                    this.log('directives, but no data');
                    return;
                }
                if (element.tagName === "INPUT") {
                    let input = <HTMLInputElement>element;
                    if (input.type === "radio" || input.type === "checkbox") {
                        if (input.value === data) {
                            this.log(input.type + ".checked => true");
                            input.checked = true;
                        }
                    } else {
                        this.log(input.type + ".value => " + data);
                        input.value = data;
                    }
                } else if (element.tagName === "SELECT") {
                    var sel = <HTMLSelectElement>element;
                    for (var j = 0; j < sel.options.length; j++) {
                        var opt = <HTMLOptionElement>sel.options[j];
                        if (opt.value === data || opt.label === data) {
                            this.log('setting option ' + opt.label + " to selected");
                            opt.selected = true;
                            break;
                        }
                    }
                } else if (element.tagName === "TEXTAREA") {
                    this.log('textarea => ' + data);
                    element.innerText = data;
                } else {
                    this.log('innerHTML => ' + data);
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
                var childDirective: any = null;
                if (directives && directives.hasOwnProperty(name)) {
                    childDirective = (<any>directives)[name];
                }
                if (typeof childData === "undefined") {
                    this.log('got no data, checking directives.')
                    var gotValueProvider = false;
                    if (childDirective) {
                        gotValueProvider = childDirective.hasOwnProperty("value")
                        || childDirective.hasOwnProperty("text")
                        || childDirective.hasOwnProperty("html");
                    }

                    if (!gotValueProvider) {
                        this.log('got no data and no directives.')
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
					if(item.getAttribute("data-unless") === name) {
						if (childData){
							item.style.display = "none";
						}
					}
                    else if (childData instanceof Array) {
						var wrapper = document.createElement('div');
						wrapper.appendChild(item.cloneNode(true));
						var elementHtml = wrapper.innerHTML;
						var elemPath = name;
						if (this.lineage.length > 0) {
							elemPath = this.lineage.join();
						}
						throw "'" + name + "' is not set as a collection, but the data is an array.\nElement: " + elementHtml + "\nData: " + JSON.stringify(childData, null, 4);
					}
					
                    this.lineage.push(name);
                    this.dtoStack.push(childData);
                    this.renderElement(item, childData, childDirective);
                    this.dtoStack.pop();
                    this.lineage.pop();
                }

            }
        }

        private renderCollection(element: HTMLElement, data: any, directive: any = null) {
            var container = element;

            this.log('renderCollection');
            if (element.hasAttribute("data-unless")) {
                var value = element.getAttribute("data-unless");
                var name = this.getName(element);
                var result = false;
                if (name === value) {
                    result = data.length === 0;
                } else {
                    var ctx = { element: element, data: data, dto: this.dtoStack[this.dtoStack.length - 2] };
                    result = this.evalInContext(value, ctx);
                }
                if (result) {
                    this.log('unless(show)');
                    element.style.display = "";
                } else {
                    this.log('unless(hide)');
                    element.style.display = "none";
                }
            }

            if (container.tagName === "TR"
                || container.tagName === "LI") {
                container = container.parentElement;
                this.log('correcting container element by moving to up to parent', container);
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
            var collection = <any[]>data;
            collection.forEach(item => {
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
                    this.log('Assigning html', value, "to", element);
                    element.innerHTML = value;
                } else if (key === "text") {
                    isDirectiveValueSpecified = true;
                    this.log('Assigning text', value, "to", element);
                    element.innerText = value;
                } else {
                    if (key === "value") {
                        isDirectiveValueSpecified = true;
                    }
                    this.log('Assigning', value, "to", element, 'attribute', key);
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
                    this.log('Local directive ', directive, "cancelled processing of", context);
                    return false;
                };
            });
            ViewRenderer.globalValueDirectives.forEach(directive => {
                if (!directive.process(context)) {
                    this.log('Global directive ', directive, "cancelled processing of", context);
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
            var func = function(js: string) {
                return eval("with (this) { " + js + "}");
            };
            return func.call(context, code);
        }


        private log(...args: any[]) {
            if (ViewRenderer.DEBUG && console && console.log) {
                // if (this.lineage.length > 0) {
                //     args.push("\r\n\t");
                //     args.push(this.lineage.join('->'));
                // }
                args.unshift(this.dtoStack[this.dtoStack.length-1]);
                if (this.lineage.length == 0){
                    args.unshift('rootNode');
                }else{
                    args.unshift(this.lineage[this.lineage.length-1]);
                }
                args.unshift((<any>arguments).callee.caller.prototype);
                console.log.apply(console, args);
            }
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

}
