var express = require('express');
var app = express();

var http = require('http');
var httpServer = http.Server(app);

app.get('/',function(req,res) {
    res.send('<h1>Hello World</h1>');
});

httpServer.listen(3000,function() {
    console.log('Listening on *:3000');
});
