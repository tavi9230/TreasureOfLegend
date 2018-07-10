// TODO: Move to DB and request them on load?
export const Constants = function () {
	// ---------------------    game settings:
	this.FPS = 100;
	// milliseconds
	this.INTERVAL = 1000 / this.FPS;
	// seconds
	this.STEP = this.INTERVAL / 1000;
};