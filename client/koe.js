function conquer(x,y){
	socket.emit("conquer", {x: x, y:y});
}
