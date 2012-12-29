function playerSession(socket) {

	// DEBUGGERY
	this.Name = 'Unknown Player';

	/////////////////////////////////////////////////////////////
	// Finishes logging in the player and populates the session
	////////////////////////////////////////////////////////////
	this.Login = function(token) {

		// DEBUGGERY
		this.Name = token;

	};

	////////////////////////////////////////////////////////////
	// Contacts the player on their socket
	////////////////////////////////////////////////////////////
	this.SendEventToPlayer = function(event, args) {

		// Send the message out over the socket
		socket.emit(event, args);

	};
};

module.exports.PlayerSession = playerSession;