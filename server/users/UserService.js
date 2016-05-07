var model = require('../model');

exports.loadUser = function (playerObj, socketId){
	console.log('[USER LOADING]');
	if(!model.players[playerObj.username]){
		console.log('User does not exist. Creating user...');
		this.createUser(playerObj, socketId);
	}
	this.registerUserSocket(model.players[playerObj.username], socketId);
	return model.players[playerObj.username];
}

exports.createUser = function (playerObj, socketId){
	var newUser = {
		lastActiveSocket: socketId,
		lastAction: false,
		color: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
		username: playerObj.username,
		soldiers: 100
	};
	model.players[playerObj.username] = newUser;
}

exports.registerUserSocket = function(playerObj, socketId) {
	model.sockets[socketId] = playerObj;
	model.players[playerObj.username].lastActiveSocket = socketId;
}

exports.updateSoldierCount = function(username, updatedSoldiers) {
	user = model.players[username];
	user.soldiers = updatedSoldiers;
	model.players[username] = user;
}