var logPage = require("./pages/log");

exports.lines = [];

var button;

function init(logButton) {
    button = logButton;
}
exports.init = init;

function info(text) {
    exports.lines.push({ level: 0, text: text });
    logPage.update();
}
exports.info = info;
;

function error(text) {
    button.className = 'alert';
    exports.lines.push({ level: 1, text: text });
    logPage.update();
}
exports.error = error;
;
//# sourceMappingURL=Kit/../log.js.map
