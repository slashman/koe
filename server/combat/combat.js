var brigandAtk = 10; 
var peasantAtk = 7;

/*
	The combat stack will return true if all the checks in the combatChecks object return true.
*/
exports.executeCombatStack = function (attack){
	for(var propt in combatChecks){
	    var result = combatChecks[propt](attack);
	    if(result == false) break;
	}	
	return result;
}

/*
	Add combat checks as required while respecting the established order. 
	Modification of user, model or target objects will affect subsequent checks.
*/
var combatChecks = {
	lastActionCheck: function(attack){
		console.log('Checking amount of actions per second...');
		if (attack.user.lastAction && new Date().getTime() - attack.user.lastAction < 1000){
		  	return false;
		}
		return true;
	},
	adjacentFiefsCheck: function (attack){
		console.log('Checking adjacent fiefs...');
		var target = attack.target;
		var user = attack.user;
		var model = attack.model;

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
		
		attack.attackersLost = calculateLostUnits(brigandPower, peasantPower);
		attack.defendersLost = calculateLostUnits(brigandPower, peasantPower);
		
		return result;
	}
};

function calculateLostUnits(atkPwr, defPwr){
	return 0;
}


