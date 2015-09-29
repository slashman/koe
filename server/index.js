var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var model = require('./model');

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

	socket.on('conquer', function(where){
		console.log('socket '+socket.id+" wants to conquer x:"+where.x+" y:"+where.y);
		var lastPlayerAction = lastActions[socket.id];
		if (lastPlayerAction && new Date().getTime() - lastPlayerAction < 1000){
			return;
		}		
		if(canConquer(lastPlayerAction, model.map, where, colors[socket.id])){
			socket.broadcast.emit('conquered', {
				id: socket.id,
				x: where.x,
				y: where.y,
				color: colors[socket.id]
			});
			socket.emit('conquered', {
				id: socket.id,
				x: where.x,
				y: where.y,
				color: colors[socket.id]
			});
			model.map[where.x][where.y] = colors[socket.id];			
		}
		lastActions[socket.id] = new Date().getTime();

	});

});

var canConquer = function (lastAction, map, where, color){
	if(!lastAction){
		return true;
	}
	if(where.y > 0 && map[where.x][where.y - 1] === color) { //same color up
		console.log('same color up');
		return true;
	} else if (where.y < model.height-1 && map[where.x][where.y + 1] === color){ //same color down
		console.log('same color down');
		return true;
	} else if (where.x > 0 && map[where.x - 1][where.y] === color ){ //same color left
		console.log('same color left');
		return true;
	} else if (where.x < model.width - 1 && map[where.x + 1][where.y] === color ){ //same color right
		console.log('same color right');
		return true;
	} 
	return false;
};

server.listen(3001, function(){
  console.log('listening on *:3001	');
});