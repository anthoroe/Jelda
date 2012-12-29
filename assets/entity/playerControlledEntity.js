function(engine) {

	var speed = 200,
		viewportDimensions = engine.graphics.GetDimensions(),
		nameplateFont = 'bold 16px Arial';

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
	// VelocityX
	////////////////////////////////////////////////////////////
	this.VelocityX = 0;

	////////////////////////////////////////////////////////////
	// VelocityY
	////////////////////////////////////////////////////////////
	this.VelocityY = 0;

	////////////////////////////////////////////////////////////
	// DisplayName
	////////////////////////////////////////////////////////////
	this.DisplayName = 'Player';

	////////////////////////////////////////////////////////////
	// DoProcessing
	////////////////////////////////////////////////////////////
	this.DoProcessing = function(delta) {

		// Key states contains all the important things.
		var change = delta * (speed / 1000), 
			keyStates = engine.input.PollKeys();

		// Reset velocities
		var velocityX = 0, velocityY = 0;

		// Figure out our velocities in either direction. 
		if (keyStates[37] === true) {
			this.X -= change;
			velocityX -= speed;
		}
		if (keyStates[39] === true) {
			this.X += change;
			velocityX += speed;
		}
		if (keyStates[38] === true) {
			this.Y -= change;
			velocityY -= speed;
		}
		if (keyStates[40] === true) {
			this.Y += change;
			velocityY  += speed;
		}

		// Do we need to update the server?
		if (velocityX !== this.VelocityX || velocityY !== this.VelocityY) {

			// Update the velocities
			this.VelocityX = velocityX;
			this.VelocityY = velocityY;

			// Update the server
			engine.network.SendEntityStateUpdate(this);

		}

		// Set the camera position to center on us
		engine.worldRenderer.SetCamera(this.X - viewportDimensions.width / 2, this.Y - viewportDimensions.height / 2);
	};

	////////////////////////////////////////////////////////////
	// Draw
	////////////////////////////////////////////////////////////
	this.Draw = function(g, position) {

		var nameWidth, nameX, nameY;

		// Just draw an image at the right place, for now.
		g.DrawImage(image, position.X, position.Y);

		// Figure out the width of the name
		nameplateSize = g.MeasureText(this.DisplayName, nameplateFont);
		nameX = position.X + (image.width / 2) - (nameplateSize.width / 2);
		nameY = position.Y + image.height + 18;

		// Draw the nameplate.
		g.DrawText(this.DisplayName, nameplateFont, 'black', nameX, nameY, 'white', 2);

	};

	////////////////////////////////////////////////////////////
	// GetState
	////////////////////////////////////////////////////////////
	this.GetClientState = function() {

		return {
			X: this.X,
			Y: this.Y,
			VelocityX: this.VelocityX,
			VelocityY: this.VelocityY
		}

	}

	////////////////////////////////////////////////////////////
	// Initialize
	////////////////////////////////////////////////////////////
	this.Initialize = function() {

		// Nothing, for now.

	};

	// TODO: initialize resources in entity setup
	image.src = 'assets/graphics/entities/player/player.png';

};