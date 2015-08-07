declare var $;

/**
 * Render view into a parent element
 */
export class BootstrapModalViewTarget implements IViewTarget {

	private currentNode: BootstrapModalViewTargetRequest;

	/**
	 * Name is 'BootstrapModal'
	 */
	public name = "BootstrapModal";

	/**
	 * 
	 * @param options {buttons: [{title: 'Ok', callback:function(viewElement)}]
	 * @returns {} 
	 */
	assignOptions(options: any) {
		
		//var body = this.node.querySelector('.modal-body');
		//while (body.firstChild)
		//    body.removeChild(body.firstChild);

		//var footer = this.node.querySelector('.modal-footer');
		//while (footer.firstChild)
		//    footer.removeChild(footer.firstChild);

		//if (options && options.buttons) {
		//    options.buttons.forEach(function (item) {
		//        var button = document.createElement('button');
		//        if (item.className) {
		//            button.setAttribute('class', 'btn ' + item.className);
		//        } else {
		//            button.setAttribute('class', 'btn btn-default');
		//        }

		//        button.setAttribute('data-dismiss', 'modal');
		//        button.innerText = item.title;
		//        button.addEventListener('click', e => {
		//            item.callback(body.firstElementChild);
		//        });
		//        footer.appendChild(button);
		//    });
		//}

	}

	attachViewModel(script: HTMLScriptElement) {
		this.currentNode = new BootstrapModalViewTargetRequest();
		this.currentNode.attachViewModel(script);
	}

	setTitle(title: string) {
		this.currentNode.setTitle(title);
	}
	/**
	 * Will remove innerHTML and append the specified element as the first child.
	 * @param element generated view
	 */
	public render(element: HTMLElement) {
		this.currentNode.render(element);

		//and release
		this.currentNode = null;
	}
}