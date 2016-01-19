var Griffin;
(function (Griffin) {
    var Yo;
    (function (Yo) {
        var Net;
        (function (Net) {
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
            Net.Http = Http;
        })(Net = Yo.Net || (Yo.Net = {}));
    })(Yo = Griffin.Yo || (Griffin.Yo = {}));
})(Griffin || (Griffin = {}));
//# sourceMappingURL=Net.js.map