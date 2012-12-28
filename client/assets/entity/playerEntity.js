function(engine) {

	var speed = 200,
		viewportDimensions = engine.graphics.GetDimensions();

	// Debug
	var image = new Image();

	////////////////////////////////////////////////////////////
	// X
	////////////////////////////////////////////////////////////
	this.X = 0;

	////////////////////////////////////////////////////////////
	// Y
	////////////////////////////////////////////////////////////
	this.Y = 0;

	////////////////////////////////////////////////////////////
	// DoProcessing
	////////////////////////////////////////////////////////////
	this.DoProcessing = function(delta) {

		// Key states contains all the important things.
		var change = delta * (speed / 1000), 
			keyStates = engine.input.PollKeys();

		// Figure out our velocities in either direction. 
		if (keyStates[37] === true) {
			this.X -= change;
		}
		if (keyStates[39] === true) {
			this.X += change;
		}
		if (keyStates[38] === true) {
			this.Y -= change;
		}
		if (keyStates[40] === true) {
			this.Y += change;
		}

		// Set the camera position to center on us
		engine.worldRenderer.SetCamera(this.X - viewportDimensions.width / 2, this.Y - viewportDimensions.height / 2);
	};

	////////////////////////////////////////////////////////////
	// Draw
	////////////////////////////////////////////////////////////
	this.Draw = function(g, position) {

		// Just draw an image at the right place, for now.
		g.DrawImage(image, position.X, position.Y);

	};

	////////////////////////////////////////////////////////////
	// Initialize
	////////////////////////////////////////////////////////////
	this.Initialize = function() {

		// Nothing, for now.

	};

	////////////////////////////////////////////////////////////
	// SetPosition
	////////////////////////////////////////////////////////////
	this.SetPosition = function(xPos, yPos) {

		x = xPos;
		y = yPos;

	};

	// TODO: initialize resources in entity setup
	image.src = 'res/entities/player/player.png';

};