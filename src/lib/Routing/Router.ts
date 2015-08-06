/**
 * Translates a uri to a route.
 */
export class Router {
	private routes: IRoute[] = [];

	/**
	 * Route an URL
	 * @param route URL to act on (vars should be prefixed with colon: '/user/:userId').
	 * @param handler used to invoke the VM if the route matches.
	 * @param targetElement id or HTML element (where the result should be rendered)
	 * @returns {} 
	 */
	add(route: string, handler: IRouteHandler, targetElement?: any) {
		this.routes.push(new Route(route, handler, targetElement));
	}

	/**
	 * Add a custom route
	 * @param route route 
	 */
	addRoute(route: IRoute) {
		if (typeof route === "undefined")
			throw new Error("Route must be specified.");

		this.routes.push(route);
	}

	execute(url: string, targetElement?: any): boolean {
		if (url.length) {
			url = url
				.replace(/\/+/g, "/") //remove double slashes
				.replace(/^\/|\/($|\?)/, "") //trim slashes
				.replace(/#.*$/, "");
		}
		const ctx: IRouteContext = {
			url: url
		};
		if (typeof targetElement !== "undefined") {
			if (typeof targetElement === "string") {
				ctx.targetElement = document.getElementById(targetElement);
				if (!ctx.targetElement) {
					throw new Error(`Failed to identify '${targetElement}'`);
				}
			}
			ctx.targetElement = targetElement;
		}

		for (let i = 0; i < this.routes.length; i++) {
			const route = this.routes[i];
			if (route.isMatch(ctx)) {
				route.invoke(ctx);
				return true;
			}
		}

		if (console && console.log) {
			console.log(`Route not found for "${url}"`);
		}
		return false;
	}
}
