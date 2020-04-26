import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import io from 'socket.io';
import http from 'http';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';
const jstr = JSON.stringify;
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
let generatenewgame = (state) => { console.log('new game generated: ', state.label);
	state = {...state, game_id:games.length};
	games = [...games,{game:state}];
	clients = [...clients,{ }];
	return state.game_id;
};
console.log('server started');
let regPlyr = (socket,msg) => socket.join(msg.game_id);
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
				socket.to(msg.game_id).emit('set',jstr(msg));
				break;
			case 'newgame' : console.log(msg.header);
				socket.emit('id',generatenewgame(msg.game)); 
				break;
			case 'ping': //console.log(msg.header);
				socket.emit(jstr({ header: "pong" }));
				break;
			case 'remove' :  console.log(msg.header);
				games = games.splice(msg.game_id,1);
				break;
			case 'fetchexisting' :  console.log(msg.header);
				socket.emit('fetch',jstr(games));
				break;
			case 'enterexisting' : console.log(msg.header);
				let game_id = msg.game_id,
					game = games[game_id].game,
					slot = msg.slot;
				if(slot == -1) break;
				let player_name = msg.player_name,
					game.players[slot] = {...game.players[slot], name:player_name, available:false};
				regPlyr(socket,msg);
				if (game.currentphase < 0) game.currentphase = 0;
				socket.emit('enter',jstr(game));
				ws.to(game_id).emit('join',jstr({slot:slot,player:game.players[slot]}));
				break;
		}
	});
});
export default server;