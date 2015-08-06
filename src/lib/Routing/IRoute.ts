export interface IRoute {
	/**
	 * Is the URL in the context mathing this route?
	 * @param ctx information used for matching
	 */
	isMatch(ctx: IRouteContext): boolean;

	/**
	 * Invoke this route.
	 * @param ctx route information
	 */
	invoke(ctx: IRouteContext): void;
}
