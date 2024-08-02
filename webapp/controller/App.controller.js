sap.ui.define('pgdc0020_1/controller/App.controller', ["pgdc0020_1/controller/BaseController", "sap/ui/model/json/JSONModel"], function(B, J) {
  "use strict";
  return B.extend("pgdc0020_1.controller.App", {
      onInit: function() {
          var v, s, o = this.getView().getBusyIndicatorDelay();
          v = new J({
              busy: true,
              delay: 0
          });
          this.setModel(v, "appView");
          s = function() {
              v.setProperty("/busy", false);
              v.setProperty("/delay", o);
          }
          ;
          this.getOwnerComponent().getModel().setSizeLimit(999999);
          this.getOwnerComponent().getModel().metadataLoaded().then(s);
          this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
      }
  });
});