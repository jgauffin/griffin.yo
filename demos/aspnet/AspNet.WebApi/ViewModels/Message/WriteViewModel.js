var DemoApp;
(function (DemoApp) {
    var Message;
    (function (Message) {
        var Yo = Griffin.Yo;
        var WriteViewModel = (function () {
            function WriteViewModel() {
            }
            WriteViewModel.prototype.getTitle = function () { return "Message app"; };
            WriteViewModel.prototype.activate = function (context) {
                var _this = this;
                this.context = context;
                context.handle.click('[name="Save"]', function (e) {
                    _this.saveNote();
                });
                context.resolve();
            };
            WriteViewModel.prototype.deactivate = function () { };
            WriteViewModel.prototype.saveNote = function () {
                console.log('here');
                return;
                var data = this.context.readForm('WriteForm');
                Yo.Http.post('/api/message', data, function (xhr) {
                    document.location.hash = '#/';
                });
            };
            return WriteViewModel;
        })();
        Message.WriteViewModel = WriteViewModel;
    })(Message = DemoApp.Message || (DemoApp.Message = {}));
})(DemoApp || (DemoApp = {}));
//# sourceMappingURL=WriteViewModel.js.map