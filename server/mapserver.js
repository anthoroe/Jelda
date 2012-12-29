var hashProvider = require('crypto');

function mapServer(mapId) {

	var mapData,
		mapState = {
			Entities: []
		},
		playerSessions = [];

	////////////////////////////////////////////////////////////
	// Creates an entity for the player
	////////////////////////////////////////////////////////////
	var createPlayerEntity = function(playerSession) {

		// Create the entity
		// TODO: This. Better.
		var entity = {
			EntityId: generateEntityId(),
			EntityType: 'playerEntity',
			EntityState: {
				X: 50,
				Y: 50,
				DisplayName: playerSession.Name
			}
		};

		// Push it into our entity list.
		mapState.Entities.push(entity);

		return entity;

	};

	var generateEntityId = function() {

		// Hash the current time. That's our entity ID.
		var hash = hashProvider.createHash('md5');
		hash.update('' + new Date().getTime());
		return hash.digest('hex');

	};

	////////////////////////////////////////////////////////////
	// Register a player as being connected to this map.
	////////////////////////////////////////////////////////////
	this.RegisterPlayerSession = function(playerSession) {

		// For now, just push the player session onto the list of player sessions.
		playerSessions.push(playerSession);

		// Create the player entity
		var playerEntity = createPlayerEntity(playerSession);

		// Inform the client what their EntityId is
		playerSession.SendEventToPlayer('playerentityid', playerEntity.EntityId);

		// Now send the map state
		playerSession.SendEventToPlayer('mapstate', mapState);

	};

	// TODO: Initialize server with initial entities entity map, prepare it.

};

////////////////////////////////////////////////////////////
// Exports
////////////////////////////////////////////////////////////
module.exports.MapServer = mapServer;