/// <reference path="Dom.ts"/>
var Griffin;
(function (Griffin) {
    var Yo;
    (function (Yo) {
        var Spa;
        (function (Spa) {
            var ViewModels;
            (function (ViewModels) {
                var ClassFactory = (function () {
                    function ClassFactory() {
                    }
                    //credits: http://stackoverflow.com/a/2441972/70386
                    ClassFactory.getConstructor = function (appName, viewModelModuleAndName) {
                        var nameParts = viewModelModuleAndName.split(".");
                        var fn = (window[appName] || this[appName]);
                        if (typeof fn === "undefined") {
                            throw new Error("Failed to load application namespace \"" + appName + "\". Have a view model been loaded successfully?");
                        }
                        for (var i = 0, len = nameParts.length; i < len; i++) {
                            if (fn.hasOwnProperty(nameParts[i])) {
                                fn = fn[nameParts[i]];
                                continue;
                            }
                            var name_1 = nameParts[i].toLowerCase();
                            var foundName = void 0;
                            for (var propertyName in fn) {
                                if (!fn.hasOwnProperty(propertyName)) {
                                    continue;
                                }
                                if (propertyName.toLowerCase() === name_1) {
                                    foundName = propertyName;
                                }
                            }
                            if (typeof foundName === "undefined")
                                throw new Error("Could not find \"" + nameParts[i] + "\" from viewModel name, complete name: \"" + appName + "." + viewModelModuleAndName + "\".");
                            fn = fn[foundName];
                        }
                        if (typeof fn !== "function") {
                            throw new Error("Could not find view model " + viewModelModuleAndName);
                        }
                        return fn;
                    };
                    return ClassFactory;
                })();
                ViewModels.ClassFactory = ClassFactory;
            })(ViewModels = Spa.ViewModels || (Spa.ViewModels = {}));
        })(Spa = Yo.Spa || (Yo.Spa = {}));
    })(Yo = Griffin.Yo || (Griffin.Yo = {}));
})(Griffin || (Griffin = {}));
//# sourceMappingURL=Spa.ViewModels.js.map