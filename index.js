var express = require('express');
var app = express();

var http = require('http');
var httpServer = http.Server(app);

var socketIO = require('socket.io');
var io = socketIO(httpServer);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});

httpServer.listen(3000, function() {
    console.log('Listening on *:3000');
});
