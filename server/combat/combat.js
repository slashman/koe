var brigandAtk = 10; 
var peasantAtk = 7;

exports.attack = function(player, targetFief){
	var brigands = player.soldiers; //default amount of attackers - should depend on source of attack
	
	var brigandPower = 0;
	var peasantPower = 0;
	for (var i = 0; i < brigands; i++) {
		brigandPower += Math.floor((Math.random() * brigandAtk) + 1);
	}
	for (var i = 0; i < targetFief.peasants; i++) {
		peasantPower += Math.floor((Math.random() * peasantAtk) + 1);
	}
	console.log('brigandPower: ' + brigandPower + ', peasantPower:' + peasantPower );

	var result = {
		success: brigandPower > peasantPower ? true : false,
		soldiersLost: calculateLostUnits(brigandPower, peasantPower)
	};

	return result;
}
/*
TODO
The amount of lost units should be:

1. greater for the loser
2. proportional to the difference of power in the battle

*/
function calculateLostUnits(attackPwr, defensePwr){
	
	return 0;
}

