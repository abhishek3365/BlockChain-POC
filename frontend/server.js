const express = require('express');
const http = require('http');
const path = require('path');
const PORT = process.env.PORT || 4200;

const app = express();

app.use(express.static(path.join( __dirname , '/dist/Test-App'  )));

app.get( '/*' , (req,res) => {
    res.sendfile( path.join( __dirname + "/dist/Test-App/index.html" ) )
} );

app.set( 'port' , PORT );

const server = http.createServer(app);
server.listen( PORT , () => {
    console.log(`Server running at ${PORT}`);
} )