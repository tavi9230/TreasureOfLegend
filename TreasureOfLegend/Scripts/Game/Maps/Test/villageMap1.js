export const VillageMap1 = function (ctx, canvas, imageList) {
	//----------------------  VARIABLES  ----------------------
	this.mapX = 0;
	this.mapY = 0;
	this.ctx = ctx;
	this.canvas = canvas;
	this.imageList = imageList;
	this.worldWidth = this.canvas.width * 3;
	this.worldHeight = this.canvas.height * 3;
	//----------------------  METHODS  ----------------------
	this.updateMap = function () {
		for (var x = this.mapX; x < this.worldWidth; x += 200) {
			for (var y = this.mapY; y < this.worldHeight; y += 200) {
				if (x < this.canvas.width && y < this.canvas.height) {
					this.ctx.drawImage(this.imageList[1], x, y);
				}
			}
		}
	};
	this.updateCamera = function () {
		if (this.mapX < 0) {
			this.mapX = 0;
		}
		if (this.mapX > this.worldWidth) {
			this.mapX = this.worldWidth;
		}
		if (this.mapY < 0) {
			this.mapY = 0;
		}
		if (this.mapY > this.worldHeight) {
			this.mapY = this.worldHeight;
		}
		this.ctx.translate(this.mapX, this.mapY);
	};
	//----------------------  OTHER  ----------------------
};