var playerServices = require('./player.services')();
var votingServices = require('./voting.service')();

var app_services = { playerServices , votingServices };

module.exports = app_services;