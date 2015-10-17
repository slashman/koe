var brigandAtk = 10; 
var peasantAtk = 7;

var CombatStack = [];

exports.initCombatStack = function (){
	
	for(var propt in combatChecks){
	    CombatStack.push(combatChecks[propt])
	}
	return CombatStack;
}

var combatChecks = {
	lastActionCheck: function(user, model, target){
		console.log('Checking amount of actions per second...');
		if (user.lastAction && new Date().getTime() - user.lastAction < 1000){
		  	return false;
		}
		return true;
	},
	adjacentFiefsCheck: function (user, model, target){
		console.log('Checking adjacent fiefs...');
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
	attackPowerCheck: function(user, model, target){
		console.log('Checking attack power...');
		var brigands = user.soldiers; //default amount of attackers - should depend on source of attack
		
		var brigandPower = 0;
		var peasantPower = 0;
		for (var i = 0; i < brigands; i++) {
			brigandPower += Math.floor((Math.random() * brigandAtk) + 1);
		}
		for (var i = 0; i < target.peasants; i++) {
			peasantPower += Math.floor((Math.random() * peasantAtk) + 1);
		}
		console.log('brigandPower: ' + brigandPower + ', peasantPower:' + peasantPower );

		var result = brigandPower > peasantPower ? true : false;
		
		soldiersLost = calculateLostUnits(brigandPower, peasantPower);
		
		return result;
	}
};


function calculateLostUnits(attackPwr, defensePwr){
	
	return 0;
}


