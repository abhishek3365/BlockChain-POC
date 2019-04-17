var appServices = require('../business-layer/app.services');

var playerController = require('./player.controller')( appServices.playerServices );
var votingController = require('./voting.controller')( appServices.votingServices );

var app_controller = { playerController , votingController };

module.exports = app_controller;