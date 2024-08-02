sap.ui.define('pgdc0020_1/controller/BaseController',
[
    "sap/ui/core/mvc/Controller",
    "sap/ui/generic/app/navigation/service/NavigationHandler",
    "pgdc0020_1/sheetjs/jszip",
    "pgdc0020_1/sheetjs/xlsx.full.min"
], 
function(C, N) {
    "use strict";
    return C.extend("pgdc0020_1.controller.BaseController", {
        onInit: function() {
            if (!this.oNavigationHandler) {
                this.oNavigationHandler = new N(this);
            }
            this.oRouter = this.getRouter();
        },
        getRouter: function() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        getModel: function(n) {
            return this.getView().getModel(n);
        },
        setModel: function(m, n) {
            return this.getView().setModel(m, n);
        },
        getResourceBundle: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        _retrieveAppState: function() {
            var a = this.oNavigationHandler.parseNavigation();
            a.fail(function(e) {});
            return a;
        }
    });
});