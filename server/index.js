var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var model = require('./model');
var combat = require('./combat/combat');

var user = false;
var lastActions = {};

io.on('connection', function(socket){
	console.log('Someone connected to us');
	
	socket.on('getMap', function(player){
		console.log('received a map request from ', player);
		var color = false;
		user = loadUser(player, socket.id);
		socket.emit('heresTheMap', {map: model.map, color: user.color, soldiers: user.soldiers });
	});
	
	socket.on('conquer', function(source, target){
		console.log('socket '+socket.id+" wants to conquer x:"+target.x+" y:"+target.y + ' from source region: ' + source.x + ","+source.y); 
		var attack = {
			user: user,
			model: model,
			target: target
		}
		if(combat.executeCombatStack(attack)){
			io.emit('conquered', {
				id: socket.id,
				attack: attack
			});
			model.map[target.x][target.y].owner = user.color;
			user.lastAction = new Date().getTime();
		} else {
			io.emit('defeat', attack);
		}
	});
});

var loadUser = function (player, socketId){
	var username = player.username;
	if(!model.players[username]){
		newUser = {
			lastActiveSocket: socketId,
			lastAction: false,
			color: '',
			username: username,
			soldiers: 10
		};
		
		switch (Math.floor(Math.random()*3)){
			case 0:
				newUser.color = 'yellow';
				break;
			case 1:
				newUser.color = 'blue';
				break;
			case 2:
				newUser.color = 'red';
				break;
		}
		model.players[username] = newUser;
	}
	return model.players[username];
}

server.listen(3001, function(){
  console.log('listening on *:3001	');
});