export const Wall = function (x, y, images, imageWidth, imageHeight, objectWidth, objectHeight) {
	// (x, y) = center of object
	// ATTENTION:
	// it represents the object position on the world(room), not the canvas position
	this.x = x;
	this.y = y;
	this.imageWidth = imageWidth;
	this.objectWidth = objectWidth;
	this.imageHeight = imageHeight;
	this.objectHeight = objectHeight;
	this.images = images;

	this.left = this.x;
	this.right = this.x + this.objectWidth;
	this.top = this.y;
	this.bottom = this.y + this.objectHeight;

	this.draw = function (context) {
		context.save();
		context.drawImage(this.images[1], 0, 12, 16, 16, this.x, this.y, this.width, this.height);
		context.restore();
	};
};