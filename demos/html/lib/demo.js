if (window.demoLog == null) {
	window.demoLog = function (result) {
		if (typeof result === "object") {
			result = toHtml(result);
		}

		var el = document.getElementById('output');
		if (el != null) {
			el.innerHTML = result;
		} else {
			console.log(result);
		}
	};
}

var sourceHtml = '';
document.addEventListener("DOMContentLoaded", function (e2333) {
	var viewElement = document.getElementById('MyView');
	sourceHtml = escapeHtml(getHTML(viewElement));

	var extras = document.createElement("div");
	extras.innerHTML = '<div id="DemoButtons">\
        <button id="RunCodeButton">Run code</button>\
        <button id="ShowSource">Show source</button>\
    </div>\
\
    <div id="SourceCode">\
        <h3>View source</h3>\
        <pre><code></code></pre>\
        <h3>Javascript source</h3>\
        <pre><code></code></pre>\
    </div>\
\
    <div id="output">\
        <h3>Output</h3>\
        <div></div>\
    </div>';

	var view = document.getElementById('MyView');
	insertAfter(extras, view);

	if (document.body.className == 'view-demo') {
		showSource();
		document.getElementById('ShowSource').style.display = 'none';
	}

	document.getElementById('RunCodeButton').addEventListener('click', function (e) {
		e.preventDefault();
		invokeDemo();
	});
	document.getElementById('ShowSource').addEventListener('click', function (e) {
		e.preventDefault();
		showSource();
	});

});

function showSource() {
	document.getElementById("SourceCode").style.display = 'inherit';
	var sourceCodeElements = document.querySelectorAll('#SourceCode pre code');

	var viewElement = document.getElementById('MyView');
	var html = escapeHtml(getHTML(viewElement));
	sourceCodeElements[0].innerHTML = sourceHtml;

	var codeElement = document.getElementById('example-script');
	var js = codeElement.innerHTML;
	sourceCodeElements[1].innerHTML = js;
}
function insertAfter(newNode, referenceNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}


function escapeHtml(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function getHTML(node){
    if(!node || !node.tagName) return '';
    if(node.outerHTML) return node.outerHTML;

    // polyfill:
    var wrapper = document.createElement('div');
    wrapper.appendChild(node.cloneNode(true));
    return wrapper.innerHTML;
}


function toHtml(result) {
	var node = document.createElement("div");
	var json = JSON.stringify(result, null, 4);

	if (typeof syntaxHighlight !== "undefined") {
		json = syntaxHighlight(json);
	}
	return "<pre>" + json + "</pre>";
}
