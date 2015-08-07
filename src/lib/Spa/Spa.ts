


/**
 * Facade for the SPA handling
 */
export class Spa {
	private router = new Router();
	private handlers: RouteRunner[] = [];
	private basePath = "";
	private applicationScope = {};
	private viewTargets : IViewTarget[] = [];
	private defaultViewTarget: IViewTarget;

	/**
			 * Create Spa.
			 * @param applicationName Only used for namespacing of VMs
			 */
	constructor(public applicationName: string) {
		this.basePath = window.location.pathname;
		this.defaultViewTarget = new ElementViewTarget("#YoView");
	}

	addTarget(name: string, target: IViewTarget) {
		this.viewTargets.push(target);
	}

	/**
	 * Navigate to another view.
	 * @param URL Everything after the hash in the complete URI, like 'user/1'
	 * @param targetElement If the result should be rendered somewhere else than the main layout div.
	 */
	navigate(url: string, targetElement?: any) {
		this.router.execute.apply(this.applicationScope, [url, targetElement]);
	}

	/**
	 * Map a route
	 * @param route Route string like 'user/:userId'
	 * @param section Path and name of view/viewModel. 'users/index' will look for '/ViewModels/Users/IndexViewModel' and '/Views/Users/Index.html'
	 * @param target Name of the target where the result should get rendered. not specified = default location;
	 */
	mapRoute(route: any, section: string, target?: string) {
		const runner = new RouteRunner(section, this.applicationName);
		this.handlers[section] = runner;

		var targetObj: IViewTarget;
		if (!target) {
			targetObj = this.defaultViewTarget;
		} else {
			for (var i = 0; i < this.viewTargets.length; i++) {
				if (this.viewTargets[i].name === target) {
					targetObj = this.viewTargets[i];
					break;
				}
			}
			if (!targetObj) {
				throw `Could not find view target "${target}".`;
			}
		}

		this.router.add(route, runner, targetObj);
	}

	/**
	 * Start the spa application (i.e. load the default route)
	 */
	run() {

		//no shebang pls.
		let url = window.location.hash.substring(1);
		if (url.substr(0, 1) === "!") {
			url = url.substr(1);
		}

		window.addEventListener("hashchange", () => {

			// allow regular hash links on pages
			// by required hashbangs (#/!) or just hash'slash'em (#/)
			if (window.location.hash.substr(1, 1) !== "/")
				return;

			// remove shebang
			var changedUrl = window.location.hash.substr(2);
			if (changedUrl.substr(0, 1) === "!") {
				changedUrl = changedUrl.substr(1);
			}
			this.router.execute(changedUrl);
		});

		this.router.execute(url);
	}

	private mapFunctionToRouteData(f: Function, routeData: any) {
		const re = /^\s*function\s+(?:\w*\s*)?\((.*?)\)/;
		const args = f.toString().match(re);
		const test = f[1].trim().split(/\s*,\s*/);
	}
}
