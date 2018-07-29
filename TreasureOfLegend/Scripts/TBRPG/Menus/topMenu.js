import { Controls } from 'TBRPG/Helpers/controls';

export const Player = function (x, y, speed, playerWidth, playerHeight, images, imageWidth, imageHeight) {
	//----------------------  VARIABLES  ----------------------
	// (x, y) = center of object
	// ATTENTION:
	// it represents the player position on the world(room), not the canvas position
	this.x = x;
	this.y = y;

	this.images = images;

	// render properties
	this.imageWidth = imageWidth || 100;
	this.playerWidth = playerWidth || 50;
	this.imageHeight = imageHeight || 100;
	this.playerHeight = playerHeight || 50;

	this.left = this.x;
	this.right = this.x + this.playerWidth;
	this.top = this.y;
	this.bottom = this.y + this.playerHeight;

	this.controls = new Controls();

	//----------------------  ATTRIBUTES  ----------------------
	this.speed = 6;
	this.might = 5;

	//----------------------  METHODS  ----------------------
	this.update = function (x, y) {
		this.x = x;
		this.y = y;
	};

	this.draw = function (context, xView, yView) {
		context.save();
		// before draw we need to convert player world's position to canvas position
		context.drawImage(this.images[9], 0, 0, 512, 512, (this.x - this.imageWidth / 2) - xView, (this.y - this.imageHeight / 2) - yView, this.imageWidth, this.imageHeight);
		context.restore();
	};
};