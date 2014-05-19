var fs = require('fs');
var path = require('path');
var log = require('./log');

var options = {
    version: 1,
    projectsDirectory: '',
    mp3encoder: '',
    aacencoder: '',
    hideUnavailable: false,
    git: 'git',
    servers: [
        {
            name: 'ktx-github',
            type: 'github',
            path: 'orgs/ktxsoftware'
        }
    ]
};

var _serverData = {};

var optionsPath = '';
var optionsFile = '';

function load() {
    try  {
        options = JSON.parse(fs.readFileSync(optionsFile, { encoding: 'utf8' }));
        if (options.hideUnavailable === undefined)
            options.hideUnavailable = false;
        if (options.git === undefined)
            options.git = 'git';
        for (var s in options.servers) {
            var server = options.servers[s];
            if (server.name === undefined)
                server.name = 'ktx-github';
        }
    } catch (e) {
        var localStorage = window.localStorage;
        options.projectsDirectory = localStorage.getItem('projectsDirectory');
        options.mp3encoder = localStorage.getItem('mp3encoder');
        options.aacencoder = localStorage.getItem('aacencoder');
    }
    for (var s in options.servers) {
        var server = options.servers[s];
        try  {
            _serverData[server.name] = JSON.parse(fs.readFileSync(optionsPath + server.name + '.json', { encoding: 'utf8' }));
        } catch (e) {
            _serverData[server.name] = { etag: null, repositories: [] };
        }
    }
}

function save() {
    fs.writeFile(optionsFile, JSON.stringify(options, null, '\t'), { encoding: 'utf8' }, function (err) {
        if (err) {
            log.error('Error saving options: ' + err);
        }
    });
}
exports.save = save;

function init(dataPath) {
    optionsPath = dataPath + path.sep;
    optionsFile = optionsPath + 'options.json';
    load();
}
exports.init = init;

function projectsDirectory() {
    return options.projectsDirectory;
}
exports.projectsDirectory = projectsDirectory;

function mp3Encoder() {
    return options.mp3encoder;
}
exports.mp3Encoder = mp3Encoder;

function aacEncoder() {
    return options.aacencoder;
}
exports.aacEncoder = aacEncoder;

function servers() {
    return options.servers;
}
exports.servers = servers;

function serverData(serverName) {
    return _serverData[serverName];
}
exports.serverData = serverData;

function hideUnavailable() {
    return options.hideUnavailable;
}
exports.hideUnavailable = hideUnavailable;

function git() {
    return options.git;
}
exports.git = git;

function setProjectsDirectory(dir) {
    options.projectsDirectory = dir;
    exports.save();
}
exports.setProjectsDirectory = setProjectsDirectory;

function setMP3Encoder(text) {
    options.mp3encoder = text;
    exports.save();
}
exports.setMP3Encoder = setMP3Encoder;

function setAACEncoder(text) {
    options.aacencoder = text;
    exports.save();
}
exports.setAACEncoder = setAACEncoder;

function setHideUnavailable(hide) {
    options.hideUnavailable = hide;
    exports.save();
}
exports.setHideUnavailable = setHideUnavailable;

function setGit(git) {
    options.git = git;
    exports.save();
}
exports.setGit = setGit;

function saveServerData(serverName) {
    fs.writeFile(optionsPath + serverName + '.json', JSON.stringify(_serverData[serverName], null, '\t'), { encoding: 'utf8' }, function (err) {
        // TODO: log error?
    });
}
exports.saveServerData = saveServerData;
//# sourceMappingURL=Kit/../config.js.map
