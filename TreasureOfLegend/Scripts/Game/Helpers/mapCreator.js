export const MapCreator = function (ctx, width, height, images) {
	this.ctx = ctx;
	// map dimensions
	this.width = width;
	this.height = height;
	this.images = images;

	// map texture
	this.image = null;
	// generate an example of a large map
	this.generate = function () {
		var ctx = document.createElement('canvas').getContext('2d');
		ctx.canvas.width = this.width;
		ctx.canvas.height = this.height;

		//var rows = ~~(this.width / 44) + 1;
		//var columns = ~~(this.height / 44) + 1;
		var rows = ~~(this.width / 60) + 1;
		var columns = ~~(this.height / 60) + 1;

		var color = 'red';
		ctx.save();
		ctx.fillStyle = 'red';
		for (var x = 0, i = 0; i < rows; x += 20, i++) {
			ctx.beginPath();
			for (var y = 0, j = 0; j < columns; y += 20, j++) {
				//ctx.rect(x, y, 40, 40);
				ctx.drawImage(this.images[5], 0, 0, 127, 127, x, y, 50, 50);
			}
			color = (color === 'red' ? 'blue' : 'red');
			ctx.fillStyle = color;
			ctx.fill();
			ctx.closePath();
		}
		ctx.restore();

		// store the generate map as this image texture
		this.image = new Image();
		this.image.src = ctx.canvas.toDataURL('image/png');

		// clear context
		ctx = null;
	};

	// draw the map adjusted to camera
	this.draw = function (context, xCameraView, yCameraView) {
		// easiest way: draw the entire map changing only the destination coordinate in canvas
		// canvas will cull the image by itself (no performance gaps -> in hardware accelerated environments, at least)
		//context.drawImage(this.image, 0, 0, this.image.width, this.image.height, -xCameraView, -yCameraView, this.image.width, this.image.height);

		// didactic way:

		var sx, sy, dx, dy;
		var sWidth, sHeight, dWidth, dHeight;

		// offset point to crop the image
		sx = xCameraView;
		sy = yCameraView;

		// dimensions of cropped image
		sWidth = context.canvas.width;
		sHeight = context.canvas.height;

		// if cropped image is smaller than canvas we need to change the source dimensions
		if (this.image.width - sx < sWidth) {
			sWidth = this.image.width - sx;
		}
		if (this.image.height - sy < sHeight) {
			sHeight = this.image.height - sy;
		}

		// location on canvas to draw the croped image
		dx = 0;
		dy = 0;
		// match destination with source to not scale the image
		dWidth = sWidth;
		dHeight = sHeight;

		context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
	};
};