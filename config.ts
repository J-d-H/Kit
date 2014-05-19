import fs      = require('fs');
import path    = require('path');
import log     = require('./log');

var options: {
	version?: number;
	projectsDirectory: string;
	mp3encoder: string;
	aacencoder: string;
	hideUnavailable?: boolean;
	git?: string;
	servers?: {
		name: string;
		type: string;
		path?: string;
		url?: string;
		user?: string;
		pass?: string;
	}[];
} = {
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
		/*
		{
			"name": "ktx-gitblit"
			"type": "gitblit",
			"url": "git.ktxsoftware.com",
			"user": "",
			"pass": ""
		}
		*/
	]
};

var _serverData = { };

var optionsPath = '';
var optionsFile = '';

function load() {
	try {
		options = JSON.parse(fs.readFileSync(optionsFile, {encoding: 'utf8'}));
		if (options.hideUnavailable === undefined) options.hideUnavailable = false;
		if (options.git === undefined) options.git = 'git';
		for (var s in options.servers) {
			var server = options.servers[s];
			if (server.name === undefined) server.name = 'ktx-github';
		}
	}
	catch (e) {
		var localStorage = window.localStorage;
		options.projectsDirectory = localStorage.getItem('projectsDirectory');
		options.mp3encoder = localStorage.getItem('mp3encoder');
		options.aacencoder = localStorage.getItem('aacencoder');
	}
	for (var s in options.servers) {
		var server = options.servers[s];
		try {
			_serverData[server.name] = JSON.parse(fs.readFileSync(optionsPath + server.name + '.json', {encoding: 'utf8'}));
		}
		catch (e) {
			_serverData[server.name] = { etag: null, repositories: [] };
		}
	}
}

export function save() {
	fs.writeFile(optionsFile, JSON.stringify(options, null, '\t'), { encoding: 'utf8' }, function (err) {
		if (err) {
			log.error('Error saving options: ' + err);
		}
	});
}

export function init(dataPath: string) {
	optionsPath = dataPath + path.sep;
	optionsFile = optionsPath + 'options.json';
	load();
}

export function projectsDirectory() {
	return options.projectsDirectory;
}

export function mp3Encoder() {
	return options.mp3encoder;
}

export function aacEncoder() {
	return options.aacencoder;
}

export function servers() {
	return options.servers;
}

export function serverData(serverName) {
	return _serverData[serverName];
}

export function hideUnavailable() {
	return options.hideUnavailable;
}

export function git() {
	return options.git;
}

export function setProjectsDirectory(dir) {
	options.projectsDirectory = dir;
	save();
}

export function setMP3Encoder(text) {
	options.mp3encoder = text;
	save();
}

export function setAACEncoder(text) {
	options.aacencoder = text;
	save();
}

export function setHideUnavailable(hide) {
	options.hideUnavailable = hide;
	save();
}

export function setGit(git) {
	options.git = git;
	save();
}

export function saveServerData(serverName) {
	fs.writeFile(optionsPath + serverName + '.json', JSON.stringify(_serverData[serverName], null, '\t'), {encoding: 'utf8'}, function (err) {
		// TODO: log error?
	});
}