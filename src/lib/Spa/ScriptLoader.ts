export class ScriptLoader {
	private pendingScripts: HTMLScriptElement[] = [];
	private embeddedScripts: HTMLScriptElement[] = [];
	private container: HTMLElement;
	static dummyScriptNode: any;


	constructor(container: HTMLElement = document.head) {
		this.container = container;
		if (!ScriptLoader.dummyScriptNode)
			ScriptLoader.dummyScriptNode = document.createElement("script");
	}
	private stateChange() {
		if (this.pendingScripts.length === 0) {
			if (console && console.log)
				console.log("Got ready state for a non existent script: ", this);
			return;
		}

		var firstScript = <any>this.pendingScripts[0];
		while (firstScript && firstScript.readyState === 'loaded') {
			firstScript.onreadystatechange = null;
			this.container.appendChild(firstScript);

			this.pendingScripts.shift();
			firstScript = <any>this.pendingScripts[0];
		}
		if (this.pendingScripts.length === 0) {
			this.runEmbeddedScripts();
		}
	}

	public loadSources(scripts: string|string[]) {
		if (scripts instanceof Array) {
			for (var i = 0; i < scripts.length; i++) {
				this.loadSource(scripts[i]);
			}
		} else {
			this.loadSource(<string>scripts);
		}
	}

	public loadTags(scripts: HTMLScriptElement|HTMLScriptElement[]) {
		if (scripts instanceof Array) {
			for (var i = 0; i < scripts.length; i++) {
				this.loadElement(scripts[i]);
			}
		} else {
			this.loadElement(<HTMLScriptElement>scripts);
		}

		if (this.pendingScripts.length === 0) {
			this.runEmbeddedScripts();
		}
	}



	private loadSource(source: string) {
		if ('async' in ScriptLoader.dummyScriptNode) { // modern browsers
			let script = document.createElement('script');
			script.async = false;
			this.pendingScripts.push(script);
			script.addEventListener('load', e => this.onScriptLoaded(script));
			script.src = source;
			this.container.appendChild(script);
		}
		else if (ScriptLoader.dummyScriptNode.readyState) { // IE<10
			let script = <any>document.createElement('script');
			this.pendingScripts.push(script);
			script.onreadystatechange = this.stateChange;
			script.src = source;
		}
		else { // fall back to defer
			let script = document.createElement('script');
			script.defer = true;
			this.pendingScripts.push(script);
			script.addEventListener('load', e => this.onScriptLoaded(script));
			script.src = source;
			this.container.appendChild(script);
			//document.write('<script src="' + source + '" defer></' + 'script>');
		}
	}

	private loadElement(tag: HTMLScriptElement) {
		if (tag.src) {
			this.loadSource(tag.src);
			return;
		}

		let script = document.createElement('script');
		script.text = tag.text;
		this.embeddedScripts.push(script);
	}

	onScriptLoaded(script: HTMLScriptElement) {
		this.pendingScripts.pop();
		if (this.pendingScripts.length === 0) {
			this.runEmbeddedScripts();
		}

	}

	runEmbeddedScripts() {
		for (var i = 0; i < this.embeddedScripts.length; i++) {
			this.container.appendChild(this.embeddedScripts[i]);
		}
		while (this.embeddedScripts.length>0) {
			this.embeddedScripts.pop();
		}
	}
}