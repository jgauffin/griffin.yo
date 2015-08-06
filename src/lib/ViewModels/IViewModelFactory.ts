/**
 * Implement if you would like to control how view models are created.
 * The script containing the view model have been loaded before this interface
 * is being called. 
 */
export interface IViewModelFactory {
	create(applicationName: string, fullViewModelName: string): IViewModel;
}
