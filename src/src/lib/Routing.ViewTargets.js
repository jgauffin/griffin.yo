var Griffin;
(function (Griffin) {
    var Yo;
    (function (Yo) {
        var Routing;
        (function (Routing) {
            var ViewTargets;
            (function (ViewTargets) {
                //#endregion "Interfaces"
                /**
                 * Render view into a parent element
                 */
                var BootstrapModalViewTarget = (function () {
                    function BootstrapModalViewTarget() {
                        /**
                         * Name is 'BootstrapModal'
                         */
                        this.name = "BootstrapModal";
                    }
                    /**
                     *
                     * @param options {buttons: [{title: 'Ok', callback:function(viewElement)}]
                     * @returns {}
                     */
                    BootstrapModalViewTarget.prototype.assignOptions = function (options) {
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
                    };
                    BootstrapModalViewTarget.prototype.attachViewModel = function (script) {
                        this.currentNode = new BootstrapModalViewTargetRequest(this.name);
                        this.currentNode.attachViewModel(script);
                    };
                    BootstrapModalViewTarget.prototype.setTitle = function (title) {
                        this.currentNode.setTitle(title);
                    };
                    /**
                     * Will remove innerHTML and append the specified element as the first child.
                     * @param element generated view
                     */
                    BootstrapModalViewTarget.prototype.render = function (element) {
                        this.currentNode.render(element);
                        //and release
                        this.currentNode = null;
                    };
                    return BootstrapModalViewTarget;
                })();
                ViewTargets.BootstrapModalViewTarget = BootstrapModalViewTarget;
                /** Load view in a Boostrap modal
             */
                var BootstrapModalViewTargetRequest = (function () {
                    function BootstrapModalViewTargetRequest(name) {
                        this.name = name;
                        this.node = document.createElement('div');
                        this.node.setAttribute('id', this.name);
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
                    BootstrapModalViewTargetRequest.prototype.prepare = function (options) {
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
                                }
                                else {
                                    button.setAttribute('class', 'btn btn-default');
                                }
                                button.setAttribute('data-dismiss', 'modal');
                                button.innerText = item.title;
                                button.addEventListener('click', function (e) {
                                    item.callback(body.firstElementChild);
                                });
                                footer.appendChild(button);
                            });
                        }
                    };
                    BootstrapModalViewTargetRequest.prototype.attachViewModel = function (script) {
                        this.node.querySelector('.modal-body').appendChild(script);
                    };
                    BootstrapModalViewTargetRequest.prototype.setTitle = function (title) {
                        this.node.querySelector('.modal-title').innerText = title;
                    };
                    /**
                     * Will remove innerHTML and append the specified element as the first child.
                     * @param element generated view
                     */
                    BootstrapModalViewTargetRequest.prototype.render = function (element) {
                        var _this = this;
                        this.node.querySelector('.modal-body').appendChild(element);
                        var footer = this.node.querySelector('.modal-footer');
                        this.modal = $(this.node).modal();
                        $(this.modal).on('hidden.bs.modal', function () {
                            _this.modal.modal('hide').data('bs.modal', null);
                            _this.node.parentElement.removeChild(_this.node);
                        });
                        var buttons = element.querySelectorAll('button,input[type="submit"],input[type="button"]');
                        if (buttons.length > 0) {
                            while (footer.firstChild) {
                                footer.removeChild(footer.firstChild);
                            }
                            for (var i = 0; i < buttons.length; i++) {
                                var button = buttons[i];
                                button.className += ' btn';
                                button.addEventListener('click', function (target, button, e) {
                                    target.modal.modal('hide');
                                    if ((button.tagName === "input" && button["type"] !== "submit") || button.hasAttribute("data-dismiss")) {
                                        window.history.go(-1);
                                    }
                                }.bind(this, button));
                                footer.appendChild(buttons[i]);
                            }
                            if (buttons.length === 1) {
                                buttons[0].className += ' btn-primary';
                            }
                            else {
                                buttons[0].className += ' btn-primary';
                                buttons[buttons.length - 1].className += ' btn-cancel';
                            }
                        }
                        this.modal.modal('show');
                    };
                    return BootstrapModalViewTargetRequest;
                })();
                ViewTargets.BootstrapModalViewTargetRequest = BootstrapModalViewTargetRequest;
                /**
             * Render view into a parent element
             */
                var ElementViewTarget = (function () {
                    /**
                     *
                     * @param elementOrId Element to render view in
                     * @returns {}
                     */
                    function ElementViewTarget(elementOrId) {
                        /**
                         * Id attribute of the container element.
                         */
                        this.name = "";
                        if (typeof elementOrId === "string") {
                            this.container = document.getElementById(elementOrId.substr(1));
                            if (!this.container) {
                                throw "Could not locate \"" + elementOrId + "\"";
                            }
                        }
                        else {
                            this.container = elementOrId;
                        }
                        this.name = this.container.id;
                    }
                    ElementViewTarget.prototype.assignOptions = function () {
                    };
                    ElementViewTarget.prototype.attachViewModel = function (script) {
                        this.container.appendChild(script);
                    };
                    ElementViewTarget.prototype.setTitle = function (title) {
                    };
                    /**
                     * Will remove innerHTML and append the specified element as the first child.
                     * @param element generated view
                     */
                    ElementViewTarget.prototype.render = function (element) {
                        //delete everything but our view model script.
                        while (this.container.firstElementChild && this.container.firstElementChild.nextElementSibling != null)
                            this.container.removeChild(this.container.firstElementChild);
                        this.container.innerHTML = "";
                        this.container.appendChild(element);
                    };
                    return ElementViewTarget;
                })();
                ViewTargets.ElementViewTarget = ElementViewTarget;
            })(ViewTargets = Routing.ViewTargets || (Routing.ViewTargets = {}));
        })(Routing = Yo.Routing || (Yo.Routing = {}));
    })(Yo = Griffin.Yo || (Griffin.Yo = {}));
})(Griffin || (Griffin = {}));
//# sourceMappingURL=Routing.ViewTargets.js.map