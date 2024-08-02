sap.ui.define( ["pgdc0020_1/controller/BaseController", "sap/ui/model/json/JSONModel"], function(B, J) {
    "use strict";
    return B.extend("pgdc0020_1.controller.TaskLog", {
        onInit: function() {
            this._initModel();
            this.getRouter().getRoute("TaskLog").attachPatternMatched(this._onObjectMatched, this);
        },

        _initModel (){

        },

        _onObjectMatched(){

        }


    });
  });