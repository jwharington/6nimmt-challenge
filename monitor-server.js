
var net = require('net');

//////////////////////////////////////////////////////////////

function on_scores(match, p1) {
	console.log('Scores: ' + p1);
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

var client = new net.Socket();
var in_buffer = ''

client.connect(9999, 'ipsm.makarta.com', function() {
	console.log('Connected');
	client.write('monitor\n\n');
});

client.on('data', function(data) {
	in_buffer += data;
	in_buffer = in_buffer.replace(/([\s\S]+?)\n\n/, on_server_message);
	// client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});

