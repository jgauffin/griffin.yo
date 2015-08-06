export class ClassFactory
{
	//credits: http://stackoverflow.com/a/2441972/70386
	public static getConstructor(appName: string, viewModelModuleAndName: string): any {
		const nameParts = viewModelModuleAndName.split(".");
		let fn = (window[appName] || this[appName]);
		if (typeof fn === "undefined") {
			throw new Error(`Failed to load application namespace "${appName}'. Have a view model been loaded successfully?`);
		}
		for (var i = 0, len = nameParts.length; i < len; i++) {
			if (fn.hasOwnProperty(nameParts[i])) {
				console.log('....identified', nameParts[i]);
				fn = fn[nameParts[i]];
				continue;
			}
			const name = nameParts[i].toLowerCase();
			let foundName;
			for (let propertyName in fn) {
				if (!fn.hasOwnProperty(propertyName)) {
					continue;
				}
				if (propertyName.toLowerCase() === name) {
					foundName = propertyName;
				}
			}

			
			if (typeof foundName === "undefined")
				throw new Error(`Could not find "${nameParts[i]}" from viewModel name, complete name: "${appName}.${viewModelModuleAndName}".`);

			fn = fn[foundName];
		}

		if (typeof fn !== "function") {
			throw new Error(`Could not find view model ${viewModelModuleAndName}`);
		}
		return fn;
	}
}