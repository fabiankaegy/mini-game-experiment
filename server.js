const app = require("express")();
const { static } = require("express");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const cors = require('cors');

app.get("/", function(req, res) {
	res.json({ message: "Hallo Welt!" });
});

app.use('/static', static('public'));
app.use( cors() );

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });
  

const players = [];
let status = 'waiting_room';

io.sockets.on("connection", socket => {
	
	socket.emit("welcome", {
		players, status
	});

	socket.on("add_player", player => {
		const newPlayer = {name: player.name, id: socket.id};
		players.push(newPlayer);
		socket.emit("player_created", newPlayer);
		io.emit(
			"player_added",
			{players, status}
		);
    });
    
    socket.on('start_game', () => {
		status = 'game_started'
        io.emit('game_started', {
            players, status
		} )
		
		players.forEach( async (player) => {
			io.to( player.id ).emit( 'input_request', 'name' );

			await new Promise( resolve => {
				socket.on( 'request_answer', ( data ) => {
					resolve(data);
				} )
			})

			console.log( data );
		});
    })

});

http.listen(3000, function() {
	console.log("listening on *:3000");
});
