var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.get("/", function(req, res) {
	res.json({ message: "Hallo Welt!" });
});

const players = [];

io.sockets.on("connection", socket => {
	socket.emit("welcome", {
		players
	});

	socket.on("add_player", player => {
		const newPlayer = new Player(player.name, socket.id);
		players.push(newPlayer);
		socket.emit("player_created", newPlayer);
		io.emit(
			"player_added",
			players.map(player => {
				return {
					name: player.name,
					id: player.id
				};
			})
		);
	});

});

http.listen(3000, function() {
	console.log("listening on *:3000");
});
