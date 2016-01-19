/// <reference path="Routing.ViewTargets.ts"/>
var Griffin;
(function (Griffin) {
    var Yo;
    (function (Yo) {
        var Routing;
        (function (Routing) {
            ;
            //#endregion "interfaces"
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
            Routing.Route = Route;
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
            Routing.Router = Router;
        })(Routing = Yo.Routing || (Yo.Routing = {}));
    })(Yo = Griffin.Yo || (Griffin.Yo = {}));
})(Griffin || (Griffin = {}));
//# sourceMappingURL=Routing.js.map