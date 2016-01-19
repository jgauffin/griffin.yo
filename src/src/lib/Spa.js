/// <reference path="Routing.ts"/>
/// <reference path="Spa.ViewModels.ts"/>
var Griffin;
(function (Griffin) {
    var Yo;
    (function (Yo) {
        var Spa;
        (function (Spa_1) {
            var Routing = Yo.Routing;
            var ViewTargets = Yo.Routing.ViewTargets;
            var ViewModels = Yo.Spa.ViewModels;
            var Dom = Yo.Dom;
            var Views = Yo.Views;
            var Net = Yo.Net;
            var Config = (function () {
                function Config() {
                }
                /**
                 * Attach your application specific information to this property.
                 */
                Config.applicationScope = {};
                return Config;
            })();
            Spa_1.Config = Config;
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
                        Dom.ElemUtils.removeChildren(targetElem);
                        Dom.ElemUtils.moveChildren(nav, targetElem);
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
                        _this.viewModel = Config.viewModelFactory.create(_this.applicationName, className);
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
                                var r = new Views.ViewRenderer(viewElem);
                                r.render(data, directives);
                            },
                            readForm: function (selector) {
                                var reader = new Dom.FormReader(selector);
                                return reader.read();
                            },
                            renderPartial: function (selector, data, directives) {
                                var selector1 = new Dom.Selector(viewElem);
                                var target = selector1.one(selector);
                                var r = new Views.ViewRenderer(target);
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
                            handle: new Dom.EventMapper(viewElem),
                            select: new Dom.Selector(viewElem),
                            applicationScope: Config.applicationScope
                        };
                        _this.viewModel.activate(activationContext);
                    });
                };
                RouteRunner.prototype.ensureResources = function (callback) {
                    var _this = this;
                    var bothPreloaded = true;
                    var self = this;
                    if (typeof this.html === "undefined") {
                        var path = Config.resourceLocator.getHtml(this.section);
                        Net.Http.get(path, function (xhr, success) {
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
                        var path = Config.resourceLocator.getScript(this.section);
                        Net.Http.get(path, function (xhr, success) {
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
            Spa_1.RouteRunner = RouteRunner;
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
            Spa_1.ScriptLoader = ScriptLoader;
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
                    this.router = new Routing.Router();
                    this.handlers = [];
                    this.basePath = "";
                    this.applicationScope = {};
                    this.viewTargets = [];
                    this.basePath = window.location.pathname;
                    this.defaultViewTarget = new ViewTargets.ElementViewTarget("#YoView");
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
            Spa_1.Spa = Spa;
            Config.resourceLocator = {
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
            Config.viewModelFactory = {
                create: function (applicationName, fullViewModelName) {
                    var viewModelConstructor = ViewModels.ClassFactory.getConstructor(applicationName, fullViewModelName);
                    return new viewModelConstructor(Config.applicationScope);
                }
            };
        })(Spa = Yo.Spa || (Yo.Spa = {}));
    })(Yo = Griffin.Yo || (Griffin.Yo = {}));
})(Griffin || (Griffin = {}));
//# sourceMappingURL=Spa.js.map