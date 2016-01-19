var Griffin;
(function (Griffin) {
    var Yo;
    (function (Yo) {
        var Views;
        (function (Views) {
            /** Renders views using js/json objects.
             *
             * This renderer can render objects into views by identifying tags with the help of the attributes "name" (for forms), "data-name" for containers/single value and "data-collection" for collections.
             *
             * The rendering can be controlled by
             */
            var ViewRenderer = (function () {
                /**Create a new instance
             * @param elemOrName Either a HTML element or an identifier (value of attribute "id" or "data-name").
             * @class
             *
             *
             */
                function ViewRenderer(elemOrName) {
                    this.lineage = [];
                    this.dtoStack = [];
                    this.directives = [];
                    if (typeof elemOrName === "string") {
                        if (elemOrName.substr(0, 1) === "#") {
                            this.container = document.getElementById(elemOrName.substr(1));
                        }
                        else {
                            this.container = document.querySelector("[data-name='" + elemOrName + "'],[data-collection='" + elemOrName + "'],#" + elemOrName + ",[name=\"" + elemOrName + "\"]");
                        }
                        if (!this.container) {
                            throw new Error("Failed to locate '" + elemOrName + "'.");
                        }
                    }
                    else {
                        this.container = elemOrName;
                    }
                }
                ViewRenderer.prototype.register = function (directive) {
                    this.directives.push(directive);
                };
                ViewRenderer.registerGlobal = function (directive) {
                    ViewRenderer.globalValueDirectives.push(directive);
                };
                ViewRenderer.prototype.render = function (data, directives) {
                    if (data === void 0) { data = {}; }
                    if (directives === void 0) { directives = {}; }
                    this.dtoStack.push(data);
                    if (data instanceof Array) {
                        this.renderCollection(this.container, data, directives);
                    }
                    else {
                        this.renderElement(this.container, data, directives);
                    }
                };
                ViewRenderer.prototype.renderElement = function (element, data, directives) {
                    if (directives === void 0) { directives = {}; }
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
                            }
                            else {
                                element["value"] = data;
                            }
                        }
                        else if (element.tagName === "SELECT") {
                            var sel = element;
                            for (var j = 0; j < sel.options.length; j++) {
                                var opt = sel.options[j];
                                if (opt.value === data || opt.label === data) {
                                    opt.selected = true;
                                    break;
                                }
                            }
                        }
                        else if (element.tagName === "TEXTAREA") {
                            element.innerText = data;
                        }
                        else {
                            element.innerHTML = data;
                        }
                    }
                    for (var i = 0; i < element.childElementCount; i++) {
                        var item = element.children[i];
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
                        }
                        else {
                            this.lineage.push(name);
                            this.dtoStack.push(childData);
                            this.renderElement(item, childData, childDirective);
                            this.dtoStack.pop();
                            this.lineage.pop();
                        }
                    }
                };
                ViewRenderer.prototype.renderCollection = function (element, data, directive) {
                    var _this = this;
                    if (directive === void 0) { directive = null; }
                    var container = element;
                    if (element.hasAttribute("data-unless")) {
                        var value = element.getAttribute("data-unless");
                        var name = this.getName(element);
                        var result = false;
                        if (name === value) {
                            result = data.length === 0;
                        }
                        else {
                            var ctx = { element: element, data: data, dto: this.dtoStack[this.dtoStack.length - 2] };
                            result = this.evalInContext(value, ctx);
                        }
                        if (result) {
                            element.style.display = "";
                        }
                        else {
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
                    var template = container.firstElementChild.cloneNode(true);
                    template.removeAttribute("data-template");
                    template.style.display = "";
                    if (!container.firstElementChild.hasAttribute("data-template")) {
                        if (container.childElementCount !== 1) {
                            throw new Error("There must be a single child element in collection containers. If you use multiple elements you need to for instance wrap them in a div. Path: '" + this.lineage.join(" -> ") + "'.");
                        }
                        var el = container.firstElementChild;
                        el.style.display = "none";
                        el.setAttribute("data-template", "true");
                    }
                    //remove all but template.
                    while (container.childElementCount > 1) {
                        container.removeChild(container.lastElementChild);
                    }
                    var index = 0;
                    data.forEach(function (item) {
                        var ourNode = template.cloneNode(true);
                        _this.lineage.push("[" + index + "]");
                        _this.dtoStack.push(item);
                        _this.renderElement(ourNode, item, directive);
                        _this.lineage.pop();
                        _this.dtoStack.pop();
                        index = index + 1;
                        container.appendChild(ourNode);
                    });
                };
                ViewRenderer.prototype.applyEmbeddedDirectives = function (element, data, directives) {
                    var isDirectiveValueSpecified = false;
                    for (var key in directives) {
                        var value = directives[key].apply(element, [data, this.dtoStack[this.dtoStack.length - 2]]);
                        if (key === "html") {
                            isDirectiveValueSpecified = true;
                            element.innerHTML = value;
                        }
                        else if (key === "text") {
                            isDirectiveValueSpecified = true;
                            element.innerText = value;
                        }
                        else {
                            if (key === "value") {
                                isDirectiveValueSpecified = true;
                            }
                            element.setAttribute(key, value);
                        }
                    }
                    return isDirectiveValueSpecified;
                };
                ViewRenderer.prototype.runDirectives = function (element, data) {
                    var context = {
                        element: element,
                        lineage: this.lineage,
                        propertyName: this.lineage[this.lineage.length - 1],
                        value: data
                    };
                    this.directives.forEach(function (directive) {
                        if (!directive.process(context)) {
                            return false;
                        }
                        ;
                    });
                    ViewRenderer.globalValueDirectives.forEach(function (directive) {
                        if (!directive.process(context)) {
                            return false;
                        }
                        ;
                    });
                    return context.value;
                };
                ViewRenderer.prototype.getName = function (el) {
                    return el.getAttribute("name") || el.getAttribute("data-name") || el.getAttribute("data-collection") || el.getAttribute("data-unless");
                };
                ViewRenderer.prototype.hasName = function (el) {
                    return el.hasAttribute("name") || el.hasAttribute("data-name") || el.hasAttribute("data-collection") || el.hasAttribute("data-unless");
                };
                ViewRenderer.prototype.isCollection = function (el) {
                    return el.hasAttribute("data-collection");
                };
                ViewRenderer.prototype.evalInContext = function (code, context) {
                    var func = function (js) {
                        return eval("with (this) { " + js + "}");
                    };
                    return func.call(context, code);
                };
                ViewRenderer.globalValueDirectives = [];
                return ViewRenderer;
            })();
            Views.ViewRenderer = ViewRenderer;
            var ViewValueDirectiveContext = (function () {
                function ViewValueDirectiveContext() {
                }
                return ViewValueDirectiveContext;
            })();
            Views.ViewValueDirectiveContext = ViewValueDirectiveContext;
        })(Views = Yo.Views || (Yo.Views = {}));
    })(Yo = Griffin.Yo || (Griffin.Yo = {}));
})(Griffin || (Griffin = {}));
//# sourceMappingURL=Views.js.map