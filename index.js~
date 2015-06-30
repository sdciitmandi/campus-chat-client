var compression = require("compression");
var express = require('express');
var app = express();
var path = require("path");

// Compress the responses delivered to save bandwidth
app.use(compression());
//Express does not deliver anything beyond route
// So need to set it up to use the public directory for static content
app.use(express.static(path.join(__dirname, 'public')));

var http = require('http');
var httpServer = http.Server(app);

var socketIO = require('socket.io');
var io = socketIO(httpServer);

var freeUsers = []; // IDs of the users who are conncected and free
idmap = {}; // Map containing ids of sockets chatting with each other. Map is symmetric

var welcomeMessage = "You are chatting with a random stranger, Say Hi!\n";
var disconnectMessage = "Stranger has left. Please Reload this page or wait for us to connect you with someone.\n";

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
	// console.log('New user joined' + socket.id);
	if(freeUsers.length) { // Chechk if there are some free users
		var st1 = freeUsers.shift(); // Remove the user who has been waiting longest
		idmap[socket.id] = st1;
		idmap[st1] = socket.id;
		console.log('Connected' + socket.id + '  to  ' + st1);
		io.to(socket.id).emit('welcome message',welcomeMessage);
		io.to(st1).emit('welcome message',welcomeMessage);
	}
	else {
		freeUsers.push(socket.id); // Else push the user in the queue for later processing
	}
	//Handling Code when a User disconnects
	socket.on('disconnect', function() {
		var st2 = idmap[socket.id];
		if(st2) {
			io.to(st2).emit('disconnect message',disconnectMessage);
			delete idmap[socket.id];
			delete idmap[st2];
			//Map the stranger to another user if there exists some free user
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
	//When message comes , send it to the id mapped to socket's
  socket.on('chat message', function(msg){
     console.log('message: ' + msg);
   if(idmap[socket.id]) io.to(idmap[socket.id]).emit('chat message', msg);
   console.log(idmap);
  });
});

var deployPort = process.env.PORT || 3000;
httpServer.listen(deployPort, function() {
    console.log('Listening on *:' + deployPort);
});
