export const Controls = function () {
	this.controls = {
		left: false,
		up: false,
		right: false,
		down: false
	};

	this._addKeydown = function (e) {
		switch (e.keyCode) {
			// left arrow
			case 37:
				this.controls.left = true;
				break;
			// up arrow
			case 38:
				this.controls.up = true;
				break;
			// right arrow
			case 39:
				this.controls.right = true;
				break;
			// down arrow
			case 40:
				this.controls.down = true;
				break;
			default:
				break;
		}
	};

	this._addKeyup = function (e) {
		switch (e.keyCode) {
			// left arrow
			case 37:
				this.controls.left = false;
				break;
			// up arrow
			case 38:
				this.controls.up = false;
				break;
			// right arrow
			case 39:
				this.controls.right = false;
				break;
			// down arrow
			case 40:
				this.controls.down = false;
				break;
			// key P pauses the game
			case 80:
				this.togglePause();
				break;
			default:
				break;
		}
	};

	this.togglePause = function () {
		Game.togglePause();
	};

	this.defineControls = function () {
		WindowEvents.add('keydown', _.bind(this._addKeydown, this));
		WindowEvents.add('keyup', _.bind(this._addKeyup, this));
	};

	this.undefineControls = function () {
		WindowEvents.remove('keydown', this._addKeydown);
		WindowEvents.remove('keyup', this._addKeyup);
	};
};