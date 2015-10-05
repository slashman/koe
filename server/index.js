var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var model = require('./model');
var combat = require('./combat/combat');

var colors = {};
var lastActions = {};

io.on('connection', function(socket){
	console.log('Someone connected to us');
	switch (Math.floor(Math.random()*3)){
		case 0:
		colors[socket.id] = 'yellow';
		break;
		case 1:

		colors[socket.id] = 'blue';
		break;
		case 2:

		colors[socket.id] = 'red';
		break;
	}

	socket.on('getMap', function(){
		socket.emit('heresTheMap', {map: model.map, color: colors[socket.id]});
	});

	socket.on('conquer', function(source, target){
		console.log('socket '+socket.id+" wants to conquer x:"+target.x+" y:"+target.y);
		console.log('from source region: ' + source.x + ","+source.y);
		var lastPlayerAction = lastActions[socket.id];
		if (lastPlayerAction && new Date().getTime() - lastPlayerAction < 1000){
			return;
		}
		 //attacks are always with the same soldier force

		if(canConquer(lastPlayerAction, model.map, target, colors[socket.id])
			&& combat.combat(model.map[target.x][target.y])){ // should receive the amount of brigands from the source
			io.emit('conquered', {
				id: socket.id,
				x: target.x,
				y: target.y,
				color: colors[socket.id]
			});
			model.map[target.x][target.y].owner = colors[socket.id];
			lastActions[socket.id] = new Date().getTime();
		}
		

	});

});

var canConquer = function (lastAction, map, where, color){

	if(!lastAction){
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