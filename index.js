var express = require('express');
var app = express();

var http = require('http');
var httpServer = http.Server(app);

var socketIO = require('socket.io');
var io = socketIO(httpServer);

var freeUsers = [];
idmap = {};

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	// console.log('New user joined' + socket.id);
	if(freeUsers.length) {
		var st1 = freeUsers.shift();
		idmap[socket.id] = st1;
		idmap[st1] = socket.id;
		console.log('Conncected' + socket.id + '  to  ' + st1);
	}
	else {
		freeUsers.push(socket.id);
	}
	socket.on('disconnect', function() {
		var st2 = idmap[socket.id];
		if(st2) {
			delete idmap[socket.id];
			delete idmap[st2];
			if(freeUsers.length) {
				var st3 = freeUsers.shift();
				idmap[st2] = st3;
				idmap[st3] = st2;
			}
			else freeUsers.push(st2);
		}
	});
  socket.on('chat message', function(msg){
     console.log('message: ' + msg);
   if(idmap[socket.id]) io.to(idmap[socket.id]).emit('chat message', msg);
   console.log(idmap);
  });
});

httpServer.listen(3000, function() {
    console.log('Listening on *:3000');
});
