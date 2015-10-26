var model = require('../model');

exports.loadUser = function (player, socketId){
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

function getRandomColor() {
  function c() {
    return Math.floor(Math.random()*256).toString(16)
  }
  return "#"+c()+c()+c();
}