var waiting = false;
var socket = false;

function conquer(x,y){
	if (waiting)
		return;
	socket.emit("conquer", {x: x, y: y}, {x: x, y:y} );
	document.getElementById("status").innerHTML = "Recovering...";
	document.getElementById("status").style.color = "red";
	waiting = true;
	setTimeout(function(){
		document.getElementById("status").innerHTML = "Ready";
		document.getElementById("status").style.color = "green";
		waiting = false;
	}, 1000);
}

function login(){	
	start(document.getElementById("player").value);
}

function start(playerName){	
	var color = 'black';
	var player = {
		username: playerName
	};
	socket = io('http://localhost:3001');
	
	socket.emit('getMap', player);
	
	socket.on('heresTheMap', function (response){
		var map = response.map;
		color = response.color;
		player.soldiers = response.soldiers;
		renderMap(map);
		document.getElementById('soldiers').innerHTML = player.soldiers;
	});

	socket.on('conquered', function(combatResult){
		targetCell = document.getElementById('cell'+combatResult.attack.target.x+"-"+combatResult.attack.target.y);
		targetCell.style.backgroundColor = combatResult.attack.user.color;
		targetCell.title = combatResult.attack.user.username;		
	});

	socket.on('soldierCount', function(combatResult){
		document.getElementById('soldiers').innerHTML = combatResult.user.soldiers;		
	});

	socket.on('defeat', function(combatResult){
		console.log('defeat: ', combatResult);
		document.getElementById("status").innerHTML = combatResult.failReason;
		document.getElementById("status").style.color = "red";
	});
	
}

function renderMap(map) {
	var html = '<table>';
	for (var y = 0; y < map[0].length; y++){
		html += '<tr>';
		for (var x = 0; x < map.length; x++){
			if (map[x][y].owner)
				html += '<td id = "cell'+x+'-'+y+'" title='+map[x][y].owner.username+' style = "background-color: '+map[x][y].owner.color+'" onclick = "conquer('+x+', '+y+')">'+map[x][y].peasants+'</td>'
			else
				html += '<td id = "cell'+x+'-'+y+'" title="Unconquered" style = "background-color: green" onclick = "conquer('+x+', '+y+')">'+map[x][y].peasants+'</td>'
		}
		html += '</tr>';
	}
	html += '</table>';
	document.getElementById('playArea').innerHTML = html;
}