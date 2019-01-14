import { MainGame } from 'Game/mainGame';
//import { WindowEvents } from 'Shared/windowEvents';
import { DManGame } from 'DMan/main';
import { TBSGame } from 'TBS/main';

export const HomeContainer = {
    template:
	'<div id="home">' +
	'<div v-on:click="_startArpgGame">' + Resources.StartARPG + '</div>' +
	'<div v-on:click="_startDynamicGame">' + Resources.StartARPG + '</div>' +
    '<div v-on:click="_startDManGame">Start D-man game</div>' +
    '<div v-on:click="_startTBSGame">TBS</div>' +
	//'<canvas id="mainScreen" ref="mainScreen" width="1800" height="900">' + Resources.CanvasError + '</canvas >' +
	'</div>',
    data: function () {
        return {
            ctx: {},
            mainGame: {}
        };
    },
    mounted: function () {
        //this.ctx = this.$refs.mainScreen.getContext('2d');
        //WindowEvents.setAnimationRequests();
    },
    methods: {
        stop: function () {
            if (this.mainGame) {
                this.mainGame.stop();
                this.mainGame = undefined;
            }
        },
        _startArpgGame: function () {
            if (this.mainGame.stop) {
                this.mainGame.stop();
            }
            this.mainGame = new MainGame(this.ctx, this.$refs.mainScreen);
            this.mainGame.start();
        },
        _startDynamicGame: function () {
            if (this.mainGame.stop) {
                this.mainGame.stop();
            }
            this.mainGame = new MainGame(this.ctx, this.$refs.mainScreen);
            this.mainGame.start();
        },
        _startDManGame: function() {
            this.mainGame = new DManGame();
        },
        _startTBSGame: function() {
            this.mainGame = new TBSGame();
        }
    }
};