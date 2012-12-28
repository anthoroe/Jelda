////////////////////////////////////////////////////////////
// The local cache. This stores behaviors, images, maps, etc.
////////////////////////////////////////////////////////////
var jeldaCache = function() {

	////////////////////////////////////////////////////////////
	// Variables
	////////////////////////////////////////////////////////////
	var cache = {
			map: {},
			tile: {},
			entity: {}
		},
		engine;

	////////////////////////////////////////////////////////////
	// getCachedAsset
	////////////////////////////////////////////////////////////
	var getCachedAsset = function(assetType, assetId, callback) {

		var net = engine.network,
			log = engine.logger;

		// If we can't find the asset, request it.
		if (cache[assetType][assetId] === undefined) {

			// Log that we're requesting it.
			log.LogEvent(assetType + ' asset with ID ' + assetId + ' not found in cache. Requesting from service...');

			// Request the asset
			net.GetAsset(assetType, assetId, function(asset) {

				// Log that we've got it
				log.LogEvent(assetType + ' asset with ID ' + assetId + ' retrieved. Caching and returning to request source...');				

				// Save the asset in the cache.
				cache[assetType][assetId] = asset;

				// Call the callback with the asset.
				callback(asset);

			});

		} else {

			// Log that it was cached all along
			log.LogEvent(assetType + ' asset with ID ' + assetId + ' cached. Returning to request source...');

			// Return the cached asset.
			callback(cache[assetType][assetId]);

		}

	};

	////////////////////////////////////////////////////////////
	// GetMap 
	////////////////////////////////////////////////////////////
	var getMap = function(mapId, callback) {

		getCachedAsset('map', mapId, callback);

	};

	////////////////////////////////////////////////////////////
	// GetMap 
	////////////////////////////////////////////////////////////
	var getEntity = function(entityId, callback) {

		getCachedAsset('entity', entityId, callback);

	};

	////////////////////////////////////////////////////////////
	// GetTile 
	////////////////////////////////////////////////////////////
	var getTile = function(tileId, callback) {

		getCachedAsset('tile', tileId, function(asset) {
			
			// We need to get the image data, too.
			asset.ImageData = new Image();

			// Callback when the image loads.
			asset.ImageData.onload = function() {

				// And execute the callback with our completed asset.
				callback(asset);

			};

			// And start the preload.
			asset.ImageData.src = asset.ImageUri;

		});

	};


	////////////////////////////////////////////////////////////
	// GetMultipleTiles 
	// * Requests many tile assets at once and returns when they're all retrieved.
	////////////////////////////////////////////////////////////
	var getMultipleTiles = function(assets, callback) {

		// Keep track of how many pending assets there are.
		var pendingAssets = assets.length, returnedAssets = [], log = engine.logger;

		// Log what's happening
		log.LogEvent('Requested ' + pendingAssets + ' assets from cache.');

		// Kick off cache requests for all the assets.
		for (var i = 0; i < assets.length; i++) {

			// We need to capture the value of i, because we're going to return an array with all the tiles in the correct order.
			(function(i) {

				// Kick off a request for this asset
				getTile(assets[i], function(asset) {

					// Add the returned asset to the array
					returnedAssets[i] = asset;

					// We have one less outstanding request
					pendingAssets -= 1;

					// And if they're all done...
					if (pendingAssets === 0) {

						log.LogEvent('All assets retrieved.');

						// Return the request assets.
						callback(returnedAssets);

						// Leave this method.
						return;

					}
	
					// Log that we're still waiting.
					log.LogEvent('Still ' + pendingAssets + ' pending assets from cache.');

				});

			})(i);

		};
	};
	
	////////////////////////////////////////////////////////////
	// Initialize 
	////////////////////////////////////////////////////////////
	var initialize = function(e) {

		// Save the engine reference
		engine = e;

		// Log that network connection has been initialized.
		engine.logger.LogEvent('Initialized cache.');

		// Return that everything worked out okay.
		return true;

	};

	////////////////////////////////////////////////////////////
	// Expose the things we want to expose
	////////////////////////////////////////////////////////////
	return {
		GetEntity: getEntity,
		GetMap: getMap,
		GetMultipleTiles: getMultipleTiles,
		GetTile: getTile,
		Initialize: initialize
	};
};

////////////////////////////////////////////////////////////
// Debug logger object
////////////////////////////////////////////////////////////
var jeldaDebugLogger = function() {

	////////////////////////////////////////////////////////////
	// Variables
	////////////////////////////////////////////////////////////
	var logElement;

	////////////////////////////////////////////////////////////
	// Initialize 
	////////////////////////////////////////////////////////////
	var initialize = function() {

		// Locate and remember the log element.
		logElement = document.getElementById('debug-log');

		// Log that the logger was initialized.
		logEvent('Logger initialized.');

	};

	////////////////////////////////////////////////////////////
	// Write an event to the debug log
	////////////////////////////////////////////////////////////
	var logEvent = function(message) {

		// Create an element to append to the log div.
		var newLog = document.createElement('p');

		// Add some HTML to the element.
		newLog.innerText = '[' + new Date() + '] ' + message;

		// Append the new log to the log element
		logElement.appendChild(newLog);

		// Scroll to the bottom
		logElement.scrollTop = logElement.scrollHeight;

	};

	////////////////////////////////////////////////////////////
	// Expose the things we want to expose
	////////////////////////////////////////////////////////////
	return {
		Initialize: initialize,
		LogEvent: logEvent
	};

};

////////////////////////////////////////////////////////////
// The graphics abstraction layer
////////////////////////////////////////////////////////////
var jeldaGraphicsEngine = function() {

	////////////////////////////////////////////////////////////
	// Variables
	////////////////////////////////////////////////////////////
	var context, dimensions, engine;

	////////////////////////////////////////////////////////////
	// ClearCanvas
	////////////////////////////////////////////////////////////
	var clearCanvas = function() {

		context.clearRect(0, 0, dimensions.width, dimensions.height);

	};

	////////////////////////////////////////////////////////////
	// DrawImage
	////////////////////////////////////////////////////////////
	var drawImage = function(image, x, y, width, height, clipStartX, clipStartY, clipWidth, clipHeight) {

		if (typeof clipStartX !== 'undefined') {
			context.drawImage(image, clipStartX, clipStartY, clipWidth, clipHeight, x, y, width, height);
		} else if (typeof width !== 'undefined') {
			context.drawImage(image, x, y, width, height);
		} else {
			context.drawImage(image, x, y);
		}

	};

	////////////////////////////////////////////////////////////
	// DrawText
	////////////////////////////////////////////////////////////
	var drawText = function(text, font, size, color, x, y, strokeColor, strokeWidth) {

		// Set the context's rendering font
		context.font = size + 'px ' + font;
		context.fillStyle = color;

		// Draw the text
		context.fillText(text, x, y);

		if (strokeColor) {
			context.strokeStyle = strokeColor;
			context.lineWidth = strokeWidth;
			context.strokeText(text, x, y);
		}

	};

	////////////////////////////////////////////////////////////
	// GetDimensions
	////////////////////////////////////////////////////////////
	var getDimensions = function() { return dimensions; };

	////////////////////////////////////////////////////////////
	// Initialize 
	////////////////////////////////////////////////////////////
	var initialize = function(e) {

		var viewport;

		// Save other initialized objects passed in.
		engine = e;

		// Locate the viewport element
		viewport = document.getElementById('viewport');

		// Get the context of the viewport
		try
		{
			// Get the 2d drawing context
			context = viewport.getContext('2d');

		} catch(error) { return false; }

		// Check to make sure we have a valid context
		if (!context.rect) {
			return false;
		}
		
		// Set up the viewport dimensions object
		dimensions = {
			width: context.canvas.width, 
			height: context.canvas.height 
		};

		// Log that everything's golden.
		engine.logger.LogEvent('Initialized graphics context.')

		// Everything is initialized fine.
		return true;

	};

	////////////////////////////////////////////////////////////
	// MeasureText
	////////////////////////////////////////////////////////////
	var measureText = function(text, font, size) {

		// Set the context's rendering font
		context.font = size + 'px ' + font;

		// Return the text measurement object.
		return context.measureText(text);

	};

	////////////////////////////////////////////////////////////
	// Expose the things we want to expose
	////////////////////////////////////////////////////////////
	return {
		ClearCanvas: clearCanvas,
		DrawImage: drawImage,
		DrawText: drawText,
		GetDimensions: getDimensions,
		Initialize: initialize,
		MeasureText: measureText
	};

};

////////////////////////////////////////////////////////////
// Captures input
////////////////////////////////////////////////////////////
var jeldaInput = function() {

	////////////////////////////////////////////////////////////
	// Variables
	////////////////////////////////////////////////////////////
	var engine,
		keyHooks = [],
		keyStates = [];

	////////////////////////////////////////////////////////////
	// handleInputEvent 
	////////////////////////////////////////////////////////////
	var handleInputEvent = function(event) {

		keyStates[event.keyCode] = event.type === 'keydown';

	};

	////////////////////////////////////////////////////////////
	// Initialize 
	////////////////////////////////////////////////////////////
	var initialize = function(e) {

		// Save the engine reference
		engine = e;

		// Initialize the array of key-press states.
		for (var i = 8; i <= 222; i++) {
			keyStates[i] = false;
		}

		// Hook into key up and key down events
		window.onkeyup = handleInputEvent;
		window.onkeydown = handleInputEvent;

		// Log that network connection has been initialized.
		engine.logger.LogEvent('Initialized input manager.');

		// Return that everything worked out okay.
		return true;

	};

	////////////////////////////////////////////////////////////
	// PollKeys 
	////////////////////////////////////////////////////////////
	var pollKeys = function() {

		// Return the states of all the keys
		return keyStates;

	};

	////////////////////////////////////////////////////////////
	// Expose the things we want to expose
	////////////////////////////////////////////////////////////
	return {
		PollKeys: pollKeys,
		Initialize: initialize
	};

};

////////////////////////////////////////////////////////////
// The network connection.
////////////////////////////////////////////////////////////
var jeldaNetworkConnection = function() {

	////////////////////////////////////////////////////////////
	// Variables
	////////////////////////////////////////////////////////////
	var engine;

	////////////////////////////////////////////////////////////
	// GetAsset
	////////////////////////////////////////////////////////////
	var getAsset = function(assetType, assetId, callback) {

		// Build the path to the asset
		var assetPath = '/assets/' + assetType + '/' + assetId + '.js';

		// Request the asset
		makeRequest(assetPath, callback);

	};

	////////////////////////////////////////////////////////////
	// GetMapState	
	////////////////////////////////////////////////////////////
	var getMapState = function(mapId, callback) {

		callback({
			Entities: [
				{
					EntityId: '1234',
					EntityType: 'playerEntity',
					EntityState: {
						X: 50,
						Y: 50
					}
				}
			]
		});

	};

	////////////////////////////////////////////////////////////
	// GetPlayerState	
	////////////////////////////////////////////////////////////
	var getPlayerState = function(callback) {

		/* Debuggery time! For now, we're just going to return a standard object. */
		callback({
			// Entity behavior should take responsibility for making it movable.
			PlayerInfo: {
				// Should be an initialized PlayerEntity at some point.
				Name: 'Player'
			},
			LocationInfo: {
				LocationId: 'home'
			}
		});

	};
	
	////////////////////////////////////////////////////////////
	// Initialize 
	////////////////////////////////////////////////////////////
	var initialize = function(e) {

		// Save the engine reference
		engine = e;

		// Log that network connection has been initialized.
		engine.logger.LogEvent('Initialized network connection.');

		// Return that everything worked out okay.
		return true;

	};

	////////////////////////////////////////////////////////////
	// makeRequest 
	////////////////////////////////////////////////////////////
	var makeRequest = function(path, callback) {

		// Create the XHR object
		var xhr = new XMLHttpRequest();

		// Set up our handler for when it's done.
		xhr.onreadystatechange = function() {

			// Is it ready?
			if (xhr.readyState === 4 && xhr.status === 200) {

				// Turn this into an object.
				// We don't use JSON.parse because we trust the source and need scripts to appear, too.
				callback(objectify(xhr.responseText));

			}

		};

		// Finish configuring and make the request
		xhr.open('GET', path, true);

		xhr.send();

	};

	////////////////////////////////////////////////////////////
	// objectify 
	////////////////////////////////////////////////////////////
	var objectify = function(responseText) {

		return eval('(function() { return ' + responseText + '; })();');

	};

	////////////////////////////////////////////////////////////
	// Expose the things we want to expose
	////////////////////////////////////////////////////////////
	return {
		GetAsset: getAsset,
		GetMapState: getMapState,
		GetPlayerState: getPlayerState,
		Initialize: initialize
	};
};

////////////////////////////////////////////////////////////
// The world manager. This does most of the heavy lifting of
// requesting items through the cache, drawing the world map,
// etcetera.
////////////////////////////////////////////////////////////
var jeldaWorldManager = function() {

	////////////////////////////////////////////////////////////
	// Variables
	////////////////////////////////////////////////////////////
	var engine, map, mapState, state;

	////////////////////////////////////////////////////////////
	// getCurrentMap
	////////////////////////////////////////////////////////////
	var getCurrentMap = function() { return map };

	////////////////////////////////////////////////////////////
	// getMapState
	////////////////////////////////////////////////////////////
	var getMapState = function() { return mapState };

	////////////////////////////////////////////////////////////
	// getState
	////////////////////////////////////////////////////////////
	var getState = function() { return state };

	////////////////////////////////////////////////////////////
	// handleMapUpdate
	////////////////////////////////////////////////////////////
	var handleMapUpdate = function(newState, callback) {

		// To shorten things.
		var log = engine.logger,
			cache = engine.cache;

		// Do we need to load a new map?
		if (typeof state === 'undefined' || state.LocationInfo.LocationId !== newState.LocationInfo.LocationId) {

			// Get the map from the cache
			engine.cache.GetMap(newState.LocationInfo.LocationId, function(newMap) {

				// First, save the map locally.
				map = newMap;

				// Log that we got it, and some other data.
				log.LogEvent('Loaded map ' + map.Metadata.Id + ' via cache.');
				log.LogEvent('Need ' + map.TileAssets.length + ' tile assets to finish map load.');

				// Request those assets that we need.
				engine.cache.GetMultipleTiles(map.TileAssets, function(tileAssets) {

					// Overwrite the primitive list of tile assets with our retrieved assets.
					map.TileAssets = tileAssets;

					// Loaded all the map assets. We're good to go from here on out.
					callback(true);

				});

			});

		} else {

			// Nothing to do!
			callback(false);

		}

	};

	////////////////////////////////////////////////////////////
	// handlePlayerStateChange 
	////////////////////////////////////////////////////////////
	var handlePlayerStateChange = function(newState, callback) {

		// TODO: Clean up old state, dispose all items.

		// First, did we jump maps?
		handleMapUpdate(newState, function(didChangeMaps) {

			// We're done. Save the state as the new current state...
			state = newState;

			// Log the change.
			engine.logger.LogEvent('Player state updated.');

			// If we changed maps, we need to sync map state with the new region.
			if (didChangeMaps) { 

				// Log that we changed maps.
				engine.logger.LogEvent('NEW REGION - Must sync map state..');

				// Sync state with the new map.
				syncMapState(callback);

			} else {

				// ...And callback.
				callback();

			}

		});

	};
	
	////////////////////////////////////////////////////////////
	// Initialize 
	////////////////////////////////////////////////////////////
	var initialize = function(e, callback) {

		// Save the engine reference
		engine = e;

		// Get the player's state.
		engine.network.GetPlayerState(function(playerState) {

			// Log that network connection has been initialized.
			engine.logger.LogEvent('Got player state.');

			// Return that everything worked out okay.
			handlePlayerStateChange(playerState, function() {

				// Call the callback.
				callback(true);

			});

		});

	};


	////////////////////////////////////////////////////////////
	// initializeEntity
	////////////////////////////////////////////////////////////
	var initializeEntity = function(entity, callback) {

		// Get the behavior from the cache
		engine.cache.GetEntity(entity.EntityType, function(entityAsset) {

			// First, initialize the entity.
			var finishedEntity = new entityAsset(engine);

			// Now, assign it its ID.
			finishedEntity.EntityId = entity.EntityId

			// TODO: Preload all necessary graphics assets.

			// Set up entity state.
			for (var stateMember in entity.EntityState) {

				// No inherited members
				if (!entity.EntityState.hasOwnProperty(stateMember)) {
					return;
				}

				// Set the state on this member
				finishedEntity[stateMember] = entity.EntityState[stateMember];

			}

			// Initialize the entity, if there's initialization to be done, now that it has a state.
			if (typeof finishedEntity.Initialize === 'function') {

				finishedEntity.Initialize();

			}

			// Call the callback
			callback(finishedEntity);

		});

	};

	////////////////////////////////////////////////////////////
	// processEntityStates 
	////////////////////////////////////////////////////////////
	var processEntityStates = function(delta) {

		var entities = mapState.Entities;

		// Iterate through all the entities
		for (var i = 0; i < entities.length; i++) {

			// If it's a renderable entity...
			if (typeof entities[i].DoProcessing === 'function') {

				// Render it.
				entities[i].DoProcessing(delta);

			}

		}

	};

	////////////////////////////////////////////////////////////
	// RunWorld
	////////////////////////////////////////////////////////////
	var runWorld = function() {

		var log = engine.logger, running = true, lastFrameStart = new Date().getTime();

		// Here's our game loop
		var gameLoop = function() {

			var startTime = new Date().getTime(), delta = startTime - lastFrameStart;

			// Limit frame rates to 60fps
			if (delta <= (1000 / 60)) {

				// Delay briefly.
				setTimeout(gameLoop, 1);

				// Don't finish this iteration.
				return;

			}

			// TODO: Exit more gracefully
			if (running === false) { return; }

			// Let every entity do its processing
			processEntityStates(delta);

			// Draw the world
			engine.worldRenderer.DrawFrame();

			// Calculate framerate.
			var frameRate = Math.floor(1000 / (startTime - lastFrameStart));

			// Print the framerate
			engine.graphics.DrawText(frameRate + 'fps', 'Arial', 12, 'white', 10, 20); 

			// Allow processing, then come back.
			setTimeout(gameLoop, 0);

			// Store the time we started rendering this.
			lastFrameStart = startTime;

		};

		// Log that we entered the world rendering loop.
		log.LogEvent('Entered game loop.');

		// Actually start the game loop.
		gameLoop();

	};

	////////////////////////////////////////////////////////////
	// syncMapState
	////////////////////////////////////////////////////////////
	var syncMapState = function(callback) {

		// Log what's about to happen
		engine.logger.LogEvent('Requesting map state.');

		// First thing's first - let's request the map state.
		engine.network.GetMapState(state.LocationInfo.LocationId, function(newMapState) {

			var entitiesToInitialize = newMapState.Entities.length;

			// Dump out if there's no initializing to do
			if (entitiesToInitialize === 0) {
				callback();
			}

			// Now that we have it, let's initialize all the entities.
			for (var i = 0; i < newMapState.Entities.length; i++) {

				(function(i) {

					// Convert the entity descriptin into something we can work with.
					initializeEntity(newMapState.Entities[i], function(entity) {

						// Actually assign it.
						newMapState.Entities[i] = entity;

						// If we have no entities left to initialize, then we're good.
						entitiesToInitialize -= 1;

						// We have no entities left to initialize?
						if (entitiesToInitialize === 0) {

							// Save the new map state as the current map state.
							mapState = newMapState;

							// Finally, we're done. Call back.
							callback();

							// And end here.
							return;

						};

						// 
						engine.logger.LogEvent(entitiesToInitialize + ' entities remain requiring initialization.');

					});

				})(i);

			}

		});

	};

	////////////////////////////////////////////////////////////
	// Expose the things we want to expose
	////////////////////////////////////////////////////////////
	return {
		GetCurrentMap: getCurrentMap,
		GetMapState: getMapState,
		GetState: getState,
		Initialize: initialize,
		RunWorld: runWorld
	};
};

////////////////////////////////////////////////////////////
// Debug logger object
////////////////////////////////////////////////////////////
var jeldaWorldRenderer = function() {

	////////////////////////////////////////////////////////////
	// Variables
	////////////////////////////////////////////////////////////
	var camera = {
			X: 0,
			Y: 0
		},
		engine;

	////////////////////////////////////////////////////////////
	// DrawFrame
	////////////////////////////////////////////////////////////
	var drawFrame = function() {

		// Clear the display.
		engine.graphics.ClearCanvas();

		// First, draw terrain (the map.)
		drawTerrain();

		// Now, draw entities.
		drawEntities();

	};

	////////////////////////////////////////////////////////////
	// drawEntities
	////////////////////////////////////////////////////////////
	var drawEntities = function() {

		var entities = engine.worldManager.GetMapState().Entities,
			graphics = engine.graphics;

		// TODO: Clip offscreen entities

		// Iterate through all the entities
		for (var i = 0; i < entities.length; i++) {

			// If it's a renderable entity...
			if (typeof entities[i].Draw === 'function') {

				// Render it.
				entities[i].Draw(graphics, { X: entities[i].X - camera.X, Y: entities[i].Y - camera.Y });

			}

		}

	};

	////////////////////////////////////////////////////////////
	// drawTerrain
	////////////////////////////////////////////////////////////
	var drawTerrain = function() {

		// Get a reference to the map and all its associated assets.
		var map = engine.worldManager.GetCurrentMap(),
			graphics = engine.graphics,
			currentTile;

		/* This is ALL debuggery right now, though probably represents what'll happen at some point. */
		for (var x = 0; x < map.Dimensions.Width; x++) {
			for (var y = 0; y < map.Dimensions.Height; y++) {
				
				// Store off the current tile to make this more readable.
				currentTile = map.MapData[y][x];

				// Paint the tile.
				graphics.DrawImage(map.TileAssets[currentTile].ImageData, (32 * x) - camera.X, (32 * y) - camera.Y);

			}
		}

	};

	////////////////////////////////////////////////////////////
	// Initialize 
	////////////////////////////////////////////////////////////
	var initialize = function(e) {

		// Locate and remember the log element.
		engine = e;

		// Log that the logger was initialized.
		e.logger.LogEvent('World renderer initialized.');

		// Return that everything worked out!
		return true;

	};

	////////////////////////////////////////////////////////////
	// setCamera 
	////////////////////////////////////////////////////////////
	var setCamera = function(x, y) {

		camera = { X: x, Y: y };

	};

	////////////////////////////////////////////////////////////
	// Expose the things we want to expose
	////////////////////////////////////////////////////////////
	return {
		DrawFrame: drawFrame,
		Initialize: initialize,
		SetCamera: setCamera
	};

};

////////////////////////////////////////////////////////////
// The actual client application
////////////////////////////////////////////////////////////
var jeldaClient = (function() {

	////////////////////////////////////////////////////////////
	// Set up our engine object
	////////////////////////////////////////////////////////////
	var engine = {
		cache: new jeldaCache(),
		graphics: new jeldaGraphicsEngine(),
		input: new jeldaInput(),
		logger: new jeldaDebugLogger(),
		network: new jeldaNetworkConnection(),
		worldManager: new jeldaWorldManager(),
		worldRenderer: new jeldaWorldRenderer()
	};

	////////////////////////////////////////////////////////////
	// showLoading
	////////////////////////////////////////////////////////////
	var showLoadingMessage = function(loadingText) {

		var g = engine.graphics,
			/* Debuggery. This should be a neat modal window entity. */
			messageFont = 'Arial',
			messageFontSize = 50,
			messageText = 'Now loading...',
			messageDimensions = g.MeasureText(messageText, messageFont, messageFontSize),
			/* End debuggery. */
			stepTextFontSize = 20,
			stepTextDimensions = g.MeasureText(loadingText, messageFont, stepTextFontSize),
			viewportDimensions = g.GetDimensions(),
			msgX = viewportDimensions.width / 2 - messageDimensions.width / 2,
			msgY = viewportDimensions.height / 2 - messageFontSize / 2,
			stepX = viewportDimensions.width / 2 - stepTextDimensions.width / 2;

		/* Debuggery. Again, this would be a dialog entity that would redraw in the draw loop. */
		g.ClearCanvas();

		// Draw some loading text
		g.DrawText(messageText, messageFont, messageFontSize, '#FFFFFF', msgX, msgY, '#555', 2)

		// And draw the loading message.
		g.DrawText(loadingText, messageFont, stepTextFontSize, '#DDDDDD', stepX, msgY + messageFontSize)

	};

	////////////////////////////////////////////////////////////
	// Return the initialization method
	////////////////////////////////////////////////////////////
	return function() {
	
		// First, initialize the logger.
		engine.logger.Initialize();

		// Now, initialize the graphics layer.
		if(!engine.graphics.Initialize(engine)) {
			engine.logger.LogEvent('Failed to initialize graphics context!');
			return;
		}

		// We can show something useful on the screen, so let's do it.
		showLoadingMessage('Starting things up...');

		// Get network things ready.
		if (!engine.network.Initialize(engine)) {
			engine.logger.logEvent('Failed to initialize network connection!');
			return;
		}

		// Get network things ready.
		if (!engine.input.Initialize(engine)) {
			engine.logger.logEvent('Failed to initialize network connection!');
			return;
		}

		// Initialize the cache, as it needs to be ready for the world manager to function.
		if (!engine.cache.Initialize(engine)) {
			engine.logger.logEvent('Failed to initialize cache!');
			return;
		}

		// We can show something useful on the screen, so let's do it.
		showLoadingMessage('Initializing world...');

		// Time to initialize the world manager. This won't always happen here, but for now, it does.
		// We have to do this async, because it's going to rely on a lot of async caching.
		engine.worldManager.Initialize(engine, function(success) {
			
			// Oh no, an ERROR!
			if (!success) {
				engine.logger.logEvent('Failed to initialize world manager!')
				return;
			}

			// We can show something useful on the screen, so let's do it.
			showLoadingMessage('World loaded! Starting rendering engine...');

			// Initialize the renderer.
			if(!engine.worldRenderer.Initialize(engine)) {
				engine.logger.logEvent('Failed to initialize world renderer!')
				return;
			};

			// Kick off the game loop.
			engine.worldManager.RunWorld();

		});
	}

})();

////////////////////////////////////////////////////////////
// Initialize the app.
////////////////////////////////////////////////////////////
window.onload = function() {
	document.client = new jeldaClient(); 
};