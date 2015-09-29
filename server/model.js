var model = {
	width : 20,
	height : 20,
	map: []
}

for (var x = 0; x < model.width; x++){
	model.map[x] = [];
	for (var y = 0; y < model.height; y++)
		model.map[x][y] = false;
}


module.exports = model;