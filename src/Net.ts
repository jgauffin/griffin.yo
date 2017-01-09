module Griffin.Yo.Net {

    /**
     * Our wrapper around AJAX focused on loading resources and data from the server.
     */
    export class Http {
        private static cache: any = {};

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
                var cache: any = this.cache[url];
                request.setRequestHeader("If-Modified-Since", cache.modifiedAt);
            }
            request.setRequestHeader("Content-Type", contentType);
            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    if (request.status === 304) {
                        request["responseText"] = this.cache[url].content;
                    } else {
                        const header: string = request.getResponseHeader("Last-Modified");
                        if (header) {
                            this.cache[url] = {
                                content: request.responseText,
                                modifiedAt: header
                            };
                        }
                    }

                    if (contentType === "application/json") {
                        request["responseBody"] = JSON.parse(request.responseText);
                        
                        //for browser that locks well defined objects
                        //(like IE)
                        var tempFix:any = request;
                        tempFix["responseJson"] = JSON.parse(request.responseText);
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

            var request: XMLHttpRequest = new XMLHttpRequest();
            if (options && options.userName) {
                request.open(verb, url, true, options.userName, options.password);
            } else {
                request.open(verb, url, true);
            }


            var requestContentType: string = "application/json";
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
                        var temp = <any>request;
                        temp["responseJson"] = JSON.parse(request.responseText);
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
}
