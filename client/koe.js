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
