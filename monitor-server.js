
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

class Monitor extends EventEmitter {
	constructor() {
        super();
	}

	emit_state(state) {
		this.emit('state', state);
	}
}

var monitor = new Monitor();

function on_scores(match, p1) {
	console.log('Scores: ' + p1);
	monitor.emit_state(p1);
	return '';
}

function on_players(match, p1) {
	console.log('Players: ' + p1);
	return '';
}

function on_info(match, p1) {
	console.log('Info: ' + p1);
	return '';
}

function on_server_message(match,p1) {
	p1.replace(/scores\n([\s\S]*)/, on_scores);
	p1.replace(/players\n([\s\S]*)/, on_players);
	p1.replace(/info\n([\s\S]*)/, on_info);
	return ''; // eat all packets
}

//////////////////////////////////////////////////////////////

var in_buffer = ''

const io = require('socket.io')(httpServer);
const port = 3000

httpServer.listen(port, () => {
	console.log('go to http://localhost:' + port);
});

io.on('connect', socket => {
	console.log('Server connected');

	var m_client = new net.Socket();

	m_client.connect(9999, 'ipsm.makarta.com', function() {
		console.log('Game engine connected');
		m_client.write('monitor\n\n');

		monitor.on('state', (data) => { m_client.emit('state', data); } );
	});

	m_client.on('data', function(data) {
		in_buffer += data;
		in_buffer = in_buffer.replace(/([\s\S]+?)\n\n/, on_server_message);

		// m_client.destroy(); // kill client after server's response
	});

	m_client.on('close', function() {
		console.log('Game engine closed');
	});

}
	 );

