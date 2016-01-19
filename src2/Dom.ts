module Griffin.Yo.Dom {
	export class ElemUtils {
		static removeChildren(n: Node) {
			if (!n) {
				throw new Error(`Element not set: ${n}`);
			}
			while (n.firstChild) {
				n.removeChild(n.firstChild);
			}
		}

		static moveChildren(source: HTMLElement, target: HTMLElement) {
			while (source.firstChild) {
				target.appendChild(source.firstChild);
			}

			if (source.parentElement) {
				source.parentElement.removeChild(source);
			} else {
				source.remove();
			}
		}

		static getIdentifier(e: HTMLElement): string {
			if (e.id)
				return e.id;

			var name = e.getAttribute("name");
			if (name != null)
				return name;

			name = e.getAttribute("data-name");
			if (name != null)
				return name;

			var attrs = '';
			for (var i = 0; i < e.attributes.length; i++) {
				attrs = attrs + e.attributes[i].name + "=" + e.attributes[i].value + ",";
			}

			return e.tagName + "[" + attrs.substr(0, attrs.length - 1) + "]";
		}
	}


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

	export class FormReader {
		private container: HTMLElement;
		private stack: string[] = [];
		constructor(elemOrName: HTMLElement | string) {
			if (typeof elemOrName === "string") {
				this.container = <HTMLElement>document.querySelector('#' + elemOrName + ",[data-name=\"" + elemOrName + "\"]");
				if (!this.container) {
					throw new Error("Failed to locate '" + elemOrName + "'.");
				}
			} else {
				this.container = elemOrName;
			}
		}

		public read(): any {
			var motherObject = {};
			for (let i = 0; i < this.container.childElementCount; i++) {
				var element = <HTMLElement>this.container.children[i];
				var name = this.getName(element);

				//no name, maybe got nested data
				if (!name) {
					var data = this.pullElement(element);
					if (data) {
						this.appendObject(motherObject, data);
					}
					continue;
				}

				var childValue: any;
				if (this.isCollection(element)) {
					childValue = this.pullCollection(element);
				} else {
					childValue = this.pullElement(element);
					childValue = this.adjustCheckboxes(element, motherObject, childValue);
				}
				this.assignByName(name, motherObject, childValue);
			}

			return motherObject;
		}

		private pullCollection(container: HTMLElement): any {
			var arr: any[] = [];
			var currentArrayItem: any = {};
			var addedItems: any[] = [];
			var currentIndexer: any = null;
			for (let i = 0; i < container.childElementCount; i++) {
				var elem = <HTMLElement>container.children[i];
				var name = this.getName(elem);
				if (!name) {
					var value = this.pullElement(elem);
					if (!this.isObjectEmpty(value)) {
						if (!this.isObjectEmpty(currentArrayItem)) {
							arr.push(currentArrayItem);
						}
						arr.push(value);
						currentArrayItem = {};
						addedItems = [];
					}
					continue;
				}

				// theese can be repeated for the same item
				// so ignore them when processing DOM
				var isOptionOrCheckbox = elem.getAttribute('type') === 'checkbox'
					|| elem.getAttribute('type') === 'radio';

				//keep track of input names
				//so that we can detect when a new item is started.
				if (name !== '[]'
					&& addedItems.indexOf(name) >= 0
					&& !isOptionOrCheckbox) {
					arr.push(currentArrayItem);
					currentArrayItem = {};
					addedItems = [];
				}
				addedItems.push(name);

				var value;
				if (this.isCollection(elem)) {
					value = this.pullCollection(elem);
				} else {
					value = this.pullElement(elem);
					if (value === null) {
						continue;
					}
				}

				//only want a single value array
				if (name === '[]') {
					arr.push(value);
				} else {
					this.assignByName(name, currentArrayItem, value);
				}
			}

			if (!this.isObjectEmpty(currentArrayItem)) {
				arr.push(currentArrayItem);
			}

			return arr;
		}


		private pullElement(container: HTMLElement): any {
			if (container.childElementCount === 0) {
				if (container.tagName == 'SELECT') {
					var select = <HTMLSelectElement>container;
					if (select.selectedIndex == -1) {
						return null;
					}
					let value1 = <HTMLOptionElement>select.options[select.selectedIndex];
					return this.processValue(value1.value);
				} else if (container.tagName == 'INPUT') {
					var input = <HTMLInputElement>container;
					var typeStr = container.getAttribute('type');
					if (typeStr === 'radio' || typeStr === 'checkbox') {
						if (input.checked) {
							return this.processValue(input.value);
						}
						return null;
					}
					return this.processValue(input.value);
				} else {
					let value3 = container.getAttribute('value') || '';
					return this.processValue(value3);
				}
			}

			var data = {};
			for (let i = 0; i < container.childElementCount; i++) {
				var element = <HTMLElement>container.children[i];
				var name = this.getName(element);
				if (!name) {
					var value = this.pullElement(element);
					if (!this.isObjectEmpty(value)) {
						this.appendObject(data, value);
					}
					continue;
				}
				var value;

				if (this.isCollection(element)) {
					value = this.pullCollection(element);
				} else {
					value = this.pullElement(element);
					value = this.adjustCheckboxes(element, data, value);
					if (value === null) {
						continue;
					}
				}
				this.assignByName(name, data, value);
			}

			return this.isObjectEmpty(data) ? null : data;
		}

		private adjustCheckboxes(element: HTMLElement, dto: any, value: any): any {
			//checkboxes should be arrays
			if (value !== null && element.tagName === "INPUT" && element.getAttribute("type") === "checkbox") {
				//todo: fetch value using dot notation.
				var name = this.getName(element);
				var currentValue = dto[name];
				if (typeof currentValue !== "undefined") {
					if (currentValue instanceof Array) {
						currentValue["push"](value);
						value = currentValue;
					}
					else {
						value = [currentValue, value];
					}
				}
				else {
					value = [value];
				}
			}

			return value;
		}
		private processValue(value: string): any {
			if (!isNaN(<any>value)) {
				return parseInt(value, 10);
			} else if (value == 'true') {
				return true;
			} else if (value == 'false') {
				return false;
			}

			return value;
		}
		private assignByName(name: string, parentObject: any, value: any) {
			var parts = name.split('.');
			var obj = parentObject;
			var parent = parentObject;
			var lastKey = '';
			parts.forEach(key => {
				lastKey = key;
				if (!obj.hasOwnProperty(key)) {
					obj[key] = {};
				}
				parent = obj;
				obj = obj[key];
			});
			parent[lastKey] = value;
		}

		private appendObject(target: any, extras: any) {
			for (var key in extras) {
				if (!target.hasOwnProperty(key)) {
					target[key] = extras[key];
				}
			}
		}
		private isObjectEmpty(data: any): boolean {
			for (var name in data) {
				if (data.hasOwnProperty(name)) {
					return false;
				}
			}

			return true;
		}
		private getName(el: HTMLElement): string {
			return el.getAttribute('name') || el.getAttribute('data-name') || el.getAttribute('data-collection');
		}

		private isCollection(el: HTMLElement): boolean {
			return el.hasAttribute('data-collection');
		}
	}


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

	//export {ElemUtils, FormReader,  Selector}
}
