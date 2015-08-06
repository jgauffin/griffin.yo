export interface IRouteContext {

	/**
	 * URL being visited (everything after the hash/hashbang)
	 */
	url: string;

	/**
	 * Specified if something else than the main view container is the target.
	 */
	targetElement?: HTMLElement;
}
