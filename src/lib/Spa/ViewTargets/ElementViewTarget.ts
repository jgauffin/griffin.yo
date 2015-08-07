/**
 * Render view into a parent element
 */
export class ElementViewTarget implements IViewTarget {
	private container: HTMLElement;

	/**
	 * 
	 * @param elementOrId Element to render view in
	 * @returns {} 
	 */
	constructor(elementOrId: string|HTMLElement) {
		if (typeof elementOrId === "string") {
			this.container = document.getElementById(elementOrId.substr(1));
			if (!this.container) {
				throw `Could not locate "${elementOrId}"`;
			}
		} else {
			this.container = elementOrId;
		}

		this.name = this.container.id;
	}

	/**
	 * Id attribute of the container element.
	 */
	public name = "";

	assignOptions() {
		
	}

	attachViewModel(script: HTMLScriptElement) {
		this.container.appendChild(script);
	}

	setTitle(title: string) {
		
	}
	/**
	 * Will remove innerHTML and append the specified element as the first child.
	 * @param element generated view
	 */
	public render(element: HTMLElement) {
		//delete everything but our view model script.
		while (this.container.firstElementChild && this.container.firstElementChild.nextElementSibling != null)
			this.container.removeChild(this.container.firstElementChild);

		this.container.innerHTML = "";
		this.container.appendChild(element);
	}
}