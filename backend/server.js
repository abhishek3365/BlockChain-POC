/****************************************************************************************
 *   This module is the starter module.         
 ****************************************************************************************/

const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');

const logger = require('./error-handling-logger/Logger');
const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));

var routes = require('./routes/app.router');

var port = process.env.PORT | 3000;
var app = express();

logger.setConfig(config["logger-settings"]);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

routes(app);

app.listen( port , () => {
  console.log(`Server is up and running at port ` + port);
});