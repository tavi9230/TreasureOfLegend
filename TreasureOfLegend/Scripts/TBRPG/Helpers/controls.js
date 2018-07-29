export const Controls = function (canvas) {
	this.canvas = canvas;
	this.keys = {
		left: false,
		up: false,
		right: false,
		down: false
	};

	this._keyConstants = {
		W: 87,
		S: 83,
		A: 65,
		D: 68,
		P: 80
	};

	this._addKeydown = function (e) {
		switch (e.keyCode) {
			case this._keyConstants.A:
				this.keys.left = true;
				break;
			case this._keyConstants.W:
				this.keys.up = true;
				break;
			// D
			case this._keyConstants.D:
				this.keys.right = true;
				break;
			// S
			case this._keyConstants.S:
				this.keys.down = true;
				break;
			default:
				break;
		}
	};

	this._addKeyup = function (e) {
		switch (e.keyCode) {
			case this._keyConstants.A:
				this.keys.left = false;
				break;
			// up arrow
			case this._keyConstants.W:
				this.keys.up = false;
				break;
			// right arrow
			case this._keyConstants.D:
				this.keys.right = false;
				break;
			// S
			case this._keyConstants.S:
				this.keys.down = false;
				break;
			// key P pauses the game
			case this._keyConstants.P:
				// TODO: Fix pausing
				Emitter.$emit('pause');
				break;
			default:
				break;
		}
	};

	this._addMouseDown = function (e) {
		if (this.canvas) {
			var rect = this.canvas.getBoundingClientRect();
			var x = Math.floor((e.clientX - rect.left) / 100);
			var y = Math.floor((e.clientY - rect.top) / 100);
			if (x >= 0 && x < this.canvas.width / 100
				&& y >= 0 && y < this.canvas.height / 100) {
				console.log('x: ' + x + ';\n y: ' + y + ';');
			}
		}
	};

	this.removeControls = function () {
		WindowEvents.remove('keydown', this._addKeydown);
		WindowEvents.remove('keyup', this._addKeyup);
		WindowEvents.remove('mousedown', this._addMouseDown);
	};

	WindowEvents.add('keydown', _.bind(this._addKeydown, this));
	WindowEvents.add('keyup', _.bind(this._addKeyup, this));
	WindowEvents.add('mousedown', _.bind(this._addMouseDown, this));
};