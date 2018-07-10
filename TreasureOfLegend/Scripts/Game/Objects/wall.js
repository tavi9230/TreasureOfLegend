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

	this.draw = function (context) {
		context.save();
		context.drawImage(this.images[10], 0, 0, 512, 512, this.x, this.y, this.width, this.height);
		context.restore();
	};
};