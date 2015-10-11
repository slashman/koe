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

		//Check for automated conquer attempts
		var lastPlayerAction = user.lastAction;
		if (lastPlayerAction && new Date().getTime() - lastPlayerAction < 1000){
			return;
		}

		console.log('checking if user can conquer...')
		
		if(canConquer(lastPlayerAction, model.map, target, user.color)
			&& (combat.attack(user, model.map[target.x][target.y])).success){ // should receive the amount of brigands from the source
			io.emit('conquered', {
				id: socket.id,
				x: target.x,
				y: target.y,
				color: user.color
			});
			console.log('user soldiers ' + user.soldiers);
			console.log('conquered');
			model.map[target.x][target.y].owner = user.color;
			user.lastAction = new Date().getTime();
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
		console.log('chosen color = ', newUser.color);
		model.players[username] = newUser;
	}
	return model.players[username];
}

var canConquer = function (lastAction, map, where, color){
	console.log('checking canConquer for color '+color);
	if(!lastAction){
		console.log('too many actions per second '+lastAction);
		return true;
	}
	if(where.y > 0 && map[where.x][where.y - 1].owner === color) { //same color up
		console.log('same color up');
		return true;
	} else if (where.y < model.height-1 && map[where.x][where.y + 1].owner === color){ //same color down
		console.log('same color down');
		return true;
	} else if (where.x > 0 && map[where.x - 1][where.y].owner === color ){ //same color left
		console.log('same color left');
		return true;
	} else if (where.x < model.width - 1 && map[where.x + 1][where.y].owner === color ){ //same color right
		console.log('same color right');
		return true;
	} 
	return false;
};

server.listen(3001, function(){
  console.log('listening on *:3001	');
});