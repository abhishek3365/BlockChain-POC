module.exports =  ( playerServices )  => {
    
    var PlayerController= {};
    var logger = require('../error-handling-logger/Logger');
    const shortid = require('shortid');

    PlayerController.getAllPlayers = (req, res) => {
        let txnID = shortid.generate();
        var requestBody = req.body;
        logger.logMessage("Request Received from : GET/players" + "|" + requestBody, logger.LOG_LEVEL.verbose, 'REQUEST', txnID);
        playerServices.getAllPlayers( requestBody ).then((result) => {
            var responseJson = {
                success : true,
                payload : result
            }
            res.status(200).send(responseJson);
            logger.logMessage("Response Sent for : GET/players" + " |" + JSON.stringify(responseJson), logger.LOG_LEVEL.verbose, 'RESPONSE', txnID);
        } , (err) => {
            var responseJson = {
                success : false,
                payload : {},
                error : {
                    error_message : err
                }
            }
            res.status(404).send(responseJson);
            logger.logMessage("Response Sent for : GET/GetPlayerCount" + " |" + JSON.stringify(responseJson), logger.LOG_LEVEL.verbose, 'RESPONSE', txnID);
        } ); 
    };

    PlayerController.getPlayerCount = (req, res) => {
        let txnID = shortid.generate();
        var requestBody = req.body;
        logger.logMessage("Request Received from : GET/PlayerCount" + "|" + requestBody, logger.LOG_LEVEL.verbose, 'REQUEST', txnID);
        playerServices.getPlayerCount( requestBody ).then((result) => {
            var responseJson = {
                success : true,
                payload : result
            }
            res.status(200).send(responseJson);
            logger.logMessage("Response Sent for : GET/PlayerCount" + " |" + JSON.stringify(responseJson), logger.LOG_LEVEL.verbose, 'RESPONSE', txnID);
        } , (err) => {
            var responseJson = {
                success : false,
                payload : {},
                error : {
                    error_message : err
                }
            }
            res.status(404).send(responseJson);
            logger.logMessage("Response Sent for : GET/PlayerCount" + " |" + JSON.stringify(responseJson), logger.LOG_LEVEL.verbose, 'RESPONSE', txnID);
        } ); 
    };

    return PlayerController;

}