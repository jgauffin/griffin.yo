/**
  * Context used when a view model is activated.
  * Do note that the VM MUST invoke either resolve or reject once all data have been loaded. No rendering
  * will take place unless so.
  */
export interface IActivationContext {
	/**
	 * Information resolved from the route mapping.
	 * For instance if the route is 'user/:userId' then this will be the object '{ userId: 10 }'.
	 */
	routeData: any;

	/**
	 * Element that the view is being rendered into. It has not been attached to the document yet.
	 */
	viewContainer: HTMLElement;

	/**
	 * Should be used to populate the view with information
	 * @param data data to populate the view with
	 * @param directives directives that adopts the data to fit the view.
	 */
	render(data: any, directives?: any);

	/**
	 * Render partial view
	 * @param partialSelector Id/Selector for the part to update
	 * @param data data to populate the part with
	 * @param directives directives that adopts the data to fit the view.
	 */
	renderPartial(partialSelector: string, data: any, directives?: any);


	/**
	 * Used to identify elements in the view
	 */
	select: Selector;

	/**
	 * Used to subscribe on events in the view.
	 */
	handle: EventMapper;

	/**
	 * View model has been initialized OK, View can be loaded.
	 */
	resolve(): void;

	/**
	 * View model failed to load OK
	 */
	reject(): void;

	/**
	 * Application wide scope (used to store application specific data). Defined in GlobalConfig.
	 */
	applicationScope:any;
}