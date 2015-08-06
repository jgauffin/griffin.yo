define(["require", "exports"], function (require, exports) {
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
            if (typeof this.target !== "undefined") {
                executionCtx.target = this.target;
            }
            this.handler.invoke(executionCtx);
        };
        return Route;
    })();
    exports.Route = Route;
});
