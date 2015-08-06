/**
 * Represents a route
 */
export class Route implements IRoute {
	private parts: string[] = [];

	constructor(public route: string, public handler: IRouteHandler, public target?: IViewTarget) {
		this.parts = route.replace(/^\//, "").split("/");
	}

	isMatch(ctx: IRouteContext): boolean {
		const urlParts = ctx.url.split("/", 10);
		for (let i = 0; i < this.parts.length; i++) {
			const myPart = this.parts[i];
			const pathPart = urlParts[i];
			if (pathPart !== undefined) {
				if (myPart.charAt(0) === ":") {
					continue;
				} else if (myPart !== pathPart) {
					return false;
				}
			} else if (myPart.charAt(0) !== ":") {
				//not an argument, i.e not optional
				return false;
			} else {
				return false;
			}
		}

		return true;
	}

	invoke(ctx: IRouteContext) {
		const urlParts = ctx.url.split("/", 10);
		const routeData = {};
		for (let i = 0; i < this.parts.length; i++) {
			const myPart = this.parts[i];
			const pathPart = urlParts[i];
			if (pathPart !== "undefined") {
				if (myPart.charAt(0) === ":") {
					routeData[myPart.substr(1)] = pathPart;
				}
			} else if (myPart.charAt(0) === ":") {
				routeData[myPart.substr(1)] = null;
			}
		}
		const executionCtx: IRouteExecutionContext = {
			routeData: routeData,
			route: this
		};
		if (typeof this.target !== "undefined") {
			executionCtx.target = this.target;
		}

		this.handler.invoke(executionCtx);
	}
}