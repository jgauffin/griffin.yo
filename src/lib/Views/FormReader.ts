export class FormReader {
	private container: HTMLElement;
	private stack: string[] = [];
	constructor(elemOrName: HTMLElement|string) {
		if (typeof elemOrName === "string") {
			this.container = <HTMLElement>document.querySelector('#' + elemOrName + ",[data-name=\"" + elemOrName + "\"]");
			if (!this.container) {
				throw new Error("Failed to locate '" + elemOrName + "'.");
			}
		} else {
			this.container = elemOrName;
		}
	}

	public pull(): any {
		var motherObject = {};
		for (let i = 0; i < this.container.childElementCount; i++) {
			var item = <HTMLElement>this.container.children[i];
			var name = this.getName(item);

			//no name, maybe got nested data
			if (!name) {
				var data = this.pullElement(item);
				if (data) {
					return data;
				}
				continue;
			}

			var childValue;
			if (this.isCollection(item)) {
				childValue = this.pullCollection(item);
			} else {
				childValue = this.pullElement(item);
			}
			this.assignByName(name, motherObject, childValue);
		}

		return motherObject;
	}

	private pullCollection(container: HTMLElement): any {
		var arr = [];
		var currentArrayItem = {};
		var addedItems = [];
		var currentIndexer = null;
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
	private pullElement(container: HTMLElement): any {
		if (container.childElementCount === 0) {
			if (container.tagName == 'SELECT') {
				var select = <HTMLSelectElement>container;
				if (select.selectedIndex == -1) {
					return null;
				}
				let value1 = select.options[select.selectedIndex];
				return this.processValue(value1);
			} else if (container.tagName == 'INPUT') {
				var input = <HTMLInputElement>container;
				var typeStr = container.getAttribute('type');
				if (typeStr === 'radio' || typeStr ==='checkbox') {
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
			var item = <HTMLElement>container.children[i];
			var name = this.getName(item);
			if (!name) {
				var value = this.pullElement(item);
				if (!this.isObjectEmpty(value)) {
					this.appendObject(data, value);
				}
				continue;
			}
			var value;

			if (this.isCollection(item)) {
				value = this.pullCollection(item);
			} else {
				value = this.pullElement(item);
				if (value === null) {
					continue;
				}
			}
			this.assignByName(name, data, value);
		}

		return this.isObjectEmpty(data) ? null : data;
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
