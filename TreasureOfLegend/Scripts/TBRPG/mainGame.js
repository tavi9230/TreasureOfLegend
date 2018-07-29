﻿import { AjaxHelper } from 'Helpers/ajaxHelper';
import { Player } from 'TBRPG/Characters/player';
import { TestArena } from 'TBRPG/Maps/testArena';
import { Camera } from 'TBRPG/Helpers/camera';
import { Controls } from 'TBRPG/Helpers/controls';

export const TBRPGMainGame = function (ctx, canvas) {
	//----------------------  VARIABLES  ----------------------
	this._ctx = ctx;
	this._canvas = canvas;
	this._player = {};
	this._images = [];
	this._imagesLoaded = 0;
	this._currentLevel = {};
	this._runningId = -1;
	this._camera = {};

	window.Controls = new Controls(this._canvas);
	//----------------------  FRAME VARIABLES  ----------------------
	// last frame timestamp
	this.last = 0;
	// current timestamp
	this.now = 0;
	// time between frames
	this.step = this.now - this.last;

	//----------------------  METHODS  ----------------------
	Emitter.$on('pause', this._togglePause);
	this.stop = function () {
		// TODO settings loader/unloader script
		cancelAnimationFrame(this._runningId);
		this._runningId = -1;
		if (this._ctx && this._ctx.clearRect) {
			// TODO: Check if this is right
			this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		}
		Controls.removeControls();
	};
	this.start = function () {
		var self = this;

		// TODO: Map Loader script
		AjaxHelper.get('/api/image/GetImages').then(function (imageDataList) {
			_.each(imageDataList, function (imageData) {
				var image = new Image();
				image.src = 'data:image/png;base64,' + imageData;
				self._images.push(image);
				image.onload = function () {
					self._imagesLoaded++;
					if (self._images.length === self._imagesLoaded) {
						self._tryStart();
					}
				};
			});
		});
	};

	// Game update function
	this.update = function (step) {
		this._player.update();
		this._camera.update(step);
		//this._currentLevel.map.update();
	};

	// Game draw function
	this.draw = function () {
		// clear the entire canvas
		// TODO: this.canvas
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

		// redraw all objects
		this._currentLevel.draw(this._ctx, this._camera.xView, this._camera.yView);
		this._player.draw(this._ctx, this._camera.xView, this._camera.yView);
	};

	// Game Loop
	this._gameLoop = function (timestamp) {
		// <-- current timestamp (in milliseconds)
		this.now = timestamp;
		// <-- time between frames (in seconds)
		this.step = (this.now - this.last) / 1000;
		// <-- store the current timestamp for further evaluation in next frame/step
		this.last = this.now;

		this.update(this.step);
		this.draw();
		this.runningId = requestAnimationFrame(_.bind(this._gameLoop, this));
	};

	this._play = function () {
		if (this._runningId === -1) {
			this._runningId = requestAnimationFrame(_.bind(this._gameLoop, this));
		}
	};

	this._togglePause = function () {
		if (this._runningId === -1) {
			this._play();
		}
		else {
			cancelAnimationFrame(this._runningId);
			this._runningId = -1;
		}
	};

	this._tryStart = function () {
		// setup an object that represents the room
		this._currentLevel = new TestArena(this._ctx, this._images, 5000, 5000);

		// setup player
		this._player = new Player(200, 200, 100, 100, this._images, 100, 100);

		this._camera = new Camera(600, 0, 0, this._canvas.width, this._canvas.height, this._currentLevel.width, this._currentLevel.height);

		this._play();
	};
};