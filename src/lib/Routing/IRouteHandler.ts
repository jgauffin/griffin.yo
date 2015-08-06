/**
 * Takes care of a specific route
 */
export interface IRouteHandler {
	/**
	 * Invoke handler for the matching route.
	 * @param ctx Information required to invoke the route
	 */
	invoke(ctx: IRouteExecutionContext): void;
}
