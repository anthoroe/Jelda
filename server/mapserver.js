var hashProvider = require('crypto');

function mapServer(mapId) {

	var mapData,
		mapState = {
			Entities: []
		},
		playerSessions = [],
		entityLookupTable = {};

	////////////////////////////////////////////////////////////
	// Creates an entity for the player
	////////////////////////////////////////////////////////////
	var broadcastEvent = function(eventType, data, originator) {

		for (var i = 0; i < playerSessions.length; i++) {

			if (playerSessions[i] !== originator) {
				playerSessions[i].SendEventToPlayer(eventType, data);
			}

		};

	};

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
		// TODO: RegisterEntity
		mapState.Entities.push(entity);
		entityLookupTable[entity.EntityId] = entity;

		// Return this player's entity.
		return entity;

	};

	////////////////////////////////////////////////////////////
	// Generates an entity ID
	////////////////////////////////////////////////////////////
	var generateEntityId = function() {

		// Hash the current time. That's our entity ID.
		var hash = hashProvider.createHash('md5');
		hash.update('' + new Date().getTime());
		return hash.digest('hex');

	};

	////////////////////////////////////////////////////////////
	// Handles an entity state update event
	////////////////////////////////////////////////////////////
	var handleEntityStateUpdate = function(state, playerSession) {

		// TODO: Check the user has the right to update this entity
		// Find the entity to be updated
		var entity = entityLookupTable[state.EntityId];

		// TODO: Validate state update

		// Set up entity state.
		for (var stateMember in state) {

			// No inherited members
			if (!state.hasOwnProperty(stateMember)) {
				continue;
			}

			// Set the state on this member
			entity.EntityState[stateMember] = state[stateMember];

		}

		// Broadcast the entity state update to everyone.
		broadcastEvent('entitystateupdate', getEntityStateForTransmission(entity), playerSession);

	};

	////////////////////////////////////////////////////////////
	// Handles an entity state update event
	////////////////////////////////////////////////////////////
	var getEntityStateForTransmission = function(entity) {

		// Create the entity state object
		var entityState = { EntityId: entity.EntityId };

		// Copy entity state into the new object
		for (var stateMember in entity.EntityState) {

			// No inherited members
			if (!entity.EntityState.hasOwnProperty(stateMember)) {
				continue;
			}

			// Set the state on this member
			entityState[stateMember] = entity.EntityState[stateMember];

		}

		// Return the state
		return entityState;

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

		// Subscribe to entity state updates from the player
		playerSession.SubscribeToEvent('entitystateupdate', function(data) {

			// Handle this state update
			handleEntityStateUpdate(data, playerSession);

		});

		// Assign the player entity to the player's session
		playerSession.Entity = playerEntity;

		// TODO: Handle disconnects

	};

	// TODO: Initialize server with initial entities entity map, prepare it.

};

////////////////////////////////////////////////////////////
// Exports
////////////////////////////////////////////////////////////
module.exports.MapServer = mapServer;