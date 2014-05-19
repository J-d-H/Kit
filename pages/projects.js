"use strict";
var git = require("../git");
var fs = require("fs");

var https = require("https");
var log = require("../log");
var page = require("../page");
var config = require("../config");
var projectPage = require("./project");

var document = window.document;

function remove(array, at) {
    var rest = array.slice(at + 1);
    array.length = at < 0 ? array.length + at : at;
    return array.push.apply(array, rest);
}

function Button(text) {
    this.element = document.createElement("button");
    this.element.appendChild(document.createTextNode(text));
}

function contains(array, value) {
    for (var v in array) {
        if (array[v] === value)
            return true;
    }
    return false;
}

function isProject(name) {
    return fs.existsSync(config.projectsDirectory() + "/" + name + "/Kore") || fs.existsSync(config.projectsDirectory() + "/" + name + "/Kt") || fs.existsSync(config.projectsDirectory() + "/" + name + "/Kha");
}

var projects = {};

function findProjectDirs(projects) {
    var dirs = [];
    try  {
        dirs = fs.readdirSync(config.projectsDirectory());
    } catch (e) {
    }
    for (var p in projects) {
        var project = projects[p];
        if (project === null || project.name.endsWith("/") || project.name.startsWith("Archive/")) {
            delete projects[p];
            continue;
        }
    }
    for (var dir in dirs) {
        if (projects[dirs[dir]] !== undefined) {
            projects[dirs[dir]].available = true;
        } else if (isProject(dirs[dir])) {
            projects[dirs[dir]] = { name: dirs[dir], project: dirs[dir], available: true };
        } else {
            var dirs2 = [];
            try  {
                dirs2 = fs.readdirSync(config.projectsDirectory() + '/' + dirs[dir]);
                for (var d in dirs2) {
                    var dir2 = dirs2[d];
                    var name = dirs[dir] + '/' + dir2;
                    if (projects[name] !== undefined) {
                        projects[name].available = true;
                    } else if (isProject(name)) {
                        projects[name] = { name: name, project: name, available: true };
                    }
                }
            } catch (e) {
            }
        }
    }
}

var repoarray = [];
var table;

function clear(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}

function redraw() {
    clear(table);
    repoarray.forEach(function (project) {
        if (!project.available && config.hideUnavailable())
            return;

        var tr = document.createElement("tr");

        var td = document.createElement("td");
        td.appendChild(document.createTextNode(project.name));
        tr.appendChild(td);

        td = document.createElement("td");
        var button = null;
        if (project.available) {
            button = new Button("Update");
        } else {
            button = new Button("Download");
        }

        td.appendChild(button.element);
        tr.appendChild(td);

        td = document.createElement("td");
        var openButton = new Button("Open");

        openButton.element.onclick = function () {
            projectPage.load(project.name);
        };

        button.element.onclick = function () {
            document.getElementById("kitt").style.visibility = "visible";
            kittanimated = true;
            animate();
            git.update(project, projects, config.projectsDirectory() + "/", function () {
                document.getElementById("kitt").style.visibility = "hidden";
                kittanimated = false;
                button.element.removeChild(button.element.lastChild);
                button.element.appendChild(document.createTextNode("Update"));
                openButton.element.disabled = false;
            });
        };

        if (!project.available)
            openButton.element.disabled = true;
        td.appendChild(openButton.element);
        tr.appendChild(td);

        table.appendChild(tr);
    });
}
exports.redraw = redraw;

function addProjects() {
    repoarray = [];
    for (var p in projects) {
        repoarray.push(projects[p]);
    }
    repoarray.sort(function (a, b) {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    });

    exports.redraw();
}

var serverCount;

function finishServer() {
    --serverCount;
    if (serverCount === 0) {
        log.info("Downloaded list of projects.");
        findProjectDirs(projects);
        addProjects();
    }
}

function pushServer(array, project) {
    for (var v in array) {
        var value = array[v];
        if (value.server.name === project.server.name)
            return;
    }
    array.push(project);
}

function addProject(project, serverPrio, projects) {
    var name = project.name;
    if (projects[name] === undefined) {
        projects[name] = project;
    } else if (projects[name].prio < serverPrio) {
        for (var o in projects[name].others) {
            pushServer(project.others, projects[name].others[o]);
        }
        projects[name].others = [];
        pushServer(project.others, projects[name]);
        projects[name] = project;
    } else {
        pushServer(projects[name].others, project);
    }
}

function getServerInfo(res, server, serverPrio, serverData, page) {
    if (res.headers.link !== undefined) {
        //<https://api.github.com/resource?page=2>; rel="next",
        var links = res.headers.link.split(/,/);
        for (var l in links) {
            var link = links[l];
            var components = link.split(/;/);
            if (components[1].trim() === 'rel="next"') {
                var url = components[0].substr(1, components[0].length - 2).substr(8);
                var cut = url.indexOf('/');
                var options = {
                    host: url.substr(0, cut),
                    path: url.substr(cut),
                    headers: { 'User-Agent': 'Kit' }
                };
                ++serverCount;
                https.get(options, function (res) {
                    getServerInfo(res, server, serverPrio, serverData, page + 1);
                }).on("error", function (e) {
                    log.error(server.name + ": Could not load additional projects data.");
                    finishServer();
                });
                ;
                break;
            }
        }
    }

    res.setEncoding("utf8");
    var data = "";
    res.on("data", function (chunk) {
        data += chunk;
    });
    res.on("end", function () {
        if (server.type === 'github') {
            var repositories;
            if (res.statusCode == 304) {
                repositories = serverData.repositories;
            } else if (res.statusCode != 200) {
                try  {
                    var result = JSON.parse(data);
                    log.error(server.name + ": " + result.message + " (" + result.documentation_url + ")");
                } catch (e) {
                    log.error(server.name + ": Unknown error.");
                }
                finishServer();
                return;
            } else {
                result = JSON.parse(data);
                if (page == 0) {
                    repositories = [];
                    serverData.etag = res.headers.etag;
                    serverData.repositories = repositories;
                } else {
                    repositories = serverData.repositories;
                }
                for (var r in result) {
                    repositories.push(result[r].name.trim());
                }
                config.saveServerData(server.name);
            }
            for (var r in repositories) {
                var name = repositories[r].trim();
                var project = { name: name, server: server, prio: serverPrio, baseurl: 'https://github.com/' + server.path.split(/\//)[1] + '/', others: [] };
                addProject(project, serverPrio, projects);
            }
            finishServer();
        } else if (server.type === 'gitblit') {
            var repositories = JSON.parse(data);
            for (var r in repositories) {
                var repo = repositories[r];
                var name = repo.name.substr(0, repo.name.length - 4).trim();
                var project = { name: name, server: server, prio: serverPrio, baseurl: 'https://' + server.url + '/r/', others: [] };
                addProject(project, serverPrio, projects);
            }
            finishServer();
        }
    });
}

function loadRepositories() {
    projects = {};
    serverCount = config.servers().length;

    var serverNum = 0;
    for (var s in config.servers()) {
        var server = config.servers()[s];
        var serverData = config.serverData(server.name);
        var serverPrio = serverNum;
        ++serverNum;

        var options = {};
        if (server.type === 'github') {
            options = {
                host: 'api.github.com',
                path: '/' + server.path + '/repos',
                headers: { 'User-Agent': 'Kit' }
            };
            if (serverData.etag) {
                options.headers['If-None-Match'] = serverData.etag;
            }
        } else if (server.type === 'gitblit') {
            options = {
                rejectUnauthorized: false,
                host: server.url,
                path: '/rpc?req=LIST_REPOSITORIES',
                headers: {
                    'User-Agent': 'Kit',
                    'Authorization': 'Basic ' + new Buffer(server.user + ':' + server.pass).toString('base64')
                }
            };
        }

        https.get(options, function (res) {
            getServerInfo(res, server, serverPrio, serverData, 0);
        }).on("error", function (e) {
            log.info(server.name + ": Could not download list of projects for Server.");
            finishServer();
        });
    }
}

function load() {
    page.clear();
    table = document.createElement("table");
    var content = document.getElementById("content");
    content.appendChild(table);

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var input = document.createElement("input");
    td.appendChild(input);
    tr.appendChild(td);
    td = document.createElement("td");
    var button = document.createElement("button");
    button.appendChild(document.createTextNode("Create project"));
    td.appendChild(button);
    tr.appendChild(td);

    //table.appendChild(tr);
    button.onclick = function () {
        fs.mkdirSync(config.projectsDirectory() + "/" + input.value);

        fs.writeFileSync(config.projectsDirectory() + "/" + input.value + "/.gitignore", "/build\n/kake.lua\n");

        fs.writeFileSync(config.projectsDirectory() + "/" + input.value + "/project.kha", JSON.stringify({ format: 1, game: { name: input.value, width: 640, height: 480 }, assets: [], rooms: [] }, null, "\t"));

        fs.mkdirSync(config.projectsDirectory() + "/" + input.value + "/Sources");

        fs.writeFileSync(config.projectsDirectory() + "/" + input.value + "/Sources/Main.hx", "package;\n\n" + "import kha.Starter;\n\n" + "class Main {\n" + "\tpublic static function main() {\n" + "\t\tnew Starter().start(new " + input.value + "());\n" + "\t}\n" + "}");

        fs.writeFileSync(config.projectsDirectory() + "/" + input.value + "/Sources/" + input.value + ".hx", "package;\n\n" + "import kha.Game;\n\n" + "class " + input.value + " extends Game {\n" + "\tpublic function new() {\n" + "\t\tsuper(\"" + input.value + "\", false);" + "\t}" + "}");

        fs.writeFileSync(config.projectsDirectory() + "/" + input.value + "/.gitmodules", '[submodule "Kha"]\n\tpath = Kha\n\turl = ../Kha\n\tbranch = master');
    };

    loadRepositories();
}
exports.load = load;
;

var kittcount = 0;
var kittanimated = false;

function animate() {
    var kitt = document.getElementById("kitt");

    ++kittcount;
    var kittx = (Math.sin(kittcount / 100) + 1) / 2 * (window.innerWidth - 100);

    if (kitt !== null) {
        kitt.style.top = window.innerHeight - 20 + 'px';
        kitt.style.left = kittx + 'px';
    }
    if (kittanimated)
        window.requestAnimationFrame(animate);
}
//# sourceMappingURL=Kit/../pages/projects.js.map
