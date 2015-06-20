var express = require('express');
var app = express();
var path = require("path")
//Express does not deliever anything beyond route
// So need to set it up to use the public directory for static content
app.use(express.static(path.join(__dirname, 'public')));

var http = require('http');
var httpServer = http.Server(app);

var socketIO = require('socket.io');
var io = socketIO(httpServer);

var freeUsers = [];
idmap = {};

var welcomeMessage = "You are chatting with a random stranger, Say Hi!\n";
var disconnectMessage = "Stranger has left. Please Reload this page or wait for us to connect you with someone.\n";

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
	// console.log('New user joined' + socket.id);
	if(freeUsers.length) {
		var st1 = freeUsers.shift();
		idmap[socket.id] = st1;
		idmap[st1] = socket.id;
		console.log('Conncected' + socket.id + '  to  ' + st1);
		io.to(socket.id).emit('welcome message',welcomeMessage);
		io.to(st1).emit('welcome message',welcomeMessage);
	}
	else {
		freeUsers.push(socket.id);
	}
	socket.on('disconnect', function() {
		var st2 = idmap[socket.id];
		if(st2) {
			io.to(st2).emit('disconnect message',disconnectMessage);
			delete idmap[socket.id];
			delete idmap[st2];
			if(freeUsers.length) {
				var st3 = freeUsers.shift();
				idmap[st2] = st3;
				idmap[st3] = st2;
				io.to(st2).emit('welcome message',welcomeMessage);
				io.to(st3).emit('welcome message',welcomeMessage);
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
