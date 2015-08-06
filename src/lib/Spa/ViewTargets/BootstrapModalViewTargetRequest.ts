export class BootstrapModalViewTargetRequest {
	private node: HTMLElement;
	private modal: any;

	constructor() {
			this.node = document.createElement('div');
			this.node.setAttribute('id', 'BootstrapModal');
			this.node.setAttribute('class', 'modal fade view-target');
			this.node.setAttribute('role', 'dialog');
			document.body.appendChild(this.node);


			var contents = '\r\n' +
				'  <div class="modal-dialog">\r\n' +
				'\r\n' +
				'    <div class="modal-content">\r\n' +
				'      <div class="modal-header">\r\n' +
				'        <button type="button" class="close" data-dismiss="modal">&times;</button>\r\n' +
				'        <h4 class="modal-title"></h4>\r\n' +
				'      </div>\r\n' +
				'      <div class="modal-body">\r\n' +
				'        \r\n' +
				'      </div>\r\n' +
				'      <div class="modal-footer">\r\n' +
				'        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\r\n' +
				'      </div>\r\n' +
				'    </div>\r\n' +
				'\r\n' +
				'  </div>\r\n' +
				'';
			this.node.innerHTML = contents;

	}

	/**
	 * 
	 * @param options {buttons: [{title: 'Ok', callback:function(viewElement)}]
	 * @returns {} 
	 */
	prepare(options: any) {
		var body = this.node.querySelector('.modal-body');
		while (body.firstChild)
			body.removeChild(body.firstChild);

		var footer = this.node.querySelector('.modal-footer');
		while (footer.firstChild)
			footer.removeChild(footer.firstChild);

		if (options && options.buttons) {
			options.buttons.forEach(function (item) {
				var button = document.createElement('button');
				if (item.className) {
					button.setAttribute('class', 'btn ' + item.className);
				} else {
					button.setAttribute('class', 'btn btn-default');
				}

				button.setAttribute('data-dismiss', 'modal');
				button.innerText = item.title;
				button.addEventListener('click', e => {
					item.callback(body.firstElementChild);
				});
				footer.appendChild(button);
			});
		}

	}

	attachViewModel(script: HTMLScriptElement) {
		this.node.querySelector('.modal-body').appendChild(script);
	}

	setTitle(title: string) {
		(<HTMLElement>this.node.querySelector('.modal-title')).innerText = title;
	}
	/**
	 * Will remove innerHTML and append the specified element as the first child.
	 * @param element generated view
	 */
	public render(element: HTMLElement) {
		this.node.querySelector('.modal-body').appendChild(element);
		var footer = this.node.querySelector('.modal-footer');

		this.modal = $(this.node).modal();
		$(this.modal).on('hidden.bs.modal', () => {
			this.modal.modal('hide').data('bs.modal', null);
			this.node.parentElement.removeChild(this.node);
		});

		var buttons = element.querySelectorAll('button');
		if (buttons.length > 0) {
			while (footer.firstChild) {
				footer.removeChild(footer.firstChild);
			}
			for (var i = 0; i < buttons.length; i++) {
				(<HTMLElement>buttons[i]).className += ' btn';
				(<HTMLElement>buttons[i]).addEventListener('click', e => {
					this.modal.modal('hide');
				});
				footer.appendChild(buttons[i]);
			}
			if (buttons.length === 1) {
				(<HTMLElement>buttons[0]).className += ' btn-primary';
			} else {
				(<HTMLElement>buttons[0]).className += ' btn-primary';
				(<HTMLElement>buttons[buttons.length - 1]).className += ' btn-cancel';
			}
		}


		this.modal.modal('show');
	}
}