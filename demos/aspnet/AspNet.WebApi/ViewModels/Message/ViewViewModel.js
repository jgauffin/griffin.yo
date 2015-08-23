var DemoApp;
(function (DemoApp) {
    var Message;
    (function (Message) {
        var Yo = Griffin.Yo;
        var ViewViewModel = (function () {
            function ViewViewModel() {
            }
            ViewViewModel.prototype.getTitle = function () { return "Write message"; };
            ViewViewModel.prototype.activate = function (context) {
                Yo.Http.get('/api/messages', function (result) {
                    context.render(result);
                    context.resolve();
                }, 'application/json');
            };
            ViewViewModel.prototype.deactivate = function () { };
            return ViewViewModel;
        })();
        Message.ViewViewModel = ViewViewModel;
    })(Message = DemoApp.Message || (DemoApp.Message = {}));
})(DemoApp || (DemoApp = {}));
//# sourceMappingURL=ViewViewModel.js.map