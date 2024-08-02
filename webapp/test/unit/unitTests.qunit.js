/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"pgdc0020_1/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
