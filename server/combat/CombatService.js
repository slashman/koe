var model = require('../model');
var UserService = require('../users/UserService');
var brigandAtk = 10; 
var peasantAtk = 7;

/*
	The combat stack will return true if all the checks in the combatChecks object return true.
*/
exports.executeCombatStack = function (attack){
	//Execute the dynamic combat check stack
	for(var propt in combatChecks){
	    attack.result = combatChecks[propt](attack);
	    if(attack.result == false) break;
	}
	//Modify the model based on the result of the combatStack
	console.log(model.sockets[attack.user.lastActiveSocket]);
	if(attack.result){
		model.map[attack.target.x][attack.target.y].owner = model.sockets[attack.user.lastActiveSocket].color;
		model.sockets[attack.user.lastActiveSocket].lastAction = new Date().getTime();	
	}

	return attack.result;
}

/*
	Add combat checks as required while respecting the established order. 
	Modification of user, model or target objects will affect subsequent checks.
*/
var combatChecks = {
	/*
		A player should not be able to execute actions more often than once per second.
	*/
	lastActionCheck: function(attack){
		console.log('Checking amount of actions per second...');
		console.log('time since last action: ', new Date().getTime() - attack.user.lastAction);
		if (attack.user.lastAction && new Date().getTime() - attack.user.lastAction < 1000){
		  	return false;
		}
		return true;
	},
	/*
		A Player should only be able to initiate attack when they control at least one of the adjacent fiefs.
	*/
	adjacentFiefsCheck: function (attack){
		console.log('Checking adjacent fiefs...');
		var target = attack.target;
		var user = attack.user;
		var model = attack.model;
		console.log('user color: ', user.color);
		console.log('lastAction: ', user.lastAction);
		if(!user.lastAction){
			return true;
		}
		if(target.y > 0 && model.map[target.x][target.y - 1].owner === user.color) { //same color up
			return true;
		} else if (target.y < model.height-1 && model.map[target.x][target.y + 1].owner === user.color){ //same color down
			return true;
		} else if (target.x > 0 && model.map[target.x - 1][target.y].owner === user.color ){ //same color left
			return true;
		} else if (target.x < model.width - 1 && model.map[target.x + 1][target.y].owner === user.color ){ //same color right
			return true;
		} 
		return false;
	},
	/*
		A Player can only obtain control of a fief when their attack power exceeds that of the defending fief.
	*/
	attackPowerCheck: function(attack){
		console.log('Checking attack power...');
		
		var target = attack.target;
		var user = attack.user;
		var model = attack.model;

		var brigands = user.soldiers; //default amount of attackers - should depend on source of attack
		var targetFief = model.map[target.x][target.y];
		var brigandPower = 0;
		var peasantPower = 0;
		for (var i = 0; i < brigands; i++) {
			brigandPower += Math.floor((Math.random() * brigandAtk) + 1);
		}
		for (var i = 0; i < targetFief.peasants; i++) {
			peasantPower += Math.floor((Math.random() * peasantAtk) + 1);
		}
		console.log('brigandPower: ' + brigandPower + ', peasantPower:' + peasantPower );

		var result = brigandPower > peasantPower ? true : false;
		
		attack.attackersLost = calculateLostUnits(brigandPower, peasantPower).attackers;
		attack.defendersLost = calculateLostUnits(brigandPower, peasantPower).defenders;

		UserService.updateSoldierCount(user.username, attack.user.soldiers - attack.attackersLost);

		return result;
	}

};

function calculateLostUnits(atkPwr, defPwr){
	//if the attackers have > 2x(defPwr)
	return {
		attackers: 10,
		defenders: 10
	};
}


