import page = require("../page");
import log = require("../log");

var document = window.document;
var table = null;
var lastIndex = 0;
var button;

function createRow1(element) {
	var tr = document.createElement("tr");
	var td = document.createElement("td");
	td.appendChild(element);
	tr.appendChild(td);
	return tr;
}

export function init(logButton) {
	button = logButton;
};

export function update() {
	if (table === null) return;
	for (var row = lastIndex; row < log.lines.length; ++row) {
		table.appendChild(createRow1(document.createTextNode(log.lines[row].text)));
	}
	lastIndex = log.lines.length;
};

export function load() {
	button.className = '';
	page.clear();
	table = document.createElement("table");

	for (var row in log.lines) {
		table.appendChild(createRow1(document.createTextNode(log.lines[row].text)));
	}
	lastIndex = log.lines.length;

	var content = document.getElementById("content");
	content.appendChild(table);
};
