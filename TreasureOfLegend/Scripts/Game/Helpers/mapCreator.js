// TODO: load level images here via an id parameter or something
import { Wall } from 'Game/Objects/wall';

export const MapCreator = function (ctx, width, height, images) {
	this.ctx = ctx;
	// map dimensions
	this.width = width;
	this.height = height;
	this.images = images;
    this.objects = [];

	// map texture
	this.image = null;
	// generate an example of a large map
	this.generate = function () {
		var ctx = document.createElement('canvas').getContext('2d');
		ctx.canvas.width = this.width;
		ctx.canvas.height = this.height;

		var rows = ~~(this.width / 100) + 1;
		var columns = ~~(this.height / 100) + 1;

		ctx.save();
		for (var x = 0, i = 0; i < rows; x += 100, i++) {
			ctx.beginPath();
			for (var y = 0, j = 0; j < columns; y += 100, j++) {
				//ctx.rect(x, y, 40, 40);
				ctx.drawImage(this.images[7], 0, 0, 512, 512, x, y, 100, 100);
			}
			ctx.closePath();
		}
	    this.generateObjects(ctx);
		ctx.restore();

		// store the generate map as this image texture
		this.image = new Image();
		this.image.src = ctx.canvas.toDataURL('image/png');

		// clear context
		ctx = null;
	};

	this.generateObjects = function(ctx) {
	    ctx.drawImage(this.images[10], 0, 0, 512, 512, 100, 0, 100, 100);
        this.objects.push(new Wall(100, 0, this.images, 100, 100, 100, 100));
    };

	// draw the map adjusted to camera
	this.draw = function (context, xCameraView, yCameraView) {
		// xCameraView, yCameraView: offset point to crop the image
		// dx, dy: location on canvas to draw the croped image
		// canvasWidth, canvasHeight: dimensions of cropped image
		// destinationCanvasWidth, destinationCanvasHeight: match destination with source to not scale the image
		var dx = 0,
			dy = 0,
			canvasWidth = context.canvas.width,
			canvasHeight = context.canvas.height,
			destinationCanvasWidth = context.canvas.width,
			destinationCanvasHeight = context.canvas.height;

		// if cropped image is smaller than canvas we need to change the source dimensions
		if (this.image.width - xCameraView < canvasWidth) {
			canvasWidth = this.image.width - xCameraView;
		}
		if (this.image.height - yCameraView < canvasHeight) {
			canvasHeight = this.image.height - yCameraView;
		}

		context.drawImage(this.image, xCameraView, yCameraView, canvasWidth, canvasHeight, dx, dy, destinationCanvasWidth, destinationCanvasHeight);
	};

	this.generate();
};