var Griffin;
(function (Griffin) {
    var Yo;
    (function (Yo) {
        var Dom;
        (function (Dom) {
            var ElemUtils = (function () {
                function ElemUtils() {
                }
                ElemUtils.removeChildren = function (n) {
                    if (!n) {
                        throw new Error("Element not set: " + n);
                    }
                    while (n.firstChild) {
                        n.removeChild(n.firstChild);
                    }
                };
                ElemUtils.moveChildren = function (source, target) {
                    while (source.firstChild) {
                        target.appendChild(source.firstChild);
                    }
                    if (source.parentElement) {
                        source.parentElement.removeChild(source);
                    }
                    else {
                        source.remove();
                    }
                };
                ElemUtils.getIdentifier = function (e) {
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
                };
                return ElemUtils;
            })();
            Dom.ElemUtils = ElemUtils;
            var EventMapper = (function () {
                function EventMapper(scope) {
                    if (typeof scope === "undefined") {
                        this.scope = document;
                    }
                    else {
                        this.scope = scope;
                    }
                }
                EventMapper.prototype.click = function (selector, listener, useCapture) {
                    var items = this.scope.querySelectorAll(selector);
                    if (items.length === 0)
                        throw new Error("Failed to bind \"click\" to selector \"" + selector + "\", no elements found.");
                    for (var i = 0; i < items.length; i++) {
                        items[i].addEventListener("click", listener, useCapture);
                    }
                };
                EventMapper.prototype.change = function (selector, listener, useCapture) {
                    var items = this.scope.querySelectorAll(selector);
                    if (items.length === 0)
                        throw new Error("Failed to bind \"change\" to selector \"" + selector + "\", no elements found.");
                    for (var i = 0; i < items.length; i++) {
                        items[i].addEventListener("change", listener, useCapture);
                    }
                };
                EventMapper.prototype.keyUp = function (selector, listener, useCapture) {
                    var items = this.scope.querySelectorAll(selector);
                    if (items.length === 0)
                        throw new Error("Failed to bind \"keyup\" to selector \"" + selector + "\", no elements found.");
                    for (var i = 0; i < items.length; i++) {
                        items[i].addEventListener("keyup", listener, useCapture);
                    }
                };
                EventMapper.prototype.keyDown = function (selector, listener, useCapture) {
                    var items = this.scope.querySelectorAll(selector);
                    if (items.length === 0)
                        throw new Error("Failed to bind \"keydown\" to selector \"" + selector + "\", no elements found.");
                    for (var i = 0; i < items.length; i++) {
                        items[i].addEventListener("keydown", listener, useCapture);
                    }
                };
                return EventMapper;
            })();
            Dom.EventMapper = EventMapper;
            var FormReader = (function () {
                function FormReader(elemOrName) {
                    this.stack = [];
                    if (typeof elemOrName === "string") {
                        this.container = document.querySelector('#' + elemOrName + ",[data-name=\"" + elemOrName + "\"]");
                        if (!this.container) {
                            throw new Error("Failed to locate '" + elemOrName + "'.");
                        }
                    }
                    else {
                        this.container = elemOrName;
                    }
                }
                FormReader.prototype.read = function () {
                    var motherObject = {};
                    for (var i = 0; i < this.container.childElementCount; i++) {
                        var element = this.container.children[i];
                        var name = this.getName(element);
                        //no name, maybe got nested data
                        if (!name) {
                            var data = this.pullElement(element);
                            if (data) {
                                this.appendObject(motherObject, data);
                            }
                            continue;
                        }
                        var childValue;
                        if (this.isCollection(element)) {
                            childValue = this.pullCollection(element);
                        }
                        else {
                            childValue = this.pullElement(element);
                            childValue = this.adjustCheckboxes(element, motherObject, childValue);
                        }
                        this.assignByName(name, motherObject, childValue);
                    }
                    return motherObject;
                };
                FormReader.prototype.pullCollection = function (container) {
                    var arr = [];
                    var currentArrayItem = {};
                    var addedItems = [];
                    var currentIndexer = null;
                    for (var i = 0; i < container.childElementCount; i++) {
                        var elem = container.children[i];
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
                        }
                        else {
                            value = this.pullElement(elem);
                            if (value === null) {
                                continue;
                            }
                        }
                        //only want a single value array
                        if (name === '[]') {
                            arr.push(value);
                        }
                        else {
                            this.assignByName(name, currentArrayItem, value);
                        }
                    }
                    if (!this.isObjectEmpty(currentArrayItem)) {
                        arr.push(currentArrayItem);
                    }
                    return arr;
                };
                FormReader.prototype.pullElement = function (container) {
                    if (container.childElementCount === 0) {
                        if (container.tagName == 'SELECT') {
                            var select = container;
                            if (select.selectedIndex == -1) {
                                return null;
                            }
                            var value1 = select.options[select.selectedIndex];
                            return this.processValue(value1);
                        }
                        else if (container.tagName == 'INPUT') {
                            var input = container;
                            var typeStr = container.getAttribute('type');
                            if (typeStr === 'radio' || typeStr === 'checkbox') {
                                if (input.checked) {
                                    return this.processValue(input.value);
                                }
                                return null;
                            }
                            return this.processValue(input.value);
                        }
                        else {
                            var value3 = container.getAttribute('value') || '';
                            return this.processValue(value3);
                        }
                    }
                    var data = {};
                    for (var i = 0; i < container.childElementCount; i++) {
                        var element = container.children[i];
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
                        }
                        else {
                            value = this.pullElement(element);
                            value = this.adjustCheckboxes(element, data, value);
                            if (value === null) {
                                continue;
                            }
                        }
                        this.assignByName(name, data, value);
                    }
                    return this.isObjectEmpty(data) ? null : data;
                };
                FormReader.prototype.adjustCheckboxes = function (element, dto, value) {
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
                };
                FormReader.prototype.processValue = function (value) {
                    if (!isNaN(value)) {
                        return parseInt(value, 10);
                    }
                    else if (value == 'true') {
                        return true;
                    }
                    else if (value == 'false') {
                        return false;
                    }
                    return value;
                };
                FormReader.prototype.assignByName = function (name, parentObject, value) {
                    var parts = name.split('.');
                    var obj = parentObject;
                    var parent = parentObject;
                    var lastKey = '';
                    parts.forEach(function (key) {
                        lastKey = key;
                        if (!obj.hasOwnProperty(key)) {
                            obj[key] = {};
                        }
                        parent = obj;
                        obj = obj[key];
                    });
                    parent[lastKey] = value;
                };
                FormReader.prototype.appendObject = function (target, extras) {
                    for (var key in extras) {
                        if (!target.hasOwnProperty(key)) {
                            target[key] = extras[key];
                        }
                    }
                };
                FormReader.prototype.isObjectEmpty = function (data) {
                    for (var name in data) {
                        if (data.hasOwnProperty(name)) {
                            return false;
                        }
                    }
                    return true;
                };
                FormReader.prototype.getName = function (el) {
                    return el.getAttribute('name') || el.getAttribute('data-name') || el.getAttribute('data-collection');
                };
                FormReader.prototype.isCollection = function (el) {
                    return el.hasAttribute('data-collection');
                };
                return FormReader;
            })();
            Dom.FormReader = FormReader;
            var Selector = (function () {
                function Selector(scope) {
                    if (typeof scope === "undefined") {
                        this.scope = document;
                    }
                    else {
                        this.scope = scope;
                    }
                    if (!this.scope)
                        throw new Error("Failed to identify scope");
                }
                Selector.prototype.one = function (idOrselector) {
                    if (idOrselector.substr(0, 1) === "#") {
                        var el2 = this.scope.querySelector(idOrselector);
                        if (!el2) {
                            throw new Error("Failed to find element '" + idOrselector + "'.");
                        }
                        return el2;
                    }
                    if (idOrselector.match(/[\s\.\,\[]+/g) === null) {
                        var result = this.scope.querySelector("[data-name='" + idOrselector + "'],[data-collection='" + idOrselector + "'],[name=\"" + idOrselector + "\"],#" + idOrselector);
                        if (result)
                            return result;
                    }
                    var item = this.scope.querySelector(idOrselector);
                    if (!item)
                        throw Error("Failed to find \"" + idOrselector + "\".");
                    return item;
                };
                Selector.prototype.all = function (selector) {
                    var result = [];
                    var items = selector.match("[\s\.,\[]+").length === 0
                        ? this.scope.querySelectorAll("[data-name=\"" + selector + "\"],[data-collection='" + selector + "'],[name=\"" + selector + "\"],#" + selector)
                        : this.scope.querySelectorAll(selector);
                    for (var i = 0; i < items.length; i++) {
                        result.push(items[i]);
                    }
                    return result;
                };
                return Selector;
            })();
            Dom.Selector = Selector;
        })(Dom = Yo.Dom || (Yo.Dom = {}));
    })(Yo = Griffin.Yo || (Griffin.Yo = {}));
})(Griffin || (Griffin = {}));
//# sourceMappingURL=Dom.js.map