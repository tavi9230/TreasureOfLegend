import { Rectangle } from 'TBRPG/Helpers/rectangle';

export const Camera = function (speed, xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight) {
	//----------------------  VARIABLES  ----------------------
	// camera speed
	this.speed = speed || 200;

	// position of camera (left-top coordinate)
	this.xView = xView || 0;
	this.yView = yView || 0;

	// viewport dimensions
	this.wView = canvasWidth;
	this.hView = canvasHeight;

	// rectangle that represents the viewport
	this.viewportRect = new Rectangle(this.xView, this.yView, this.wView, this.hView);

	// rectangle that represents the world's boundary (room's boundary)
	this.worldRect = new Rectangle(0, 0, worldWidth, worldHeight);

	//----------------------  METHODS  ----------------------
	this.update = function (step) {
		if (Controls.keys.left) {
			this.xView -= this.speed * step;
		}
		if (Controls.keys.up) {
			this.yView -= this.speed * step;
		}
		if (Controls.keys.right) {
			this.xView += this.speed * step;
		}
		if (Controls.keys.down) {
			this.yView += this.speed * step;
		}

		this._checkCameraBoundary();
	};

	this._checkCameraBoundary = function () {
		// update viewportRect
		this.viewportRect.set(this.xView, this.yView);

		// don't let camera leaves the world's boundary
		if (!this.viewportRect.within(this.worldRect)) {
			if (this.viewportRect.left < this.worldRect.left)
				this.xView = this.worldRect.left;
			if (this.viewportRect.top < this.worldRect.top)
				this.yView = this.worldRect.top;
			if (this.viewportRect.right > this.worldRect.right)
				this.xView = this.worldRect.right - this.wView;
			if (this.viewportRect.bottom > this.worldRect.bottom)
				this.yView = this.worldRect.bottom - this.hView;
		}
	};
};