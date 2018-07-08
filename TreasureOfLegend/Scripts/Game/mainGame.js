import { AjaxHelper } from 'Helpers/ajaxHelper';
import { Player } from 'Game/Characters/player';
//import { VillageMap1 } from 'Game/Maps/Test/villageMap1';
import { Constants } from 'Game/Helpers/Constants';
import { MapCreator } from 'Game/Helpers/mapCreator';
import { Camera } from 'Game/Helpers/camera';
import { Controls } from 'Game/Helpers/controls';

export const MainGame = function (ctx, canvas) {
	//----------------------  VARIABLES  ----------------------
	this.ctx = ctx;
	this.canvas = canvas;
	this.player = {};
	this.map = {};
	this.images = [];
	this.imagesLoaded = 0;
	this.interval = {};
	this.keys = [];
	this.currentLevel = {};
	window.Game = {
		runningId: -1
	};
	//----------------------  METHODS  ----------------------
	this.stop = function () {
		// TODO settings loader/unloader script
		clearInterval(Game.runningId);
		Game.runningId = -1;
		if (this.ctx && this.ctx.clearRect) {
			// TODO: Check if this is right
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	};
	this.start = function () {
		var self = this;

		// TODO: Map Loader script
		AjaxHelper.get('/api/image/GetImages').then(function (imageDataList) {
			_.each(imageDataList, function (imageData) {
				var image = new Image();
				image.src = 'data:image/png;base64,' + imageData;
				self.images.push(image);
				image.onload = function () {
					self.imagesLoaded++;
				};
			});
			self.interval = setInterval(_.bind(self._tryStart, self), 500);
		});
	};

	// Game update function
	this.update = function () {
		this.player.update(Game.constants.STEP, this.currentLevel.width, this.currentLevel.height);
		this.camera.update();
	};

	// Game draw function
	this.draw = function () {
		// clear the entire canvas
		// TODO: this.canvas
		this.ctx.clearRect(0, 0, canvas.width, canvas.height);

		// redraw all objects
		this.currentLevel.map.draw(this.ctx, this.camera.xView, this.camera.yView);
		this.player.draw(this.ctx, this.camera.xView, this.camera.yView);
	};

	// Game Loop
	this.gameLoop = function () {
		this.update();
		this.draw();
	};
	// <-- configure play/pause capabilities:

	// I'll use setInterval instead of requestAnimationFrame for compatibility reason,
	// but it's easy to change that.

	// TODO: bind this here and also to togglePause instead of line 119
	Game.play = function () {
		var self = this;
		Game.controls.defineControls();
		if (Game.runningId === -1) {
			Game.runningId = setInterval(function () {
				self.gameLoop();
			}, Game.constants.INTERVAL);
		}
	};

	Game.togglePause = function () {
		if (Game.runningId === -1) {
			Game.play();
		}
		else {
			clearInterval(Game.runningId);
			Game.runningId = -1;
		}
	};

	Game.controls = new Controls();
	Game.constants = new Constants();

	this._tryStart = function () {
		if (this.images.length === this.imagesLoaded) {
			clearInterval(this.interval);
			// setup an object that represents the room
			this.currentLevel = {
				width: 5000,
				height: 3000,
				map: new MapCreator(this.ctx, 5000, 3000, this.images)
			};

			this.currentLevel.map.generate();

			// setup player
			this.player = new Player(50, 50, this.images);

			// setup the magic camera !!!
			this.camera = new Camera(0, 0, this.canvas.width, this.canvas.height, this.currentLevel.width, this.currentLevel.height);
			this.camera.follow(this.player, this.canvas.width / 2, this.canvas.height / 2);

			var play = _.bind(Game.play, this);
			play();
		}
	};
};