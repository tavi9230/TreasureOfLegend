export const Component = function (ctx, width, height, color, x, y) {
	this.ctx = ctx;
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.speedX = 0;
	this.speedY = 0;
	this.color = color;
	this.update = function () {
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(this.x, this.y, this.width, this.height);
	};
	this.newPosition = function () {
		this.x += this.speedX;
		this.y += this.speedY;
	};
};