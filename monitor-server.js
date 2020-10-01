
var net = require('net');
const content = require('fs').readFileSync(__dirname + '/monitor.html', 'utf8');

const httpServer = require('http').createServer((req, res) => {
	// serve the index.html file
	res.setHeader('Content-Type', 'text/html');
	res.setHeader('Content-Length', Buffer.byteLength(content));
	res.end(content);
});

//////////////////////////////////////////////////////////////

const EventEmitter = require('events');
var in_buffer = ''

class Monitor extends EventEmitter {
	constructor() {
        super();

		this.connected = false;
	}

	start() {
		var m_client = new net.Socket();

		m_client.connect(9999, 'ipsm.makarta.com', () => {
			console.log('Game engine connected');
			m_client.write('monitor\n\n');
			this.connected = true;
		});

		m_client.on('data', (data) => {
			in_buffer += data;
			in_buffer = in_buffer.replace(/([\s\S]+?)\n\n/, this.on_server_message.bind(this));
		});

		m_client.on('close', () => {
			console.log('Game engine closed');
			this.start();
		});
	}

	on_scores(match, p1) {
		console.log('Scores: ' + p1);
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
const port = 3000

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
		  monitor.on('state', (data) => { socket.emit('state', data); } );
	  }
	 );

