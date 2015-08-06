/**
 * Used to render a generated view into a target (could be a HTML div or a generated bootstrap modal).
 */
export interface IViewTarget {
	/**
	 * Name of this target
	 */
	name: string;

	/**
	 * Set the title for the target.
	 * @param title 
	 * 
	 * Can be invoked to set the title of the view target.
	 */
	setTitle(title: string);

	/**
	 * The container to use when doing context selections (querySelector) in the view model logic.
	 */
	//getSelectionContainer():HTMLElement;

	/**
	 * Prepare the target for a new view model (and view).
	 * @param options Options specific for the implementation
	 * Invoked after attachViewModel
	 */
	assignOptions(options:any);

	/**
	 * Attach the view model script (so that it get loaded into the DOM).
	 * @param script View model
	 */
	attachViewModel(script: HTMLScriptElement);

	/**
	 * Render element into the target
	 * @param element Element containing the view (result generated with the help of the view model)
	 * 
	 * Invoked once the view model has been run and generated a view.
	 */
	render(element:HTMLElement):void;
}