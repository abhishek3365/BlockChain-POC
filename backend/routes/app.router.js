module.exports = (app) => {

    var appController = require('../controller/app.controller');

    app.route('/players')
        .post(appController.playerController.getAllPlayers)

    app.route('/playercount')
        .get(appController.playerController.getPlayerCount)

    app.route('/voteCount')
        .get(appController.votingController.getVoteCount)

    app.route('/castVote')
        .post(appController.votingController.castVote)

}