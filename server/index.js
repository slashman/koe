var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var model = require('./model');
var combat = require('./combat/combat');

io.on('connection', function(socket){
	console.log('Someone connected to us');
	
	socket.on('getMap', function(player){
		console.log('received a map request from ', player);
		var color = false;
		var user = loadUser(player, socket.id);
		socket.emit('heresTheMap', {map: model.map, color: user.color, soldiers: user.soldiers });
	});
	
	socket.on('conquer', function(source, target){
		console.log('socket '+socket.id+" wants to conquer x:"+target.x+" y:"+target.y + ' from source region: ' + source.x + ","+source.y); 
		var attack = {
			user: model.sockets[socket.id],
			model: model,
			target: target
		}
		if(combat.executeCombatStack(attack)){
			io.emit('conquered', {
				id: socket.id,
				attack: attack

			});
			model.map[target.x][target.y].owner = model.sockets[socket.id].color;
			model.sockets[socket.id].lastAction = new Date().getTime();
		} else {
			socket.emit('defeat', attack);
		}
	});

	socket.on('disconnect', function() {
      	console.log('Got disconnect!');
		delete model.sockets[socket.id];
   });
});

var loadUser = function (player, socketId){
	console.log('[USER LOADING]');
	var username = player.username;
	console.log('Getting user information for: ', username);
	if(!model.players[username]){
		console.log('User does not exist. Creating user...');
		newUser = {
			lastActiveSocket: socketId,
			lastAction: false,
			color: getRandomColor(),
			username: username,
			soldiers: 10
		};
		model.players[username] = newUser;

	}
	model.sockets[socketId] = model.players[username]; //register player in sockets map
	return model.players[username];
}

var getRandomColor = function(){
	var color = '';

	switch (Math.floor(Math.random()*3)){
		case 0:
			color = 'yellow';
			break;
		case 1:
			color = 'blue';
			break;
		case 2:
			color = 'red';
			break;
	}
	return color;
}

server.listen(3001, function(){
  console.log('listening on *:3001	');
});