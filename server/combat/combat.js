exports.combat = function(targetFief){
	var brigands = 10;
	var brigandPower = 0;
	var peasantPower = 0;
	
	for (var i = 0; i < brigands; i++) {
		brigandPower += Math.floor((Math.random() * 15) + 1);
	}
	for (var i = 0; i < targetFief.peasants; i++) {
		peasantPower += Math.floor((Math.random() * 20) + 1);
	}
	console.log('brigandPower: ' + brigandPower + ', peasantPower:' + peasantPower );
	return brigandPower > peasantPower ? true : false;
}

