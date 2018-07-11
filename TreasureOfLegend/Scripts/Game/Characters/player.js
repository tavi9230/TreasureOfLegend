import { Controls } from 'Game/Helpers/controls';

export const Player = function (x, y, speed, playerWidth, playerHeight, images, imageWidth, imageHeight) {
	// (x, y) = center of object
	// ATTENTION:
	// it represents the player position on the world(room), not the canvas position
	this.x = x;
	this.y = y;

	// move speed in pixels per second
	this.speed = speed || 200;

	// render properties
	this.imageWidth = imageWidth || 100;
	this.playerWidth = playerWidth || 50;
	this.imageHeight = imageHeight || 100;
	this.playerHeight = playerHeight || 50;
	this.images = images;

	this.left = this.x;
	this.right = this.x + this.playerWidth;
	this.top = this.y;
	this.bottom = this.y + this.playerHeight;

	this.controls = new Controls();

	this.update = function (worldWidth, worldHeight) {
		// parameter step is the time between frames ( in seconds )

		// check controls and move the player accordingly
		if (this.controls.keys.left) {
			this.x -= this.speed * Constants.STEP;
		}
		if (this.controls.keys.up) {
			this.y -= this.speed * Constants.STEP;
		}
		if (this.controls.keys.right) {
			this.x += this.speed * Constants.STEP;
		}
		if (this.controls.keys.down) {
			this.y += this.speed * Constants.STEP;
		}

		this.left = this.x;
		this.right = this.x + this.playerWidth;
		this.top = this.y;
		this.bottom = this.y + this.playerHeight;
		this._checkPlayerBoundary(worldWidth, worldHeight);
	};

	this.draw = function (context, xView, yView) {
		context.save();
		// before draw we need to convert player world's position to canvas position
		context.drawImage(this.images[9], 0, 0, 512, 512, (this.x - this.imageWidth / 2) - xView, (this.y - this.imageHeight / 2) - yView, this.imageWidth, this.imageHeight);
		context.restore();
	};

	this.removeControls = function () {
		this.controls.removeControls();
	};

	this._checkPlayerBoundary = function (worldWidth, worldHeight) {
		// don't let player leave the world's boundary
		if (this.x - this.imageWidth / 2 < 0) {
			this.x = this.imageWidth / 2;
		}
		if (this.y + this.playerHeight / 2 < 0) {
			this.y = -1 * this.playerHeight / 2;
		}
		if (this.x + this.imageWidth / 2 > worldWidth) {
			this.x = worldWidth - this.imageWidth / 2;
		}
		if (this.y + this.imageHeight / 2 > worldHeight) {
			this.y = worldHeight - this.imageHeight / 2;
		}
	};
};