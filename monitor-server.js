
//////////////////////////////////////////////////////////////
// Launch web server, loading monitor.html
// (this web client communicates with this server via socket.io)

const content = require('fs').readFileSync(__dirname + '/monitor.html', 'utf8');

const httpServer = require('http').createServer((req, res) => {
	// serve the index.html file
	res.setHeader('Content-Type', 'text/html');
	res.setHeader('Content-Length', Buffer.byteLength(content));
	res.end(content);
});

//////////////////////////////////////////////////////////////
// Monitor engine (receives TCP messages from game server)

const EventEmitter = require('events');
var in_buffer = ''
var net = require('net');

class Monitor extends EventEmitter {
	constructor() {
        super();

		this.connected = false;
	}

	start() {
		// launch socket connection to game engine

		var m_client = new net.Socket();

		m_client.connect(9999, 'ipsm.makarta.com', () => {
			console.log('Game engine connected');
			this.connected = true;
			// purge buffer on start
			in_buffer = ''
			// tell game engine we are a monitor
			m_client.write('monitor\n\n');
		});

		m_client.on('data', (data) => {
			// on receipt of data, feed to parser
			in_buffer += data;
			in_buffer = in_buffer.replace(/([\s\S]+?)\n\n/g, this.on_server_message.bind(this));
		});

		m_client.on('close', () => {
			console.log('Game engine closed');
			// restart when closed
			this.start();
		});
	}

	on_scores(match, p1) {
		console.log('Scores: ' + p1);
		// send message to clients
		this.emit('state', p1);
		return '';
	}

	on_players(match, p1) {
		console.log('Players: ' + p1);
		return '';
	}

	on_info(match, p1) {
		console.log('Info: ' + p1);
		return '';
	}

	on_server_message(match,p1) {
		p1.replace(/scores\n([\s\S]*)/, this.on_scores.bind(this));
		p1.replace(/players\n([\s\S]*)/, this.on_players.bind(this));
		p1.replace(/info\n([\s\S]*)/, this.on_info.bind(this));
		return ''; // eat all packets
	}
}

//////////////////////////////////////////////////////////////


const io = require('socket.io')(httpServer);
const port = 3000;

httpServer.listen(port, () => {
	console.log('go to http://localhost:' + port);
});

var monitor = new Monitor();


io.on('connect',
	  socket => {
		  console.log('Server connected');
		  if (!monitor.connected) {
			  monitor.start();
		  }
		  // attach socket.io clients to monitor
		  monitor.on('state', (data) => { socket.emit('state', data); } );
	  }
	 );

