// TODO: load level images here via an id parameter or something
import { Wall } from 'Game/Objects/wall';

export const MapCreator = function (ctx, width, height, images) {
	this.ctx = ctx;
	// map dimensions
	this.width = width;
	this.height = height;
	this.images = images;
	this.objects = {
	    wallTop: [],
        wallLeft: []
	};

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
			//ctx.beginPath();
			for (var y = 0, j = 0; j < columns; y += 100, j++) {
				//ctx.rect(x, y, 40, 40);
			    ctx.drawImage(this.images[1], 64, 128, 15, 15, x, y, 100, 100);
			}
			//ctx.closePath();
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
        // walls top
	    ctx.drawImage(this.images[1], 0, 12, 30, 15, 100, 0, 100, 100);
	    this.objects.wallTop.push(new Wall(100, 0, this.images, 100, 100, 100, 100));
	    ctx.drawImage(this.images[1], 0, 12, 30, 15, 200, 0, 100, 100);
	    this.objects.wallTop.push(new Wall(200, 0, this.images, 100, 100, 100, 100));
	    ctx.drawImage(this.images[1], 0, 12, 30, 15, 300, 0, 100, 100);
	    this.objects.wallTop.push(new Wall(300, 0, this.images, 100, 100, 100, 100));
	    ctx.drawImage(this.images[1], 0, 12, 30, 15, 400, 0, 100, 100);
	    this.objects.wallTop.push(new Wall(400, 0, this.images, 100, 100, 100, 100));
	    ctx.drawImage(this.images[1], 0, 12, 30, 15, 500, 0, 100, 100);
	    this.objects.wallTop.push(new Wall(500, 0, this.images, 100, 100, 100, 100));
	    ctx.drawImage(this.images[1], 0, 12, 30, 15, 600, 0, 100, 100);
	    this.objects.wallTop.push(new Wall(600, 0, this.images, 100, 100, 100, 100));

	    // walls left
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 100, 0, 25, 100);
	    this.objects.wallLeft.push(new Wall(100, 0, this.images, 100, 100, 25, 100));
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 100, 100, 25, 100);
	    this.objects.wallLeft.push(new Wall(100, 100, this.images, 100, 100, 25, 100));
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 100, 200, 25, 100);
	    this.objects.wallLeft.push(new Wall(100, 200, this.images, 100, 100, 25, 100));
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 100, 300, 25, 100);
	    this.objects.wallLeft.push(new Wall(100, 300, this.images, 100, 100, 25, 100));
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 100, 400, 25, 100);
	    this.objects.wallLeft.push(new Wall(100, 400, this.images, 100, 100, 25, 100));
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 100, 500, 25, 100);
	    this.objects.wallLeft.push(new Wall(100, 500, this.images, 100, 100, 25, 100));
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 100, 600, 25, 100);
	    this.objects.wallLeft.push(new Wall(100, 600, this.images, 100, 100, 25, 100));

	    // walls right
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 675, 0, 25, 100);
	    this.objects.wallLeft.push(new Wall(675, 0, this.images, 100, 100, 25, 100));
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 675, 100, 25, 100);
	    this.objects.wallLeft.push(new Wall(675, 100, this.images, 100, 100, 25, 100));
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 675, 200, 25, 100);
	    this.objects.wallLeft.push(new Wall(675, 200, this.images, 100, 100, 25, 100));
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 675, 300, 25, 100);
	    this.objects.wallLeft.push(new Wall(675, 300, this.images, 100, 100, 25, 100));
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 675, 400, 25, 100);
	    this.objects.wallLeft.push(new Wall(675, 400, this.images, 100, 100, 25, 100));
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 675, 500, 25, 100);
	    this.objects.wallLeft.push(new Wall(675, 500, this.images, 100, 100, 25, 100));
	    ctx.drawImage(this.images[0], 11, 19, 4, 15, 675, 600, 25, 100);
	    this.objects.wallLeft.push(new Wall(675, 600, this.images, 100, 100, 25, 100));

	    // walls bottom
	    ctx.drawImage(this.images[1], 0, 12, 30, 15, 100, 600, 100, 100);
	    this.objects.wallTop.push(new Wall(100, 600, this.images, 100, 100, 100, 100));
	    ctx.drawImage(this.images[1], 0, 12, 30, 15, 200, 600, 100, 100);
	    this.objects.wallTop.push(new Wall(200, 600, this.images, 100, 100, 100, 100));
	    ctx.drawImage(this.images[1], 0, 12, 30, 15, 300, 600, 100, 100);
	    this.objects.wallTop.push(new Wall(300, 600, this.images, 100, 100, 100, 100));
	    ctx.drawImage(this.images[1], 0, 12, 30, 15, 400, 600, 100, 100);
	    this.objects.wallTop.push(new Wall(400, 600, this.images, 100, 100, 100, 100));
	    ctx.drawImage(this.images[1], 0, 12, 30, 15, 500, 600, 100, 100);
	    this.objects.wallTop.push(new Wall(500, 600, this.images, 100, 100, 100, 100));
	    ctx.drawImage(this.images[1], 0, 12, 30, 15, 600, 600, 100, 100);
	    this.objects.wallTop.push(new Wall(600, 600, this.images, 100, 100, 100, 100));
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