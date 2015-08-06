export class EventMapper {
	private scope: any;

	constructor(scope?: HTMLElement) {
		if (typeof scope === "undefined") {
			this.scope = document;
		} else {
			this.scope = scope;
		}
	}

	click(selector: string, listener: (ev: MouseEvent) => any, useCapture?: boolean): void {
		const items = this.scope.querySelectorAll(selector);
		if (items.length === 0)
			throw new Error(`Failed to bind "click" to selector "${selector}", no elements found.`);

		for (let i = 0; i < items.length; i++) {
			items[i].addEventListener("click", listener, useCapture);
		}
	}

	change(selector: string, listener: (ev: Event) => any, useCapture?: boolean): void {
		const items = this.scope.querySelectorAll(selector);
		if (items.length === 0)
			throw new Error(`Failed to bind "change" to selector "${selector}", no elements found.`);
		for (let i = 0; i < items.length; i++) {
			items[i].addEventListener("change", listener, useCapture);
		}
	}

	keyUp(selector: string, listener: (ev: KeyboardEvent) => any, useCapture?: boolean): void {
		const items = this.scope.querySelectorAll(selector);
		if (items.length === 0)
			throw new Error(`Failed to bind "keyup" to selector "${selector}", no elements found.`);

		for (let i = 0; i < items.length; i++) {
			items[i].addEventListener("keyup", listener, useCapture);
		}
	}

	keyDown(selector: string, listener: (ev: KeyboardEvent) => any, useCapture?: boolean): void {
		const items = this.scope.querySelectorAll(selector);
		if (items.length === 0)
			throw new Error(`Failed to bind "keydown" to selector "${selector}", no elements found.`);

		for (let i = 0; i < items.length; i++) {
			items[i].addEventListener("keydown", listener, useCapture);
		}
	}
}