var mapServers = {};

////////////////////////////////////////////////////////////
// Import some important stuff
////////////////////////////////////////////////////////////
var PlayerSession = require('./playersession.js').PlayerSession;
var MapServer = require('./mapserver.js').MapServer;

////////////////////////////////////////////////////////////
// Initialize the world server
////////////////////////////////////////////////////////////
function initialize(io) { 

	////////////////////////////////////////////////////////////
	// Connection received
	////////////////////////////////////////////////////////////
	io.on('connection', function(socket) {

		// First, create a player session for this connection.
		var playerSession = new PlayerSession(socket);

		////////////////////////////////////////////////////////////
		// Attempt to connect to a map.
		////////////////////////////////////////////////////////////
		socket.on('mapconnect', function(data) {

			console.log(data);

			// Let's see if there are any existing map servers for this map?
			// We don't spin up a map server until we need one, and we shut down map servers that are empty.
			// TODO: Actually shut down empty map servers.
			if (typeof mapServers[data.MapId] === 'undefined') {

				// Spin up a server if we don't already have one.
				mapServers[data.MapId] = new MapServer(data.MapId);

			}

			// Finish logging in the player.
			playerSession.Login(data.Token);

			// Register this user with that map server.
			mapServers[data.MapId].RegisterPlayerSession(playerSession);
		});

	});

};

////////////////////////////////////////////////////////////
// Exports
////////////////////////////////////////////////////////////
module.exports.Initialize = initialize;
