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
		var pre = document.createElement("pre");
		pre.style.margin = "0";
		pre.style.padding = "0";
		pre.appendChild(document.createTextNode(log.lines[row].text));
		table.appendChild(createRow1(pre));
	}
	lastIndex = log.lines.length;
};

export function load() {
	button.className = '';
	page.clear();
	table = document.createElement("table");

	lastIndex = 0;
	update();

	var content = document.getElementById("content");
	content.appendChild(table);
};