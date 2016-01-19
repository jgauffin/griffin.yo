// Do not modify this file! It's genEraTeD!
//
// Modifications should be done in the lib\ folder.
//
// If you know how to change all files so that everything can be generated as a single file (or for commonJs/AMD) 
// I would be really happy. Because I gave up and built the tool in the Packager folder. Run it if you modify any of the scripts.
// A bit cumbersome, but WTF do you do when you have spend hours and hours trying to figure out the module management in Typescript?
var Griffin;
(function (Griffin) {
    var Yo;
    (function (Yo) {
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
                request.open("GET", url, true);
                if (typeof this.cache[url] !== "undefined") {
                    var cache = this.cache[url];
                    request.setRequestHeader("If-Modified-Since", cache.modifiedAt);
                }
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
                            request["responseJson"] = JSON.parse(request.responseText);
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
            /**
             * POST a resource to the server
             * @param url Server resource to post to
             * @param callback Invoked once the response is received from the server (or when something fails).
             * @param options Additional configuration
             */
            Http.post = function (url, data, callback, options) {
                if (!data) {
                    throw new Error("You must specify a body when using POST.");
                }
                Http.invokeRequest('POST', url, data, callback, options);
            };
            /**
             * PUT a resource to the server
             * @param url Server resource to post to
             * @param callback Invoked once the response is received from the server (or when something fails).
             * @param options Additional configuration
             */
            Http.put = function (url, data, callback, options) {
                if (!data) {
                    throw new Error("You must specify a body when using PUT.");
                }
                Http.invokeRequest('PUT', url, data, callback, options);
            };
            /**
             * DELETE a resource on the server
             * @param url Server resource to post to
             * @param callback Invoked once the response is received from the server (or when something fails).
             * @param options Additional configuration
             */
            Http.delete = function (url, callback, options) {
                Http.invokeRequest('DELETE', url, null, callback, options);
            };
            /**
             * Make an HTTP request
             * @param verb HTTP verb
             * @param url Server resource to make a request to
             * @param data null if no body should be sent
             * @param callback Invoked once the response is received from the server (or when something fails).
             * @param options Additional configuration
             */
            Http.invokeRequest = function (verb, url, data, callback, options) {
                if (!verb) {
                    throw new Error("You must specify a HTTP verb");
                }
                if (options && options.userName && !options.password) {
                    throw new Error("You must provide password when username has been specified.");
                }
                var request = new XMLHttpRequest();
                if (options && options.userName) {
                    request.open(verb, url, true, options.userName, options.password);
                }
                else {
                    request.open(verb, url, true);
                }
                var requestContentType = "application/json";
                if (options && options.contentType) {
                    requestContentType = options.contentType;
                }
                if (options && options.headers) {
                    for (var key in options.headers) {
                        request.setRequestHeader(key, options.headers[key]);
                    }
                }
                request.onload = function () {
                    if (request.status >= 200 && request.status < 400) {
                        var contentType = request.getResponseHeader("content-type").toLocaleLowerCase();
                        if (contentType === "application/json") {
                            //this doesn't work in IE
                            request.responseBody = JSON.parse(request.responseText);
                            //for IE
                            request["responseJson"] = JSON.parse(request.responseText);
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
                if (typeof data !== "undefined" && data !== null) {
                    request.setRequestHeader("Content-Type", requestContentType);
                    if (requestContentType === "application/json" && typeof (data) !== "string") {
                        data = JSON.stringify(data);
                    }
                    request.send(data);
                }
                else {
                    request.send();
                }
            };
            Http.cache = {};
            /**
             * Whether HTTP caching ('If-Modified-Since' and 'Last-Modified') can be used.
             */
            Http.useCaching = true;
            return Http;
        })();
        Yo.Http = Http;
        ;
        /**
         * Represents a route
         */
        var Route = (function () {
            function Route(route, handler, target) {
                this.route = route;
                this.handler = handler;
                this.target = target;
                this.parts = [];
                this.parts = route.replace(/^\//, "")
                    .replace(/\/$/, "")
                    .split("/");
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
                if (typeof this.target !== "undefined") {
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
                    var pos = link.href.indexOf("#");
                    if (pos === -1 || link.href.substr(pos + 1, 1) !== "/") {
                        continue;
                    }
                    for (var dataName in routeData) {
                        if (routeData.hasOwnProperty(dataName)) {
                            var after = RouteRunner.replaceAll(link.href, ":" + dataName, routeData[dataName]);
                            var before = link.href;
                            link.href = RouteRunner.replaceAll(link.href, ":" + dataName, routeData[dataName]);
                        }
                    }
                }
            };
            RouteRunner.prototype.moveNavigationToMain = function (viewElement, context) {
                var navigations = viewElement.querySelectorAll("[data-navigation]");
                for (var i = 0; i < navigations.length; i++) {
                    var nav = navigations[i];
                    var target = nav.getAttribute("data-navigation");
                    var targetElem = document.getElementById(target);
                    if (!targetElem)
                        throw new Error("Failed to find target element '" + target + "' for navigation '" + nav.innerHTML + "'");
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
            };
            RouteRunner.prototype.removeConditions = function (elem, context) {
                for (var i = 0; i < elem.childElementCount; i++) {
                    var child = elem.children[i];
                    var ifStatement = child.getAttribute("data-if");
                    var ifResult = !ifStatement || !this.evalInContext(ifStatement, context);
                    if (!ifResult) {
                        child.parentNode.removeChild(child);
                        continue;
                    }
                }
            };
            RouteRunner.prototype.evalInContext = function (code, context) {
                var func = function (js) {
                    return eval("with (this) { " + js + "}");
                };
                return func.call(context, code);
            };
            RouteRunner.prototype.isIE = function () {
                var myNav = navigator.userAgent.toLowerCase();
                return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
            };
            RouteRunner.prototype.invoke = function (ctx) {
                var _this = this;
                this.ensureResources(function () {
                    var viewElem = document.createElement("div");
                    viewElem.className = "ViewContainer";
                    viewElem.innerHTML = _this.html;
                    //add script
                    var scriptElem = document.createElement("script");
                    scriptElem.setAttribute("type", "text/javascript");
                    scriptElem.setAttribute("data-tag", "viewModel");
                    ctx.target.attachViewModel(scriptElem);
                    if (_this.isIE() <= 9) {
                        scriptElem.text = _this.viewModelScript;
                    }
                    else {
                        scriptElem.innerHTML = _this.viewModelScript;
                    }
                    //load model and run it
                    var className = (_this.section.replace(/\//g, ".") + "ViewModel");
                    _this.viewModel = GlobalConfig.viewModelFactory.create(_this.applicationName, className);
                    var vm = _this.viewModel;
                    if (vm.hasOwnProperty("getTargetOptions")) {
                        var options = vm["hasTargetOptions"]();
                        ctx.target.assignOptions(options);
                    }
                    else {
                        ctx.target.assignOptions({});
                    }
                    //move nav etc.
                    _this.applyRouteDataToLinks(viewElem, ctx.routeData);
                    _this.moveNavigationToMain(viewElem, { model: _this.viewModel, ctx: ctx });
                    var activationContext = {
                        routeData: ctx.routeData,
                        viewContainer: viewElem,
                        render: function (data, directives) {
                            var r = new ViewRenderer(viewElem);
                            r.render(data, directives);
                        },
                        readForm: function (selector) {
                            var reader = new FormReader(selector);
                            return reader.read();
                        },
                        renderPartial: function (selector, data, directives) {
                            var selector1 = new Selector(viewElem);
                            var target = selector1.one(selector);
                            var r = new ViewRenderer(target);
                            r.render(data, directives);
                        },
                        resolve: function () {
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
                        reject: function () {
                            //TODO: Fail?
                        },
                        handle: new EventMapper(viewElem),
                        select: new Selector(viewElem),
                        applicationScope: GlobalConfig.applicationScope
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
        Yo.RouteRunner = RouteRunner;
        var ScriptLoader = (function () {
            function ScriptLoader(container) {
                if (container === void 0) { container = document.head; }
                this.pendingScripts = [];
                this.embeddedScripts = [];
                this.container = container;
                if (!ScriptLoader.dummyScriptNode)
                    ScriptLoader.dummyScriptNode = document.createElement("script");
            }
            ScriptLoader.prototype.stateChange = function () {
                if (this.pendingScripts.length === 0) {
                    if (console && console.log)
                        console.log("Got ready state for a non existent script: ", this);
                    return;
                }
                var firstScript = this.pendingScripts[0];
                while (firstScript && firstScript.readyState === "loaded") {
                    firstScript.onreadystatechange = null;
                    this.container.appendChild(firstScript);
                    this.pendingScripts.shift();
                    firstScript = this.pendingScripts[0];
                }
                if (this.pendingScripts.length === 0) {
                    this.runEmbeddedScripts();
                }
            };
            ScriptLoader.prototype.loadSources = function (scripts) {
                if (scripts instanceof Array) {
                    for (var i = 0; i < scripts.length; i++) {
                        this.loadSource(scripts[i]);
                    }
                }
                else {
                    this.loadSource(scripts);
                }
            };
            ScriptLoader.prototype.loadTags = function (scripts) {
                if (scripts instanceof Array) {
                    for (var i = 0; i < scripts.length; i++) {
                        this.loadElement(scripts[i]);
                    }
                }
                else {
                    this.loadElement(scripts);
                }
                if (this.pendingScripts.length === 0) {
                    this.runEmbeddedScripts();
                }
            };
            ScriptLoader.prototype.loadSource = function (source) {
                var _this = this;
                if ("async" in ScriptLoader.dummyScriptNode) {
                    var script = document.createElement("script");
                    script.async = false;
                    this.pendingScripts.push(script);
                    script.addEventListener("load", function (e) { return _this.onScriptLoaded(script); });
                    script.src = source;
                    this.container.appendChild(script);
                }
                else if (ScriptLoader.dummyScriptNode.readyState) {
                    var script = document.createElement("script");
                    this.pendingScripts.push(script);
                    script.onreadystatechange = this.stateChange;
                    script.src = source;
                }
                else {
                    var script = document.createElement("script");
                    script.defer = true;
                    this.pendingScripts.push(script);
                    script.addEventListener("load", function (e) { return _this.onScriptLoaded(script); });
                    script.src = source;
                    this.container.appendChild(script);
                }
            };
            ScriptLoader.prototype.loadElement = function (tag) {
                if (tag.src) {
                    this.loadSource(tag.src);
                    return;
                }
                var script = document.createElement("script");
                script.text = tag.text;
                this.embeddedScripts.push(script);
            };
            ScriptLoader.prototype.onScriptLoaded = function (script) {
                this.pendingScripts.pop();
                if (this.pendingScripts.length === 0) {
                    this.runEmbeddedScripts();
                }
            };
            ScriptLoader.prototype.runEmbeddedScripts = function () {
                for (var i = 0; i < this.embeddedScripts.length; i++) {
                    this.container.appendChild(this.embeddedScripts[i]);
                }
                while (this.embeddedScripts.length > 0) {
                    this.embeddedScripts.pop();
                }
            };
            return ScriptLoader;
        })();
        Yo.ScriptLoader = ScriptLoader;
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
                this.applicationScope = {};
                this.viewTargets = [];
                this.basePath = window.location.pathname;
                this.defaultViewTarget = new ElementViewTarget("#YoView");
            }
            Spa.prototype.addTarget = function (name, target) {
                target.name = name;
                this.viewTargets.push(target);
            };
            /**
             * Navigate to another view.
             * @param URL Everything after the hash in the complete URI, like 'user/1'
             * @param targetElement If the result should be rendered somewhere else than the main layout div.
             */
            Spa.prototype.navigate = function (url, targetElement) {
                this.router.execute.apply(this.applicationScope, [url, targetElement]);
            };
            /**
             * Map a route
             * @param route Route string like 'user/:userId'
             * @param section Path and name of view/viewModel. 'users/index' will look for '/ViewModels/Users/IndexViewModel' and '/Views/Users/Index.html'
             * @param target Name of the target where the result should get rendered. not specified = default location;
             */
            Spa.prototype.mapRoute = function (route, section, target) {
                var runner = new RouteRunner(section, this.applicationName);
                this.handlers[section] = runner;
                var targetObj;
                if (!target) {
                    targetObj = this.defaultViewTarget;
                }
                else {
                    for (var i = 0; i < this.viewTargets.length; i++) {
                        if (this.viewTargets[i].name === target) {
                            targetObj = this.viewTargets[i];
                            break;
                        }
                    }
                    if (!targetObj) {
                        throw "Could not find view target \"" + target + "\".";
                    }
                }
                this.router.add(route, runner, targetObj);
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
         * Render view into a parent element
         */
        var BootstrapModalViewTarget = (function () {
            function BootstrapModalViewTarget() {
                /**
                 * Name is 'BootstrapModal'
                 */
                this.name = "BootstrapModal";
            }
            /**
             *
             * @param options {buttons: [{title: 'Ok', callback:function(viewElement)}]
             * @returns {}
             */
            BootstrapModalViewTarget.prototype.assignOptions = function (options) {
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
            };
            BootstrapModalViewTarget.prototype.attachViewModel = function (script) {
                this.currentNode = new BootstrapModalViewTargetRequest(this.name);
                this.currentNode.attachViewModel(script);
            };
            BootstrapModalViewTarget.prototype.setTitle = function (title) {
                this.currentNode.setTitle(title);
            };
            /**
             * Will remove innerHTML and append the specified element as the first child.
             * @param element generated view
             */
            BootstrapModalViewTarget.prototype.render = function (element) {
                this.currentNode.render(element);
                //and release
                this.currentNode = null;
            };
            return BootstrapModalViewTarget;
        })();
        Yo.BootstrapModalViewTarget = BootstrapModalViewTarget;
        /** Load view in a Boostrap modal
         */
        var BootstrapModalViewTargetRequest = (function () {
            function BootstrapModalViewTargetRequest(name) {
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
            BootstrapModalViewTargetRequest.prototype.prepare = function (options) {
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
                        }
                        else {
                            button.setAttribute('class', 'btn btn-default');
                        }
                        button.setAttribute('data-dismiss', 'modal');
                        button.innerText = item.title;
                        button.addEventListener('click', function (e) {
                            item.callback(body.firstElementChild);
                        });
                        footer.appendChild(button);
                    });
                }
            };
            BootstrapModalViewTargetRequest.prototype.attachViewModel = function (script) {
                this.node.querySelector('.modal-body').appendChild(script);
            };
            BootstrapModalViewTargetRequest.prototype.setTitle = function (title) {
                this.node.querySelector('.modal-title').innerText = title;
            };
            /**
             * Will remove innerHTML and append the specified element as the first child.
             * @param element generated view
             */
            BootstrapModalViewTargetRequest.prototype.render = function (element) {
                var _this = this;
                this.node.querySelector('.modal-body').appendChild(element);
                var footer = this.node.querySelector('.modal-footer');
                this.modal = $(this.node).modal();
                $(this.modal).on('hidden.bs.modal', function () {
                    _this.modal.modal('hide').data('bs.modal', null);
                    _this.node.parentElement.removeChild(_this.node);
                });
                var buttons = element.querySelectorAll('button,input[type="submit"],input[type="button"]');
                if (buttons.length > 0) {
                    while (footer.firstChild) {
                        footer.removeChild(footer.firstChild);
                    }
                    for (var i = 0; i < buttons.length; i++) {
                        var button = buttons[i];
                        button.className += ' btn';
                        button.addEventListener('click', function (e, button) {
                            console.log(this);
                            this.modal.modal('hide');
                            if ((button.tagName === "input" && button.getAttribute("type") !== "submit") || button.hasAttribute("data-dismiss")) {
                                window.history.go(-1);
                            }
                        }.bind(this, button));
                        footer.appendChild(buttons[i]);
                    }
                    if (buttons.length === 1) {
                        buttons[0].className += ' btn-primary';
                    }
                    else {
                        buttons[0].className += ' btn-primary';
                        buttons[buttons.length - 1].className += ' btn-cancel';
                    }
                }
                this.modal.modal('show');
            };
            return BootstrapModalViewTargetRequest;
        })();
        Yo.BootstrapModalViewTargetRequest = BootstrapModalViewTargetRequest;
        /**
         * Render view into a parent element
         */
        var ElementViewTarget = (function () {
            /**
             *
             * @param elementOrId Element to render view in
             * @returns {}
             */
            function ElementViewTarget(elementOrId) {
                /**
                 * Id attribute of the container element.
                 */
                this.name = "";
                if (typeof elementOrId === "string") {
                    this.container = document.getElementById(elementOrId.substr(1));
                    if (!this.container) {
                        throw "Could not locate \"" + elementOrId + "\"";
                    }
                }
                else {
                    this.container = elementOrId;
                }
                this.name = this.container.id;
            }
            ElementViewTarget.prototype.assignOptions = function () {
            };
            ElementViewTarget.prototype.attachViewModel = function (script) {
                this.container.appendChild(script);
            };
            ElementViewTarget.prototype.setTitle = function (title) {
            };
            /**
             * Will remove innerHTML and append the specified element as the first child.
             * @param element generated view
             */
            ElementViewTarget.prototype.render = function (element) {
                //delete everything but our view model script.
                while (this.container.firstElementChild && this.container.firstElementChild.nextElementSibling != null)
                    this.container.removeChild(this.container.firstElementChild);
                this.container.innerHTML = "";
                this.container.appendChild(element);
            };
            return ElementViewTarget;
        })();
        Yo.ElementViewTarget = ElementViewTarget;
        var ClassFactory = (function () {
            function ClassFactory() {
            }
            //credits: http://stackoverflow.com/a/2441972/70386
            ClassFactory.getConstructor = function (appName, viewModelModuleAndName) {
                var nameParts = viewModelModuleAndName.split(".");
                var fn = (window[appName] || this[appName]);
                if (typeof fn === "undefined") {
                    throw new Error("Failed to load application namespace \"" + appName + "\". Have a view model been loaded successfully?");
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
                        throw new Error("Could not find \"" + nameParts[i] + "\" from viewModel name, complete name: \"" + appName + "." + viewModelModuleAndName + "\".");
                    fn = fn[foundName];
                }
                if (typeof fn !== "function") {
                    throw new Error("Could not find view model " + viewModelModuleAndName);
                }
                return fn;
            };
            return ClassFactory;
        })();
        Yo.ClassFactory = ClassFactory;
        var DomUtils = (function () {
            function DomUtils() {
            }
            DomUtils.removeChildren = function (n) {
                if (!n) {
                    throw new Error("Element not set: " + n);
                }
                while (n.firstChild) {
                    n.removeChild(n.firstChild);
                }
            };
            DomUtils.moveChildren = function (source, target) {
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
            DomUtils.getIdentifier = function (e) {
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
            };
            return DomUtils;
        })();
        Yo.DomUtils = DomUtils;
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
        var FormReader = (function () {
            function FormReader(elemOrName) {
                this.stack = [];
                if (typeof elemOrName === "string") {
                    this.container = document.querySelector('#' + elemOrName + ",[data-name=\"" + elemOrName + "\"]");
                    if (!this.container) {
                        throw new Error("Failed to locate '" + elemOrName + "'.");
                    }
                }
                else {
                    this.container = elemOrName;
                }
            }
            FormReader.prototype.read = function () {
                var motherObject = {};
                for (var i = 0; i < this.container.childElementCount; i++) {
                    var element = this.container.children[i];
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
                    }
                    else {
                        childValue = this.pullElement(element);
                        childValue = this.adjustCheckboxes(element, motherObject, childValue);
                    }
                    this.assignByName(name, motherObject, childValue);
                }
                return motherObject;
            };
            FormReader.prototype.pullCollection = function (container) {
                var arr = [];
                var currentArrayItem = {};
                var addedItems = [];
                var currentIndexer = null;
                for (var i = 0; i < container.childElementCount; i++) {
                    var elem = container.children[i];
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
                    }
                    else {
                        value = this.pullElement(elem);
                        if (value === null) {
                            continue;
                        }
                    }
                    //only want a single value array
                    if (name === '[]') {
                        arr.push(value);
                    }
                    else {
                        this.assignByName(name, currentArrayItem, value);
                    }
                }
                if (!this.isObjectEmpty(currentArrayItem)) {
                    arr.push(currentArrayItem);
                }
                return arr;
            };
            FormReader.prototype.pullElement = function (container) {
                if (container.childElementCount === 0) {
                    if (container.tagName == 'SELECT') {
                        var select = container;
                        if (select.selectedIndex == -1) {
                            return null;
                        }
                        var value1 = select.options[select.selectedIndex];
                        return this.processValue(value1);
                    }
                    else if (container.tagName == 'INPUT') {
                        var input = container;
                        var typeStr = container.getAttribute('type');
                        if (typeStr === 'radio' || typeStr === 'checkbox') {
                            if (input.checked) {
                                return this.processValue(input.value);
                            }
                            return null;
                        }
                        return this.processValue(input.value);
                    }
                    else {
                        var value3 = container.getAttribute('value') || '';
                        return this.processValue(value3);
                    }
                }
                var data = {};
                for (var i = 0; i < container.childElementCount; i++) {
                    var element = container.children[i];
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
                    }
                    else {
                        value = this.pullElement(element);
                        value = this.adjustCheckboxes(element, data, value);
                        if (value === null) {
                            continue;
                        }
                    }
                    this.assignByName(name, data, value);
                }
                return this.isObjectEmpty(data) ? null : data;
            };
            FormReader.prototype.adjustCheckboxes = function (element, dto, value) {
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
            };
            FormReader.prototype.processValue = function (value) {
                if (!isNaN(value)) {
                    return parseInt(value, 10);
                }
                else if (value == 'true') {
                    return true;
                }
                else if (value == 'false') {
                    return false;
                }
                return value;
            };
            FormReader.prototype.assignByName = function (name, parentObject, value) {
                var parts = name.split('.');
                var obj = parentObject;
                var parent = parentObject;
                var lastKey = '';
                parts.forEach(function (key) {
                    lastKey = key;
                    if (!obj.hasOwnProperty(key)) {
                        obj[key] = {};
                    }
                    parent = obj;
                    obj = obj[key];
                });
                parent[lastKey] = value;
            };
            FormReader.prototype.appendObject = function (target, extras) {
                for (var key in extras) {
                    if (!target.hasOwnProperty(key)) {
                        target[key] = extras[key];
                    }
                }
            };
            FormReader.prototype.isObjectEmpty = function (data) {
                for (var name in data) {
                    if (data.hasOwnProperty(name)) {
                        return false;
                    }
                }
                return true;
            };
            FormReader.prototype.getName = function (el) {
                return el.getAttribute('name') || el.getAttribute('data-name') || el.getAttribute('data-collection');
            };
            FormReader.prototype.isCollection = function (el) {
                return el.hasAttribute('data-collection');
            };
            return FormReader;
        })();
        Yo.FormReader = FormReader;
        ;
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
                if (idOrselector.substr(0, 1) === "#") {
                    var el2 = this.scope.querySelector(idOrselector);
                    if (!el2) {
                        throw new Error("Failed to find element '" + idOrselector + "'.");
                    }
                    return el2;
                }
                if (idOrselector.match(/[\s\.\,\[]+/g) === null) {
                    var result = this.scope.querySelector("[data-name='" + idOrselector + "'],[data-collection='" + idOrselector + "'],[name=\"" + idOrselector + "\"],#" + idOrselector);
                    if (result)
                        return result;
                }
                var item = this.scope.querySelector(idOrselector);
                if (!item)
                    throw Error("Failed to find \"" + idOrselector + "\".");
                return item;
            };
            Selector.prototype.all = function (selector) {
                var result = [];
                var items = selector.match("[\s\.,\[]+").length === 0
                    ? this.scope.querySelectorAll("[data-name=\"" + selector + "\"],[data-collection='" + selector + "'],[name=\"" + selector + "\"],#" + selector)
                    : this.scope.querySelectorAll(selector);
                for (var i = 0; i < items.length; i++) {
                    result.push(items[i]);
                }
                return result;
            };
            return Selector;
        })();
        Yo.Selector = Selector;
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
        Yo.ViewRenderer = ViewRenderer;
        var ViewValueDirectiveContext = (function () {
            function ViewValueDirectiveContext() {
            }
            return ViewValueDirectiveContext;
        })();
        Yo.ViewValueDirectiveContext = ViewValueDirectiveContext;
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
        /**
         * Global config for extensibility
         */
        var GlobalConfig = (function () {
            function GlobalConfig() {
            }
            /**
             * Passed to the constructor of the view model (and in the IActivationContext);
             */
            GlobalConfig.applicationScope = {};
            return GlobalConfig;
        })();
        Yo.GlobalConfig = GlobalConfig;
        GlobalConfig.resourceLocator = {
            getHtml: function (section) {
                var path = window.location.pathname;
                if (window.location.pathname.indexOf(".") > -1) {
                    var pos = window.location.pathname.lastIndexOf("/");
                    path = window.location.pathname.substr(0, pos);
                }
                if (path.substring(-1, 1) === "/") {
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
                if (path.substring(-1, 1) === "/") {
                    path = path.substring(0, -1);
                }
                return path + ("/ViewModels/" + section + "ViewModel.js");
            }
        };
        GlobalConfig.applicationScope = {};
        GlobalConfig.viewModelFactory = {
            create: function (applicationName, fullViewModelName) {
                var viewModelConstructor = ClassFactory.getConstructor(applicationName, fullViewModelName);
                return new viewModelConstructor(GlobalConfig.applicationScope);
            }
        };
    })(Yo = Griffin.Yo || (Griffin.Yo = {}));
})(Griffin || (Griffin = {}));
//# sourceMappingURL=Griffin.Yo.js.map