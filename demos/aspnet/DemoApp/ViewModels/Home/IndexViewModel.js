/// <reference path="../../../../../source/Griffin.Yo.ts"/> 
var DemoApp;
(function (DemoApp) {
    var Home;
    (function (Home) {
        var IndexViewModel = (function () {
            function IndexViewModel() {
            }
            IndexViewModel.prototype.getTitle = function () {
                return 'Home page';
            };
            IndexViewModel.prototype.activate = function (context) {
                context.render({ Name: 'Hello index' });
                context.resolve();
            };
            IndexViewModel.prototype.deactivate = function () {
            };
            return IndexViewModel;
        })();
        Home.IndexViewModel = IndexViewModel;
    })(Home = DemoApp.Home || (DemoApp.Home = {}));
})(DemoApp || (DemoApp = {}));
//# sourceMappingURL=IndexViewModel.js.map