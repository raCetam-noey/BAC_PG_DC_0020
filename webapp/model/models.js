sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Provides runtime info for the device the UI5 app is running on as JSONModel
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createStatusModel: function () {
            var model = new JSONModel({
                WF01 : false,
                WF02 : false,
                WF03 : false,
                WF04 : false
            });
            return model;
        }
    };

});