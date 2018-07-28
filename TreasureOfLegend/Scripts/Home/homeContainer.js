import { MainGame } from 'Game/mainGame';
import { WindowEvents } from 'Shared/windowEvents';

export const HomeContainer = {
	template:
	'<div id="home">' +
	'<div v-on:click="_startArpgGame">' + Resources.StartARPG + '</div>' +
	'<canvas id="mainScreen" ref="mainScreen" width="1800" height="900">' + Resources.CanvasError + '</canvas >' +
	'</div>',
	data: function () {
		return {
			ctx: {},
			mainGame: {}
		};
	},
	mounted: function () {
		this.ctx = this.$refs.mainScreen.getContext('2d');
		WindowEvents.setAnimationRequests();
	},
	methods: {
		stop: function () {
			if (this.mainGame) {
				this.mainGame.stop();
				this.mainGame = undefined;
			}
		},
		_startArpgGame: function () {
			this.mainGame = new MainGame(this.ctx, this.$refs.mainScreen);
			this.mainGame.start();
		}
	}
};