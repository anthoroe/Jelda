/*
 *
 *	Jelda asset server
 *  Serves static content, behaviors, etc.
 *  Also serves the client to users.
 *
 */

////////////////////////////////////////////////////////////
// Required includes
////////////////////////////////////////////////////////////
var express = require('express');

////////////////////////////////////////////////////////////
// Start up the asset server
////////////////////////////////////////////////////////////
var contentServer = express();
contentServer.use(express.static(__dirname + '/client'));
contentServer.use(function(req, res) {
	if (req.originalUrl === '/') {
		res.redirect('/default.html');
	}
});

// Figure out which port we're listening on.
var port = process.env.PORT || 5000;

// And start the content server
contentServer.listen(port);