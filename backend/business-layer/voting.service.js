module.exports =  ()  => {

    var VotingServices= {};

    const fs = require('fs');
    var Fabric_Client = require('fabric-client');
    var path = require('path');
    var util = require('util');

    const ledger_settings = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'))["ledger_settings"];

    VotingServices.getVoteCount = () => {
        return new Promise( (resolve,reject) => {

            var fabric_client = new Fabric_Client();

            var channel = fabric_client.newChannel(ledger_settings.channel_name);
            var peer = fabric_client.newPeer(ledger_settings.peer_address);
            channel.addPeer(peer);

            var member_user = null;
            var store_path = path.join(__dirname, '../keystore');
            console.log('Store path:'+store_path);
            var tx_id = null;

            Fabric_Client.newDefaultKeyValueStore({ path: store_path
            }).then((state_store) => {
                // assign the store to the fabric client
                fabric_client.setStateStore(state_store);
                var crypto_suite = Fabric_Client.newCryptoSuite();
                // use the same location for the state store (where the users' certificate are kept)
                // and the crypto store (where the users' keys are kept)
                var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
                crypto_suite.setCryptoKeyStore(crypto_store);
                fabric_client.setCryptoSuite(crypto_suite);
            
                // get the enrolled user from persistence, this user will sign all requests
                return fabric_client.getUserContext('user1', true);
            }).then((user_from_store) => {
                if (user_from_store && user_from_store.isEnrolled()) {
                    console.log('Successfully loaded user1 from persistence');
                    member_user = user_from_store;
                } else {
                    throw new Error('Failed to get user1.... run registerUser.js');
                }
            
                const request = {
                    chaincodeId: 'voting',
                    fcn: 'getScore',
                    args: []
                };
            
                // send the query proposal to the peer
                return channel.queryByChaincode(request);
            }).then((query_responses) => {
                console.log("Query has completed, checking results");
                // query_responses could have more than one  results if there multiple peers were used as targets
                if (query_responses && query_responses.length == 1) {
                    if (query_responses[0] instanceof Error) {
                        reject("error from query = ", query_responses[0]);
                    } else {
                        var response = JSON.parse(query_responses[0].toString());
                        var result = [];
                        var teams = Object.keys( response );
                        teams.forEach(team => {
                            result.push( { name : team , score : response[team] } )
                        });
                        resolve(result);
                    }
                } else {
                    reject("No payloads were returned from query");
                }
            }).catch((err) => {
                reject('Failed to query successfully :: ' + err);
            });

        }  );
    }

    VotingServices.castVote = ( requestBody ) => {
        
        return new Promise( (resolve,reject) => 
        {

            var fabric_client = new Fabric_Client();

            var channel = fabric_client.newChannel(ledger_settings.channel_name);
            var peer = fabric_client.newPeer(ledger_settings.peer_address);
            channel.addPeer(peer);
            var order = fabric_client.newOrderer('grpc://localhost:7050')
            channel.addOrderer(order);

            var member_user = null;
            var store_path = path.join(__dirname, '../keystore');
            console.log('Store path:'+store_path);
            var tx_id = null;

            Fabric_Client.newDefaultKeyValueStore({ path: store_path
            }).then((state_store) => {
                // assign the store to the fabric client
                fabric_client.setStateStore(state_store);
                var crypto_suite = Fabric_Client.newCryptoSuite();
                // use the same location for the state store (where the users' certificate are kept)
                // and the crypto store (where the users' keys are kept)
                var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
                crypto_suite.setCryptoKeyStore(crypto_store);
                fabric_client.setCryptoSuite(crypto_suite);
            
                // get the enrolled user from persistence, this user will sign all requests
                return fabric_client.getUserContext('user1', true);
            }).then((user_from_store) => {
                if (user_from_store && user_from_store.isEnrolled()) {
                    console.log('Successfully loaded user1 from persistence');
                    member_user = user_from_store;
                } else {
                    throw new Error('Failed to get user1.... run registerUser.js');
                }
            
                tx_id = fabric_client.newTransactionID();
	            console.log("Assigning transaction_id: ", tx_id._transaction_id);

                const request = {
                    chaincodeId: 'voting',
                    fcn: 'castVote',
                    args: [requestBody.team],
                    chainId: 'mychannel',
                    txId: tx_id
                };
            
                // send the query proposal to the peer
                return channel.sendTransactionProposal(request);
            }).then((results) => {
                var proposalResponses = results[0];
                var proposal = results[1];
                let isProposalGood = false;
                if (proposalResponses && proposalResponses[0].response &&
                    proposalResponses[0].response.status === 200) {
                        isProposalGood = true;
                        console.log('Transaction proposal was good');
                    } else {
                        console.error('Transaction proposal was bad');
                    }
                if (isProposalGood) {
                    console.log(util.format(
                        'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
                        proposalResponses[0].response.status, proposalResponses[0].response.message));
            
                    // build up the request for the orderer to have the transaction committed
                    var request = {
                        proposalResponses: proposalResponses,
                        proposal: proposal
                    };
            
                    // set the transaction listener and set a timeout of 30 sec
                    // if the transaction did not get committed within the timeout period,
                    // report a TIMEOUT status
                    var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
                    var promises = [];
            
                    var sendPromise = channel.sendTransaction(request);
                    promises.push(sendPromise); //we want the send transaction first, so that we know where to check status
            
                    // get an eventhub once the fabric client has a user assigned. The user
                    // is required bacause the event registration must be signed
                    let event_hub = channel.newChannelEventHub(peer);
            
                    // using resolve the promise so that result status may be processed
                    // under the then clause rather than having the catch clause process
                    // the status
                    let txPromise = new Promise((resolve, reject) => {
                        let handle = setTimeout(() => {
                            event_hub.unregisterTxEvent(transaction_id_string);
                            event_hub.disconnect();
                            resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
                        }, 3000);
                        event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                            // this is the callback for transaction event status
                            // first some clean up of event listener
                            clearTimeout(handle);
            
                            // now let the application know what happened
                            var return_status = {event_status : code, tx_id : transaction_id_string};
                            if (code !== 'VALID') {
                                console.error('The transaction was invalid, code = ' + code);
                                resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
                            } else {
                                console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
                                resolve(return_status);
                            }
                        }, (err) => {
                            //this is the callback if something goes wrong with the event registration or processing
                            reject(new Error('There was a problem with the eventhub ::'+err));
                        },
                            {disconnect: true} //disconnect when complete
                        );
                        event_hub.connect();
            
                    });
                    promises.push(txPromise);
            
                    return Promise.all(promises);
                } else {
                    console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                    reject('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                }
            }).then((results) => {
                console.log('Send transaction promise and event listener promise have completed');
                // check the results in the order the promises were added to the promise all list
                if (results && results[0] && results[0].status === 'SUCCESS') {
                    console.log('Successfully sent transaction to the orderer.');
                } else {
                    reject('Failed to order the transaction. Error code: ' + results[0].status);
                }
            
                if(results && results[1] && results[1].event_status === 'VALID') {
                    resolve('Successfully committed the change to the ledger by the peer');
                } else {
                    reject('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
                }
            }).catch((err) => {
                reject('Failed to invoke successfully :: ' + err);
            });
        })
    
    }

    return VotingServices;

}