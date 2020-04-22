import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import io from 'socket.io';
import http from 'http';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

let server = http.createServer();
polka({server}) // You can also use Express
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware()
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});

let clients = [], games = [];
let generatenewgame = (state) => {
	state = {...state, game_id:games.length};
	games = [...games,{game:state}];
	clients = [...clients,{ }];
	return state.game_id;
};
console.log('server started');
let regPlyr = (socket,msg) => socket.join(msg.game_id);//{if (!clients[msg.game_id][msg.sender]) clients[msg.game_id][msg.sender] = socket;};
let setState = (msg) => games[msg.game_id] = { game: msg };
let ws = io(server).on('connection', socket => {
	console.log('connection made');
	socket.on('message', msg => {
		msg = JSON.parse(msg);
		switch (msg.header) {
			case 'register' :  console.log(msg.header);
				regPlyr(socket,msg);
				break;
			case 'set' :  //console.log(msg.header);
				setState(msg);
				socket.to(msg.game_id).emit('set',JSON.stringify(msg));
				break;
			case 'newgame' : console.log(msg.header);
				socket.emit('id',generatenewgame(msg.game)); 
				break;
			case 'ping': //console.log(msg.header);
				socket.emit(JSON.stringify({ header: "pong" }));
				break;
			case 'remove' :  console.log(msg.header);
				games = games.splice(msg.game_id,1);
				break;
			case 'fetchexisting' :  console.log(msg.header);
				socket.emit('fetch',JSON.stringify(games));
				break;
			case 'enterexisting' : console.log(msg.header);
				let game_id = msg.game_id;
				let slot = msg.slot;
				let player_name = msg.player_name;
				console.log()
				games[game_id].game.players[slot].name = player_name;
				games[game_id].game.players[slot].available = false;
				regPlyr(socket,msg);
				//if (games[game_id].game.players.reduce((acc,cur)=>acc + (cur.available) ? 1 : 0,0) == 0) games[game_id].game.currentphase++;
				socket.emit().emit('enter',JSON.stringify(games[game_id].game));
				ws.to(game_id).emit('join',JSON.stringify({slot:slot,player:games[game_id].game.players[slot]}));
				// Object.keys(clients[game_id]).forEach((client) => {
				// 	clients[game_id][client].emit('enter',JSON.stringify(games[game_id].game));
				// });
				break;
		}
	});
});
