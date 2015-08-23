export class Selector {
	private scope: any;

	constructor(scope?: HTMLElement) {
		if (typeof scope === "undefined") {
			this.scope = document;
		} else {
			this.scope = scope;
		}
		if (!this.scope)
			throw new Error("Failed to identify scope");
	}

	one(idOrselector: string): HTMLElement {
		if (idOrselector.substr(0, 1) === "#") {
			let el2 = this.scope.querySelector(idOrselector);
			if (!el2) {
				throw new Error(`Failed to find element '${idOrselector}'.`);
			}
			return <HTMLElement>el2;
		}

		if (idOrselector.match(/[\s\.\,\[]+/g) === null) {
			var result = this.scope.querySelector(`[data-name='${idOrselector}'],[data-collection='${idOrselector}'],[name="${idOrselector}"],#${idOrselector}`);
			if (result)
				return result;
		}
		var item = <HTMLElement>this.scope.querySelector(idOrselector);
		if (!item)
			throw Error(`Failed to find "${idOrselector}".`);
		return item;
	}

	all(selector: string): HTMLElement[] {
		const result: HTMLElement[] = [];

		const items = selector.match("[\s\.,\[]+").length === 0
			? this.scope.querySelectorAll(`[data-name="${selector}"],[data-collection='${selector}'],[name="${selector}"],#${selector}`)
			: this.scope.querySelectorAll(selector);
		for (let i = 0; i < items.length; i++) {
			result.push(<HTMLElement>items[i]);
		}
		return result;
	}

}
