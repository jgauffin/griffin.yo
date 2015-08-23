/**
 * Global config for extensibility
 */
export class GlobalConfig {
	/**
	 * Can be used to modify the path which is returned.
	 */
	static resourceLocator: IResourceLocator;
	static viewModelFactory: IViewModelFactory;


	/**
	 * Passed to the constructor of the view model (and in the IActivationContext);
	 */
	static applicationScope = {};
}



GlobalConfig.resourceLocator = {
	getHtml(section): string {
		let path = window.location.pathname;
		if (window.location.pathname.indexOf(".") > -1) {
			const pos = window.location.pathname.lastIndexOf("/");
			path = window.location.pathname.substr(0, pos);
		}
		if (path.substring(-1, 1) === "/") {
			path = path.substring(0, -1);
		}
		return path + `/Views/${section}.html`;
	},
	getScript(section): string {
		let path = window.location.pathname;
		if (window.location.pathname.indexOf(".") > -1) {
			const pos = window.location.pathname.lastIndexOf("/");
			path = window.location.pathname.substr(0, pos);
		}
		if (path.substring(-1, 1) === "/") {
			path = path.substring(0, -1);
		}
		return path + `/ViewModels/${section}ViewModel.js`;
	}
};

GlobalConfig.applicationScope = {};
GlobalConfig.viewModelFactory = {
	create(applicationName: string, fullViewModelName: string): IViewModel {
		const viewModelConstructor = ClassFactory.getConstructor(applicationName, fullViewModelName);
		return <IViewModel>new viewModelConstructor(GlobalConfig.applicationScope);
	}
};