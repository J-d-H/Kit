///<reference path='node.d.ts' />

var config = require("./config");
var git = require("./git");
var log = require("./log");

var projectsPage = require("./pages/projects");
var configPage = require("./pages/config");
var logPage = require("./pages/log");

window.onload = function () {
    var logButton = document.getElementById('logButton');
    log.init(logButton);
    logPage.init(logButton);
    logButton.onclick = logPage.load;

    window.addEventListener("error", function (ev) {
        log.error(ev.error.stack);
    });
    process.addListener('uncaughtException', function (error) {
        log.error("Uncaught Exception: " + error);
    });

    var gui = require('nw.gui');
    document.getElementById('reloadButton').onclick = function () {
        gui.Window.get().reload(3);
    };
    document.getElementById('devButton').onclick = function () {
        gui.Window.get().showDevTools();
    };

    config.init(gui.App.dataPath);
    if (config.projectsDirectory() === null)
        configPage.load();
    else
        projectsPage.load();
    document.getElementById("projectsButton").onclick = projectsPage.load;
    document.getElementById("configButton").onclick = configPage.load;
    var hidespan = document.getElementById('hideunavailable');
    var hidebox = document.getElementById('hideunavailablebox');
    if (config.hideUnavailable())
        hidebox.click();
    hidespan.onclick = function () {
        hidebox.click();
    };
    hidebox.onclick = function () {
        config.setHideUnavailable(hidebox.checked);
        projectsPage.redraw();
    };
    git.init(document.getElementById('kittinfo'), process, gui.App.dataPath);
};
//# sourceMappingURL=Kit/../kit.js.map
