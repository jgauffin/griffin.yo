/**
 * A view model (controlling what is presented in a view and also acts on events)
 */
export interface IViewModel {
	/**
	 * Document title
	 * Will be invoked after activate as been run
	 */
	getTitle(): string;

	/**
	 * This viewModel just became active.
	 */
	activate(context: IActivationContext): void;

	/**
	 * User is navigating away from this view model.
	 */
	deactivate();
}