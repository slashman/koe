var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var model = require('./model');
var CombatService = require('./combat/CombatService');
var UserService = require('./users/UserService');

io.on('connection', function(socket){
	console.log('Someone connected to us');
	
	socket.on('getMap', function(player){
		console.log('received a map request from ', player);
		var color = false;
		var user = UserService.loadUser(player, socket.id);
		socket.emit('heresTheMap', {map: model.map, color: user.color, soldiers: user.soldiers });
	});
	
	socket.on('conquer', function(source, target){
		console.log('socket '+socket.id+" wants to conquer x:"+target.x+" y:"+target.y + ' from source region: ' + source.x + ","+source.y); 
		var attack = {
			user: model.sockets[socket.id],
			model: model,
			target: target
		}
		if(CombatService.executeCombatStack(attack)){
			io.emit('conquered', {
				id: socket.id,
				attack: attack,		
			});
		} else {
			socket.emit('defeat', attack);
		}
	});

	socket.on('disconnect', function() {
		console.log('Got disconnect!');
		delete model.sockets[socket.id];
   });
});

server.listen(3001, function(){
  console.log('listening on *:3001	');
});