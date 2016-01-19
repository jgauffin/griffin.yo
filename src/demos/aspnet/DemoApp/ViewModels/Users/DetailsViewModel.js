/// <reference path="../../Griffin.Yo.ts"/> 
var DemoApp;
(function (DemoApp) {
    var Users;
    (function (Users) {
        var Yo = Griffin.Yo;
        var DetailsViewModel = (function () {
            function DetailsViewModel() {
            }
            DetailsViewModel.prototype.getTitle = function () {
                return 'User details';
            };
            DetailsViewModel.prototype.activate = function (context) {
                Yo.Http.get('/user/' + context.routeData['id'], function (xhr) {
                    context.render(xhr['responseJson']);
                    context.resolve();
                });
            };
            DetailsViewModel.prototype.deactivate = function () {
            };
            return DetailsViewModel;
        })();
        Users.DetailsViewModel = DetailsViewModel;
    })(Users = DemoApp.Users || (DemoApp.Users = {}));
})(DemoApp || (DemoApp = {}));
//# sourceMappingURL=DetailsViewModel.js.map