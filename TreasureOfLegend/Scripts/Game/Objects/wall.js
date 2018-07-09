export const Wall = function (x, y, images, height, width, wHeight, wWidth) {
	// (x, y) = center of object
	// ATTENTION:
	// it represents the object position on the world(room), not the canvas position
	this.x = x;
	this.y = y;
    this.collisionDetection = {
        bottom: true
    };

	// move speed in pixels per second
	this.speed = 200;

	// render properties
	this.width = width;
	this.wWidth = wWidth;
	this.height = height;
	this.wHeight = wHeight;
	this.images = images;

	this.draw = function (context) {
		context.save();
		context.fillStyle = 'green';
		context.drawImage(this.images[10], 0, 0, 512, 512, this.x, this.y, this.width, this.height);
		context.restore();
	};
};