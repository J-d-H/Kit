import fs   = require("fs");
import config = require("../config");
import page = require("../page");
import projectPage = require("../projectPages/project");
import assetsPage  = require("../projectPages/assets");
import roomsPage   = require("../projectPages/rooms");

var document = window.document;

function clear(element: HTMLElement) {
	while (element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

export function load(repository) {
	if (fs.existsSync(config.projectsDirectory() + "/" + repository + "/project.kha")) {
		var kha = JSON.parse(fs.readFileSync(config.projectsDirectory() + "/" + repository + "/project.kha", {encoding: "utf8"}));
		kha.save = function() {
			var string = JSON.stringify(kha, null, "\t");
			fs.writeFileSync(config.projectsDirectory() + "/" + repository + "/project.kha", string, {encoding: "utf8"});
		};
	}

	page.clear();
	var content = document.getElementById("content");

	var table = document.createElement("table");
	var tr = document.createElement("tr");
	var td = document.createElement("td");

	var projectButton = document.createElement("button");
	projectButton.appendChild(document.createTextNode(repository));
	td.appendChild(projectButton);
	var assetsButton = document.createElement("button");
	assetsButton.appendChild(document.createTextNode("Assets"));
	td.appendChild(assetsButton);
	var roomsButton = document.createElement("button");
	roomsButton.appendChild(document.createTextNode("Rooms"));
	td.appendChild(roomsButton);
	tr.appendChild(td);
	table.appendChild(tr);

	tr = document.createElement("tr");
	td = document.createElement("td");
	
	projectButton.onclick = function() {
		clear(td);
		projectPage.load(repository, kha, td);
	};
	assetsButton.onclick = function() {
		clear(td);
		assetsPage.load(repository, kha, td);
	};
	roomsButton.onclick = function() {
		clear(td);
		roomsPage.load(repository, kha, td);
	};

	projectPage.load(repository, kha, td);

	tr.appendChild(td);
	table.appendChild(tr);

	content.appendChild(table);
}
