var Griffin;
(function (Griffin) {
    var Yo;
    (function (Yo) {
        ;
        /**
         * Global config for extensibility
         */
        var GlobalConfig = (function () {
            function GlobalConfig() {
            }
            return GlobalConfig;
        })();
        Yo.GlobalConfig = GlobalConfig;
        var Selector = (function () {
            function Selector(scope) {
                if (typeof scope === "undefined") {
                    this.scope = document;
                }
                else {
                    this.scope = scope;
                }
                if (!this.scope)
                    throw new Error("Failed to identify scope");
            }
            Selector.prototype.one = function (idOrselector) {
                var el = document.getElementById(idOrselector);
                if (el) {
                    return el;
                }
                return this.scope.querySelector(idOrselector);
            };
            Selector.prototype.all = function (selector) {
                var result = [];
                var items = this.scope.querySelectorAll(selector);
                for (var i = 0; i < items.length; i++) {
                    result.push(items[i]);
                }
                return result;
            };
            return Selector;
        })();
        Yo.Selector = Selector;
        var EventMapper = (function () {
            function EventMapper(scope) {
                if (typeof scope === "undefined") {
                    this.scope = document;
                }
                else {
                    this.scope = scope;
                }
            }
            EventMapper.prototype.click = function (selector, listener, useCapture) {
                var items = this.scope.querySelectorAll(selector);
                if (items.length === 0)
                    throw new Error("Failed to bind \"click\" to selector \"" + selector + "\", no elements found.");
                for (var i = 0; i < items.length; i++) {
                    items[i].addEventListener("click", listener, useCapture);
                }
            };
            EventMapper.prototype.change = function (selector, listener, useCapture) {
                var items = this.scope.querySelectorAll(selector);
                if (items.length === 0)
                    throw new Error("Failed to bind \"change\" to selector \"" + selector + "\", no elements found.");
                for (var i = 0; i < items.length; i++) {
                    items[i].addEventListener("change", listener, useCapture);
                }
            };
            EventMapper.prototype.keyUp = function (selector, listener, useCapture) {
                var items = this.scope.querySelectorAll(selector);
                if (items.length === 0)
                    throw new Error("Failed to bind \"keyup\" to selector \"" + selector + "\", no elements found.");
                for (var i = 0; i < items.length; i++) {
                    items[i].addEventListener("keyup", listener, useCapture);
                }
            };
            EventMapper.prototype.keyDown = function (selector, listener, useCapture) {
                var items = this.scope.querySelectorAll(selector);
                if (items.length === 0)
                    throw new Error("Failed to bind \"keydown\" to selector \"" + selector + "\", no elements found.");
                for (var i = 0; i < items.length; i++) {
                    items[i].addEventListener("keydown", listener, useCapture);
                }
            };
            return EventMapper;
        })();
        Yo.EventMapper = EventMapper;
        /**
         * Global mappings
         */
        var G = (function () {
            function G() {
            }
            G.render = function (idOrElem, dto, directives) {
                var r = new ViewRenderer(idOrElem);
                r.render(dto, directives);
            };
            G.select = new Selector();
            G.handle = new EventMapper();
            return G;
        })();
        Yo.G = G;
        var Doh = (function () {
            function Doh() {
            }
            Doh.removeChildren = function (n) {
                if (!n) {
                    throw new Error("Element not set: " + n);
                }
                while (n.firstChild) {
                    n.removeChild(n.firstChild);
                }
            };
            Doh.moveChildren = function (source, target) {
                while (source.firstChild) {
                    target.appendChild(source.firstChild);
                }
                if (source.parentElement) {
                    source.parentElement.removeChild(source);
                }
                else {
                    source.remove();
                }
            };
            //credits: http://stackoverflow.com/a/2441972/70386
            Doh.getConstructor = function (appName, viewModelModuleAndName) {
                var nameParts = viewModelModuleAndName.split(".");
                var fn = (window[appName] || this[appName]);
                if (typeof fn === "undefined") {
                    throw new Error("Failed to load application namespace \"" + appName + "'. Have a view model been loaded successfully?");
                }
                for (var i = 0, len = nameParts.length; i < len; i++) {
                    if (fn.hasOwnProperty(nameParts[i])) {
                        fn = fn[nameParts[i]];
                        continue;
                    }
                    var name_1 = nameParts[i].toLowerCase();
                    var foundName = void 0;
                    for (var propertyName in fn) {
                        if (!fn.hasOwnProperty(propertyName)) {
                            continue;
                        }
                        if (propertyName.toLowerCase() === name_1) {
                            foundName = propertyName;
                        }
                    }
                    if (typeof foundName === "undefined")
                        throw new Error("Could not find \"#" + nameParts[i] + "\" from viewModel name, complete name: \"#" + viewModelModuleAndName + "\".");
                    fn = fn[foundName];
                }
                if (typeof fn !== "function") {
                    throw new Error("Could not find view model " + viewModelModuleAndName);
                }
                return fn;
            };
            return Doh;
        })();
        /**
         * Executes a specific route (i.e. loads the view model and view from the server, caches them and finally executes the VM).
         */
        var RouteRunner = (function () {
            function RouteRunner(section, applicationName) {
                this.section = section;
                if (!applicationName) {
                    throw new Error("applicationName must be specified");
                }
                if (!section) {
                    throw new Error("section must be specified");
                }
                this.applicationName = applicationName;
            }
            RouteRunner.replaceAll = function (str, replaceWhat, replaceTo) {
                replaceWhat = replaceWhat.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                var re = new RegExp(replaceWhat, "g");
                return str.replace(re, replaceTo);
            };
            RouteRunner.prototype.applyRouteDataToLinks = function (viewElement, routeData) {
                var links = viewElement.querySelectorAll("a");
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    for (var dataName in routeData) {
                        if (routeData.hasOwnProperty(dataName)) {
                            link.href = RouteRunner.replaceAll(link.href, ":" + dataName, routeData[dataName]);
                        }
                    }
                }
            };
            RouteRunner.prototype.moveNavigationToMain = function (viewElement) {
                var navigations = viewElement.querySelectorAll("[data-navigation]");
                for (var i = 0; i < navigations.length; i++) {
                    var nav = navigations[i];
                    var target = nav.getAttribute("data-navigation");
                    var targetElem = document.getElementById(target);
                    if (!targetElem)
                        throw new Error("Failed to find target element '" + target + "' for navigation '" + nav.innerHTML);
                    Doh.removeChildren(targetElem);
                    Doh.moveChildren(nav, targetElem);
                }
            };
            RouteRunner.prototype.invoke = function (ctx) {
                var _this = this;
                this.ensureResources(function () {
                    var viewElem = document.createElement("div");
                    viewElem.className = "ViewContainer";
                    viewElem.innerHTML = _this.html;
                    _this.applyRouteDataToLinks(viewElem, ctx.routeData);
                    _this.moveNavigationToMain(viewElem);
                    var viewParent = document.getElementById("YoView");
                    if (typeof ctx.target !== "undefined") {
                        viewParent = ctx.target;
                    }
                    //add script
                    var scriptElem = document.createElement("script");
                    scriptElem.setAttribute("type", "text/javascript");
                    viewParent.appendChild(scriptElem);
                    scriptElem.innerHTML = _this.viewModelScript;
                    //load model and run it
                    var className = (_this.section.replace(/\//g, ".") + "ViewModel");
                    _this.viewModel = GlobalConfig.viewModelFactory.create(_this.applicationName, className);
                    var vm = _this.viewModel;
                    var activationContext = {
                        routeData: ctx.routeData,
                        viewContainer: viewElem,
                        render: function (data, directives) {
                            var r = new ViewRenderer(viewElem);
                            r.render(data, directives);
                        },
                        renderPartial: function (selector, data, directives) {
                            var part = viewElem.querySelector(selector);
                            if (!part) {
                                throw new Error("Failed to find partial '" + selector + "'.");
                            }
                            var r = new ViewRenderer(part);
                            r.render(data, directives);
                        },
                        resolve: function () {
                            document.title = vm.getTitle();
                            //do not count the script element that we added
                            while (viewParent.childElementCount > 1) {
                                viewParent.removeChild(viewParent.firstElementChild);
                            }
                            viewParent.appendChild(viewElem);
                        },
                        reject: function () {
                            //TODO: Fail?
                        },
                        handle: new EventMapper(viewElem),
                        select: new Selector(viewElem)
                    };
                    _this.viewModel.activate(activationContext);
                });
            };
            RouteRunner.prototype.ensureResources = function (callback) {
                var _this = this;
                var bothPreloaded = true;
                var self = this;
                if (typeof this.html === "undefined") {
                    var path = GlobalConfig.resourceLocator.getHtml(this.section);
                    Http.get(path, function (xhr, success) {
                        if (success) {
                            self.html = xhr.responseText;
                            _this.doStep(callback);
                        }
                        else {
                            throw new Error(xhr.responseText);
                        }
                        bothPreloaded = false;
                    }, "text/html");
                }
                if (typeof this.viewModel === "undefined") {
                    var path = GlobalConfig.resourceLocator.getScript(this.section);
                    Http.get(path, function (xhr, success) {
                        if (success) {
                            self.viewModelScript = xhr.responseText;
                            _this.doStep(callback);
                        }
                        else {
                            throw new Error(xhr.responseText);
                        }
                    }, "text/javascript");
                    bothPreloaded = false;
                }
                if (bothPreloaded)
                    this.doStep(callback);
            };
            RouteRunner.prototype.doStep = function (callback) {
                if (typeof this.html !== "undefined"
                    && typeof this.viewModelScript !== "undefined") {
                    callback();
                }
            };
            return RouteRunner;
        })();
        /**
         * Facade for the SPA handling
         */
        var Spa = (function () {
            /**
                     * Create Spa.
                     * @param applicationName Only used for namespacing of VMs
                     */
            function Spa(applicationName) {
                this.applicationName = applicationName;
                this.router = new Router();
                this.handlers = [];
                this.basePath = "";
                this.basePath = window.location.pathname;
            }
            /**
             * Navigate to another view.
             * @param URL Everything after the hash in the complete URI, like 'user/1'
             * @param targetElement If the result should be rendered somewhere else than the main layout div.
             */
            Spa.prototype.navigate = function (url, targetElement) {
                this.router.execute(url, targetElement);
            };
            /**
             * Map a route
             * @param route Route string like 'user/:userId'
             * @param section Path and name of view/viewModel. 'users/index' will look for '/ViewModels/Users/IndexViewModel' and '/Views/Users/Index.html'
             */
            Spa.prototype.mapRoute = function (route, section, targetElement) {
                var runner = new RouteRunner(section, this.applicationName);
                this.handlers[section] = runner;
                this.router.add(route, runner, targetElement);
            };
            /**
             * Start the spa application (i.e. load the default route)
             */
            Spa.prototype.run = function () {
                var _this = this;
                //no shebang pls.
                var url = window.location.hash.substring(1);
                if (url.substr(0, 1) === "!") {
                    url = url.substr(1);
                }
                window.addEventListener("hashchange", function () {
                    //no shebang pls.
                    var changedUrl = window.location.hash.substring(1);
                    if (changedUrl.substr(0, 1) === "!") {
                        changedUrl = changedUrl.substr(1);
                    }
                    _this.router.execute(changedUrl);
                });
                this.router.execute(url);
            };
            Spa.prototype.mapFunctionToRouteData = function (f, routeData) {
                var re = /^\s*function\s+(?:\w*\s*)?\((.*?)\)/;
                var args = f.toString().match(re);
                var test = f[1].trim().split(/\s*,\s*/);
            };
            return Spa;
        })();
        Yo.Spa = Spa;
        /**
         * Represents a route
         */
        var Route = (function () {
            function Route(route, handler, target) {
                this.route = route;
                this.handler = handler;
                this.target = target;
                this.parts = [];
                this.parts = route.replace(/^\//, "").split("/");
            }
            Route.prototype.isMatch = function (ctx) {
                var urlParts = ctx.url.split("/", 10);
                for (var i = 0; i < this.parts.length; i++) {
                    var myPart = this.parts[i];
                    var pathPart = urlParts[i];
                    if (pathPart !== undefined) {
                        if (myPart.charAt(0) === ":") {
                            continue;
                        }
                        else if (myPart !== pathPart) {
                            return false;
                        }
                    }
                    else if (myPart.charAt(0) !== ":") {
                        //not an argument, i.e not optional
                        return false;
                    }
                    else {
                        return false;
                    }
                }
                return true;
            };
            Route.prototype.invoke = function (ctx) {
                var urlParts = ctx.url.split("/", 10);
                var routeData = {};
                for (var i = 0; i < this.parts.length; i++) {
                    var myPart = this.parts[i];
                    var pathPart = urlParts[i];
                    if (pathPart !== "undefined") {
                        if (myPart.charAt(0) === ":") {
                            routeData[myPart.substr(1)] = pathPart;
                        }
                    }
                    else if (myPart.charAt(0) === ":") {
                        routeData[myPart.substr(1)] = null;
                    }
                }
                var executionCtx = {
                    routeData: routeData,
                    route: this
                };
                if (typeof this.target === "string") {
                    executionCtx.target = document.getElementById(this.target);
                    if (!executionCtx.target)
                        throw new Error("The specified target '" + this.target + "' could not be found.");
                }
                else if (typeof this.target !== "undefined") {
                    executionCtx.target = this.target;
                }
                this.handler.invoke(executionCtx);
            };
            return Route;
        })();
        Yo.Route = Route;
        /**
         * Translates a uri to a route.
         */
        var Router = (function () {
            function Router() {
                this.routes = [];
            }
            /**
             * Route an URL
             * @param route URL to act on (vars should be prefixed with colon: '/user/:userId').
             * @param handler used to invoke the VM if the route matches.
             * @param targetElement id or HTML element (where the result should be rendered)
             * @returns {}
             */
            Router.prototype.add = function (route, handler, targetElement) {
                this.routes.push(new Route(route, handler, targetElement));
            };
            /**
             * Add a custom route
             * @param route route
             */
            Router.prototype.addRoute = function (route) {
                if (typeof route === "undefined")
                    throw new Error("Route must be specified.");
                this.routes.push(route);
            };
            Router.prototype.execute = function (url, targetElement) {
                if (url.length) {
                    url = url
                        .replace(/\/+/g, "/") //remove double slashes
                        .replace(/^\/|\/($|\?)/, "") //trim slashes
                        .replace(/#.*$/, "");
                }
                var ctx = {
                    url: url
                };
                if (typeof targetElement !== "undefined") {
                    if (typeof targetElement === "string") {
                        ctx.targetElement = document.getElementById(targetElement);
                        if (!ctx.targetElement) {
                            throw new Error("Failed to identify '" + targetElement + "'");
                        }
                    }
                    ctx.targetElement = targetElement;
                }
                for (var i = 0; i < this.routes.length; i++) {
                    var route = this.routes[i];
                    if (route.isMatch(ctx)) {
                        route.invoke(ctx);
                        return true;
                    }
                }
                if (console && console.log) {
                    console.log("Route not found for \"" + url + "\"");
                }
                return false;
            };
            return Router;
        })();
        Yo.Router = Router;
        /**
         * Renders views (i.e. takes objects/JSON and identifies where each property should be rendered in the view).
         */
        var ViewRenderer = (function () {
            function ViewRenderer(idOrSelectorOrElem) {
                this.bindAttributeName = "data-name";
                if (!idOrSelectorOrElem) {
                    throw new Error("Must specify a selector or an ID that refers to the target element.");
                }
                if (idOrSelectorOrElem instanceof HTMLElement) {
                    this.elem = idOrSelectorOrElem;
                }
                else {
                    this.elem = document.getElementById(idOrSelectorOrElem);
                    if (!this.elem) {
                        this.elem = document.querySelector(idOrSelectorOrElem);
                        if (!this.elem) {
                            throw new Error("Failed to find target element '" + idOrSelectorOrElem + "'.");
                        }
                    }
                }
            }
            ViewRenderer.prototype.render = function (data, directives) {
                if (!data)
                    throw new Error("No DTO was specified");
                this.renderItem(data, this.elem, "", {}, directives);
            };
            /**
             *
             * @param data
             * @param element
             * @param lineage
             * @param parentData required during rendering
             * @param directives
             * @returns {}
             */
            ViewRenderer.prototype.renderItem = function (data, element, lineage, parentData, directives) {
                if (typeof data === "number"
                    || typeof data === "string"
                    || typeof data === "boolean") {
                    this.renderValue(data, element, lineage, parentData, directives);
                }
                else if (data instanceof Array) {
                    this.renderArray(element, data, lineage, parentData, directives);
                }
                else {
                    for (var propertyName in data) {
                        if (!data.hasOwnProperty(propertyName)) {
                            continue;
                        }
                        this.currentProperty = propertyName;
                        var item = data[propertyName];
                        if (typeof item === "undefined")
                            throw new Error("Undefined value in DTO, property \"" + propertyName + "\", lineage: \"" + lineage + "\".");
                        var childDirectives = void 0;
                        if (directives) {
                            childDirectives = directives[propertyName];
                        }
                        var selectorStr = "[" + this.bindAttributeName + "=\"" + propertyName + "\"],[name=\"" + propertyName + "\"],#" + propertyName;
                        var childElements = element.querySelectorAll(selectorStr);
                        if (childElements.length === 0) {
                        }
                        for (var i = 0; i < childElements.length; i++) {
                            var childElement = childElements[i];
                            this.renderItem(item, childElement, lineage + "/" + propertyName, data, childDirectives);
                        }
                    }
                }
            };
            ViewRenderer.prototype.renderArray = function (targetElement, array, lineage, parentData, directives) {
                var _this = this;
                var template;
                if (targetElement["Yo.template"]) {
                    template = targetElement["Yo.template"];
                }
                else {
                    template = targetElement.cloneNode(true);
                    targetElement["Yo.template"] = template;
                }
                var parent = targetElement.parentElement;
                parent.removeChild(targetElement);
                if (directives.hasOwnProperty("text")
                    || directives.hasOwnProperty("html")
                    || directives.hasOwnProperty("value")) {
                }
                var index = 0;
                array.forEach(function (child) {
                    var ourNode = template.cloneNode(true);
                    parent.appendChild(ourNode);
                    //directives are for the children and not for this item
                    _this.renderItem(child, ourNode, lineage + "[" + (index++) + "]", parentData, directives);
                });
            };
            ViewRenderer.prototype.renderValue = function (item, e, lineage, parentData, directives) {
                if (!e)
                    throw new Error("element is required, missing in path " + lineage);
                if (directives) {
                    var isValueSet = false;
                    for (var directiveName in directives) {
                        if (!directives.hasOwnProperty(directiveName)) {
                            continue;
                        }
                        var currentDirective = directives[directiveName];
                        if (typeof currentDirective === "undefined" || typeof currentDirective.apply === "undefined")
                            throw new Error("Directive must be a function, maybe you specified your directive incorrectly? Path: " + lineage);
                        if (directiveName === "text") {
                            e.innerText = currentDirective.apply(e, [item, parentData]);
                            isValueSet = true;
                        }
                        else if (directiveName === "html") {
                            e.innerHTML = currentDirective.apply(e, [item, parentData]);
                            isValueSet = true;
                        }
                        else {
                            if (directiveName === "value") {
                                isValueSet = true;
                            }
                            var value = currentDirective.apply(e, [item, parentData]);
                            e.setAttribute(directiveName, value);
                        }
                    }
                    if (isValueSet) {
                        return;
                    }
                }
                if (e.hasAttribute("value") || e instanceof HTMLInputElement) {
                    e.setAttribute("value", item.toString());
                }
                else if (e.childElementCount > 0) {
                }
                else {
                    e.innerHTML = item.toString();
                }
            };
            return ViewRenderer;
        })();
        Yo.ViewRenderer = ViewRenderer;
        /**
         * Our wrapper around AJAX focused on loading resources and data from the server.
         */
        var Http = (function () {
            function Http() {
            }
            /**
             * Get a resource from the server.
             * @param url Server to fetch from
             * @param callback Invoked once the response is received from the server (or when something fails).
             * @param contentType Content type for the request.
             */
            Http.get = function (url, callback, contentType) {
                var _this = this;
                if (contentType === void 0) { contentType = "application/json"; }
                var request = new XMLHttpRequest();
                if (typeof this.cache[url] !== "undefined") {
                    var cache = this.cache[url];
                    request.setRequestHeader("If-Modified-Since", cache.modifiedAt);
                }
                ;
                request.open("GET", url, true);
                request.setRequestHeader("Content-Type", contentType);
                request.onload = function () {
                    if (request.status >= 200 && request.status < 400) {
                        if (request.status === 304) {
                            request.responseText = _this.cache[url].content;
                        }
                        else {
                            var header = request.getResponseHeader("Last-Modified");
                            if (header) {
                                _this.cache[url] = {
                                    content: request.responseText,
                                    modifiedAt: header
                                };
                            }
                        }
                        if (contentType === "application/json") {
                            request.responseBody = JSON.parse(request.responseText);
                        }
                        callback(request, true);
                    }
                    else {
                        callback(request, false);
                    }
                };
                request.onerror = function () {
                    callback(request, false);
                };
                request.send();
            };
            Http.cache = {};
            /**
             * Whether HTTP caching ('If-Modified-Since' and 'Last-Modified') can be used.
             */
            Http.useCaching = true;
            return Http;
        })();
        Yo.Http = Http;
        GlobalConfig.resourceLocator = {
            getHtml: function (section) {
                var path = window.location.pathname;
                if (window.location.pathname.indexOf(".") > -1) {
                    var pos = window.location.pathname.lastIndexOf("/");
                    path = window.location.pathname.substr(0, pos);
                }
                if (path.substring(-1, 1) === '/') {
                    path = path.substring(0, -1);
                }
                return path + ("/Views/" + section + ".html");
            },
            getScript: function (section) {
                var path = window.location.pathname;
                if (window.location.pathname.indexOf(".") > -1) {
                    var pos = window.location.pathname.lastIndexOf("/");
                    path = window.location.pathname.substr(0, pos);
                }
                if (path.substring(-1, 1) === '/') {
                    path = path.substring(0, -1);
                }
                return path + ("/ViewModels/" + section + "ViewModel.js");
            }
        };
        GlobalConfig.viewModelFactory = {
            create: function (applicationName, fullViewModelName) {
                var viewModelConstructor = Doh.getConstructor(applicationName, fullViewModelName);
                return new viewModelConstructor();
            }
        };
    })(Yo = Griffin.Yo || (Griffin.Yo = {}));
})(Griffin || (Griffin = {}));
//# sourceMappingURL=Griffin.Yo.js.map