/**
 * Used when views (html) and view models (js) should be loaded.
 * Default implementation fetches them from the server.
 */
export interface IResourceLocator {
	getHtml(section: string): string;
	getScript(section: string): string;
}
