import { MainGame } from 'Game/mainGame';

export const HomeContainer = {
	template:
	'<div id="home">' +
	'<div v-on:click="_startArpgGame">' + Resources.StartARPG + '</div>' +
	'<canvas id="mainScreen" ref="mainScreen" width="800" height="800">' + Resources.CanvasError + '</canvas >' +
	'</div>',
	data: function () {
		return {
			ctx: {},
			mainGame: {}
		};
	},
	mounted: function () {
		this.ctx = this.$refs.mainScreen.getContext('2d');
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