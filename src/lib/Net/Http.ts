

/**
 * Our wrapper around AJAX focused on loading resources and data from the server.
 */
export class Http {
	private static cache = {};

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
			const cache = this.cache[url];
			request.setRequestHeader("If-Modified-Since", cache.modifiedAt);
		}
		request.setRequestHeader("Content-Type", contentType);
		request.onload = () => {
			if (request.status >= 200 && request.status < 400) {
				if (request.status === 304) {
					request.responseText = this.cache[url].content;
				} else {
					const header = request.getResponseHeader("Last-Modified");
					if (header) {
						this.cache[url] = {
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
			} else {
				callback(request, false);
			}
		};

		request.onerror = () => {
			callback(request, false);
		};
		request.send();
	}
}

