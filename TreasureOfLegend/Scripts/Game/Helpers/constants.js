// TODO: Move to DB and request them on load?
export const Constants = function () {
	this.ARPGSPEED = 5;
		// ---------------------    game settings:
	this.FPS = 30;
			// milliseconds
	this.INTERVAL = 1000 / this.FPS;
				// seconds
	this.STEP = this.INTERVAL / 1000;
};