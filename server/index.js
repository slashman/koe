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
		lastActions[socket.id] = new Date().getTime();

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
	});

});

server.listen(3001, function(){
  console.log('listening on *:3001	');
});