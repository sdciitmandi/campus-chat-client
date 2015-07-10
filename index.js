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

var usernames = {};// usernames which are currently connected to the chat

var rooms = {};// rooms which are currently available in chat

var userstatus = {}; //current status of users, either they are single or in some room

var welcomeMessage = "You are chatting with a random stranger, Say Hi!\n";
var disconnectMessage = "Stranger has left. Please Reload this page or wait for us to connect you with someone.\n";


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});



io.sockets.on('connection', function(socket){
	
	 //console.log('New user joined' + socket.id);
	 //asks name to the user
	socket.emit('askname');
	
	socket.on('changename', function(newname){ 
		if(usernames[newname]!=undefined){
			socket.emit('alert', 'username already exists');
			return ;
			}
		var oldname=socket.username;
		socket.username=newname;
		delete usernames[oldname];
		usernames[newname]=newname;
		
			if(userstatus[socket.id]== "free"){
		if(idmap[socket.id]) io.to(idmap[socket.id]).emit('updatechat','SERVER' ,oldname+' has changed his name to '+newname);
			io.to(socket.id).emit('updatechat','SERVER' ,'You have changed your name to '+newname);}
		else if(userstatus[socket.id] =='member'){
			socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', oldname+' has changed his name to '+newname);
		socket.emit('updatechat', 'SERVER', 'You have changed your name to '+newname);
			}
		
		});
	
	// when the user emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		
		// store the username in the socket session for this client
		if(usernames[username]!=undefined){
			socket.emit('tryagain','username exits..Try another one');
			}
		else {
			// add the client's username to the global list
		usernames[username] = username;
		socket.username = username;
		// console.log('\n' + usernames[username]);
		}
		
		// console.log('\n' + socket.username);
		// store the room name in the socket session for this client
		
		userstatus[socket.id]='free';
		 
		
		
		if(freeUsers.length && socket.username!=undefined) { // Chechk if there are some free users
		var st1 = freeUsers.shift(); // Remove the user who has been waiting longest
		
		idmap[socket.id] = st1;
		idmap[st1] = socket.id;
		console.log('Connected' + socket.id + '  to  ' + st1);
		io.to(socket.id).emit('welcome message',welcomeMessage);
		io.to(st1).emit('welcome message',welcomeMessage);
			}
		else if(socket.username!= undefined){
		freeUsers.push(socket.id); // Else push the user in the queue for later processing
		}
		
	
			
			socket.emit('updaterooms',rooms);
			
		// send client to room 1
		//socket.join('room1');
		// echo to client they've connected
		//socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		// echo to room 1 that a person has connected to their room
		//socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		
	});
	
	
	
	
	socket.on('changeroom', function(newroom){
		
		
		console.log('hello1\n');
		//socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		if(userstatus[socket.id]== "member"){
			var room_count=Object.keys(io.sockets.adapter.rooms[socket.room]).length;
		socket.leave(socket.room);
		rooms[socket.room]=room_count-1;
		console.log('hello2\n');
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		}
		else{
			var st2 = idmap[socket.id];
		if(st2) {
			io.to(st2).emit('disconnect message',disconnectMessage);
			delete idmap[socket.id];
			delete idmap[st2];
			console.log('hello3\n');
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
		else freeUsers.shift();
			}
		
		socket.join(newroom);
		rooms[newroom]=Object.keys(io.sockets.adapter.rooms[newroom]).length;

		userstatus[socket.id]='member';
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.broadcast.emit('updaterooms',rooms);
		socket.emit('updaterooms', rooms);
	
	});
	
	socket.on('createroom',function(roomname){
		
		if(userstatus[socket.id] == 'free'){
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
				console.log('hello3\n');
				io.to(st2).emit('welcome message',welcomeMessage);
				io.to(st3).emit('welcome message',welcomeMessage);
			}
			else freeUsers.push(st2);
			//console.log('hello4\n');
		}
		else{freeUsers.shift();}
			}
			else if(userstatus[socket.id] == 'member'){
				var room_count=Object.keys(io.sockets.adapter.rooms[socket.room]).length;
		socket.leave(socket.room);
		rooms[socket.room]=room_count-1;
			socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
				}
		
		console.log('\n'+roomname+'   '+ socket.username);
		socket.join(roomname);
		rooms[roomname]=Object.keys(io.sockets.adapter.rooms[roomname]).length;

		socket.room = roomname;
		userstatus[socket.id]="member";
		socket.emit('updatechat', 'SERVER', 'you have connected to '+roomname);
		socket.broadcast.emit('updaterooms',rooms);
		socket.emit('updaterooms',rooms);
		/*for(var i=0; i<rooms.length;++i){
			console.log('\n'+rooms[i]);
			socket.broadcast.to(rooms[i]).emit('updaterooms',rooms,rooms[i]);
			}*/
		});
		
		
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		
		if(userstatus[socket.id]!= "free"){
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);}
		else{
			if(idmap[socket.id]) io.to(idmap[socket.id]).emit('updatechat',socket.username ,data);
			io.to(socket.id).emit('updatechat','YOU' ,data);
			}
	});
	
	 socket.on('user image', function (data) {
     // console.log(msg);
     if(userstatus[socket.id]!= "free"){
		io.sockets.in(socket.room).emit('userimage', socket.username, data);}
		else{
			if(idmap[socket.id]) io.to(idmap[socket.id]).emit('userimage',socket.username ,data);
			io.to(socket.id).emit('userimage','YOU' ,data);
			}
     
     
    //  socket.broadcast.emit('user image', socket.username, msg);
    });
	
	//Handling Code when a User disconnects
	socket.on('disconnect', function() {
		if(userstatus[socket.id] == "member"){
			
		
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		
			
			socket.leave(socket.room);
		//socket.leave(socket.room);
		rooms[socket.room]-=1;
		socket.broadcast.emit('updaterooms',rooms);
	}
	else if(userstatus[socket.id] == "free"){
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
	}
	});
	
	//When message comes , send it to the id mapped to socket's
 /* socket.on('chat message', function(msg){
     console.log('message: ' + msg);
   if(idmap[socket.id]) io.to(idmap[socket.id]).emit('chat message', msg);
   console.log(idmap);
  });*/
});



var deployPort = process.env.PORT || 3000;
httpServer.listen(deployPort, function() {
    console.log('Listening on *:' + deployPort);
});

//var room_count = Object.keys(io.sockets.adapter.rooms[roomname]).length;
