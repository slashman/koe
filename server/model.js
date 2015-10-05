var model = {
	width : 20,
	height : 20,
	map: []
}

for (var x = 0; x < model.width; x++){
	model.map[x] = [];
	for (var y = 0; y < model.height; y++){
		model.map[x][y] = {
			owner: false,
			//uniformly distributed amount of peasants per fief
			//TODO: make this a normal distribution and make the mean 
			//10 to have outliers that are harder to conquer
			peasants: Math.floor((Math.random() * 10) + 1),
			
		};
	}
}


module.exports = model;