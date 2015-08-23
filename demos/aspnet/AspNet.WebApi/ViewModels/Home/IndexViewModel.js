var DemoApp;
(function (DemoApp) {
    var Home;
    (function (Home) {
        var Yo = Griffin.Yo;
        var IndexViewModel = (function () {
            function IndexViewModel() {
                var self = this;
                this.directive = {
                    Notes: {
                        Body: {
                            html: function (value) {
                                return self.nl2br(value);
                            }
                        }
                    }
                };
            }
            IndexViewModel.prototype.getTitle = function () { return "Message app"; };
            IndexViewModel.prototype.activate = function (context) {
                var _this = this;
                Yo.Http.get('/api/messages', function (xhr) {
                    console.log('rendering');
                    context.render({ Notes: xhr['responseJson'] }, _this.directive);
                    context.resolve();
                }, 'application/json');
            };
            IndexViewModel.prototype.nl2br = function (str) {
                return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');
            };
            IndexViewModel.prototype.deactivate = function () { };
            return IndexViewModel;
        })();
        Home.IndexViewModel = IndexViewModel;
    })(Home = DemoApp.Home || (DemoApp.Home = {}));
})(DemoApp || (DemoApp = {}));
//# sourceMappingURL=IndexViewModel.js.map