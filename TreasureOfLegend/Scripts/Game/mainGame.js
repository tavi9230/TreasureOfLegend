import { AjaxHelper } from 'Helpers/ajaxHelper';
import { Player } from 'Game/Characters/player';
import { Constants } from 'Game/Helpers/constants';
import { TestArena } from 'Game/Maps/testArena';
import { Camera } from 'Game/Helpers/camera';
import { CollisionManager } from 'Game/Helpers/collisionManager';

window.Constants = new Constants();

export const MainGame = function (ctx, canvas) {
	//----------------------  VARIABLES  ----------------------
	this._ctx = ctx;
	this._canvas = canvas;
	this._player = {};
	this._images = [];
	this._imagesLoaded = 0;
	this._interval = {};
	this._currentLevel = {};
	this._collisionManager = {};
	this._runningId = -1;
	this._camera = {};
	//----------------------  METHODS  ----------------------
	Emitter.$on('pause', this._togglePause);
	this.stop = function () {
		// TODO settings loader/unloader script
		clearInterval(this._runningId);
		this._runningId = -1;
		if (this._ctx && this._ctx.clearRect) {
			// TODO: Check if this is right
			this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		}
		this._player.removeControls();
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
				};
			});
			self._interval = setInterval(_.bind(self._tryStart, self), 500);
		});
	};

	// Game update function
	this.update = function () {
		this._player.update(this._currentLevel.width, this._currentLevel.height);
		this._camera.update();
		this._collisionManager.checkCollision();
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
	this._gameLoop = function () {
		this.update();
		this.draw();
	};

	this._play = function () {
		var self = this;
		if (this._runningId === -1) {
			this._runningId = setInterval(function () {
				self._gameLoop();
			}, Constants.INTERVAL);
		}
	};

	this._togglePause = function () {
		if (this._runningId === -1) {
			this._play();
		}
		else {
			clearInterval(this._runningId);
			this._runningId = -1;
		}
	};

	this._tryStart = function () {
		if (this._images.length === this._imagesLoaded) {
			clearInterval(this._interval);
			// setup an object that represents the room
			this._currentLevel = new TestArena(this._ctx, this._images, 5000, 5000);

			// setup player
			this._player = new Player(200, 200, 200, 50, 50, this._images, 100, 100);

			//setup collision manager
			this._collisionManager = new CollisionManager(this._player, this._currentLevel.map.objects);

			// setup the magic camera !!!
			this._camera = new Camera(0, 0, this._canvas.width, this._canvas.height, this._currentLevel.width, this._currentLevel.height);
			this._camera.follow(this._player, this._canvas.width / 2, this._canvas.height / 2);

			this._play();
		}
	};
};