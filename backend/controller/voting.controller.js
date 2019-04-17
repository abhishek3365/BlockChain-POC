module.exports =  ( votingServices )  => {
    
    var VotingController= {};
    var logger = require('../error-handling-logger/Logger');
    const shortid = require('shortid');

    VotingController.getVoteCount = (req, res) => {
        let txnID = shortid.generate();
        var requestBody = req.body;
        logger.logMessage("Request Received from : GET/getVoteCount" + "|" + requestBody, logger.LOG_LEVEL.verbose, 'REQUEST', txnID);
        votingServices.getVoteCount( requestBody ).then((result) => {
            var responseJson = {
                success : true,
                payload : result
            }
            res.status(200).send(responseJson);
            logger.logMessage("Response Sent for : GET/getVoteCount" + " |" + JSON.stringify(responseJson), logger.LOG_LEVEL.verbose, 'RESPONSE', txnID);
        } , (err) => {
            var responseJson = {
                success : false,
                payload : {},
                error : {
                    error_message : err
                }
            }
            res.status(404).send(responseJson);
            logger.logMessage("Response Sent for : GET/getVoteCount" + " |" + JSON.stringify(responseJson), logger.LOG_LEVEL.verbose, 'RESPONSE', txnID);
        } ); 
    };

    VotingController.castVote = (req, res) => {
        let txnID = shortid.generate();
        var requestBody = req.body;
        logger.logMessage("Request Received from : GET/getVoteCount" + "|" + requestBody, logger.LOG_LEVEL.verbose, 'REQUEST', txnID);
        votingServices.castVote( requestBody ).then((result) => {
            var responseJson = {
                success : true,
                payload : result
            }
            res.status(200).send(responseJson);
            logger.logMessage("Response Sent for : GET/getVoteCount" + " |" + JSON.stringify(responseJson), logger.LOG_LEVEL.verbose, 'RESPONSE', txnID);
        } , (err) => {
            var responseJson = {
                success : false,
                payload : {},
                error : {
                    error_message : err
                }
            }
            res.status(404).send(responseJson);
            logger.logMessage("Response Sent for : GET/getVoteCount" + " |" + JSON.stringify(responseJson), logger.LOG_LEVEL.verbose, 'RESPONSE', txnID);
        } ); 
    };

    return VotingController

}
