import logPage = require("./pages/log");

export var lines: { level: number; text: string; }[] = [];

var button : HTMLButtonElement;

export function init(logButton: HTMLButtonElement) {
	button = logButton;
}

export function info(text: string) {
	lines.push({ level: 0, text: text });
	logPage.update();
};

export function error(text: string) {
	button.className = 'alert';
	lines.push({ level: 1, text: text });
	logPage.update();
};
