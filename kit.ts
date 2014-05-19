///<reference path='node.d.ts' />

declare function require(name: string);

import config = require("./config");
import git = require("./git");
import log = require("./log");
import page = require("./page");
import projectsPage = require("./pages/projects");
import configPage = require("./pages/config");
import logPage = require("./pages/log");

window.onload = function() {
	var gui = require('nw.gui');
	document.getElementById('reloadButton').onclick = function () {
		gui.Window.get().reload(3);
	};
	document.getElementById('devButton').onclick = function () {
		gui.Window.get().showDevTools();
	};

	var logButton = <HTMLButtonElement>document.getElementById('logButton');
	log.init(logButton);
	logPage.init(logButton);

	config.init(gui.App.dataPath);
	if (config.projectsDirectory() === null) configPage.load();
	else projectsPage.load();
	document.getElementById("projectsButton").onclick = projectsPage.load;
	document.getElementById("configButton").onclick = configPage.load;
	logButton.onclick = logPage.load;
	var hidespan = <HTMLSpanElement>document.getElementById('hideunavailable');
	var hidebox = <HTMLInputElement>document.getElementById('hideunavailablebox');
	if (config.hideUnavailable()) hidebox.click();
	hidespan.onclick = function () {
		hidebox.click();
	};
	hidebox.onclick = function () {
		config.setHideUnavailable(hidebox.checked);
		projectsPage.redraw();
	};
	git.init(<HTMLDivElement>document.getElementById('kittinfo'), process, gui.App.dataPath);
}
