import { Rectangle } from 'Game/Helpers/rectangle';

export const Camera = function (xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight) {
	this.AXISDIRECTIONS = {
		NONE: 'none',
		HORIZONTAL: 'horizontal',
		VERTICAL: 'vertical',
		BOTH: 'both'
	};
	// position of camera (left-top coordinate)
	this.xView = xView || 0;
	this.yView = yView || 0;

	// distance from followed object to border before camera starts move
	// min distance to horizontal borders
	this.xDeadZone = 0;
	// min distance to vertical borders
	this.yDeadZone = 0;

	// viewport dimensions
	this.wView = canvasWidth;
	this.hView = canvasHeight;

	// allow camera to move in vertical and horizontal axis
	this.axis = this.AXISDIRECTIONS.BOTH;

	// object that should be followed
	this.followed = null;

	// rectangle that represents the viewport
	this.viewportRect = new Rectangle(this.xView, this.yView, this.wView, this.hView);

	// rectangle that represents the world's boundary (room's boundary)
	this.worldRect = new Rectangle(0, 0, worldWidth, worldHeight);

	this.follow = function (gameObject, xDeadZone, yDeadZone) {
		this.followed = gameObject;
		this.xDeadZone = xDeadZone;
		this.yDeadZone = yDeadZone;
	};

	this.update = function () {
		// keep following the player (or other desired object)
		if (this.followed !== null) {
			if (this.axis === this.AXISDIRECTIONS.HORIZONTAL || this.axis === this.AXISDIRECTIONS.BOTH) {
				// moves camera on horizontal axis based on followed object position
				if (this.followed.x - this.xView + this.xDeadZone > this.wView) {
					this.xView = this.followed.x - (this.wView - this.xDeadZone);
				}
				else if (this.followed.x - this.xDeadZone < this.xView) {
					this.xView = this.followed.x - this.xDeadZone;
				}
			}
			if (this.axis === this.AXISDIRECTIONS.VERTICAL || this.axis === this.AXISDIRECTIONS.BOTH) {
				// moves camera on vertical axis based on followed object position
				if (this.followed.y - this.yView + this.yDeadZone > this.hView) {
					this.yView = this.followed.y - (this.hView - this.yDeadZone);
				}
				else if (this.followed.y - this.yDeadZone < this.yView) {
					this.yView = this.followed.y - this.yDeadZone;
				}
			}

		}

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