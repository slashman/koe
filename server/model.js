var model = {
	map: []
}

for (var x = 0; x < 20; x++){
	model.map[x] = [];
	for (var y = 0; y < 20; y++)
		model.map[x][y] = false;
}


module.exports = model;