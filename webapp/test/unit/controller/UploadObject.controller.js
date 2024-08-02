/*global QUnit*/

sap.ui.define([
	"pgdc0020_1/controller/UploadObject.controller"
], function (Controller) {
	"use strict";

	QUnit.module("UploadObject Controller");

	QUnit.test("I should test the UploadObject controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
