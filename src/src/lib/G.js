/// <reference path="Dom.ts"/>
/// <reference path="Views.ts"/>
var Griffin;
(function (Griffin) {
    var Yo;
    (function (Yo) {
        /**
         * Global mappings
         */
        var G = (function () {
            function G() {
            }
            G.render = function (idOrElem, dto, directives) {
                var r = new Yo.Views.ViewRenderer(idOrElem);
                r.render(dto, directives);
            };
            G.select = new Yo.Dom.Selector();
            G.handle = new Yo.Dom.EventMapper();
            return G;
        })();
        Yo.G = G;
    })(Yo = Griffin.Yo || (Griffin.Yo = {}));
})(Griffin || (Griffin = {}));
//# sourceMappingURL=G.js.map