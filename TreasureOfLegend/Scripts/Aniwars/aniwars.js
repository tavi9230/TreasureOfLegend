import {BootScene} from 'Aniwars/Scenes/Boot/bootScene';
import {MainMenuScene} from 'Aniwars/Scenes/Menu/mainMenuScene';

export const Aniwars = {
    template: '<div class="aniwars"></div>',
    mounted: function () {
        $('.btnLogin').addClass('hidden');
        var bootScene = new BootScene();
        var mainMenuScene = new MainMenuScene();
        //var self = this;
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: 'content',
            width: window.innerWidth,
            height: window.innerHeight,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 }
                }
            },
            scene: [
                bootScene,
                mainMenuScene
            ]
        });
        //this.resize = () => {
        //    self.game.width = window.innerWidth + 'px';
        //    self.game.height = window.innerHeight + 'px';
        //};
        //window.addEventListener('resize', this.resize, false);
        //this.resize = () => {
        //    var canvas = document.querySelector('canvas');
        //    var windowWidth = window.innerWidth;
        //    var windowHeight = window.innerHeight;
        //    var windowRatio = windowWidth / windowHeight;
        //    var gameRatio = self.game.config.width / self.game.config.height;
        //    if (windowRatio < gameRatio) {
        //        canvas.style.width = windowWidth + 'px';
        //        canvas.style.height = (windowWidth / gameRatio) + 'px';
        //    }
        //    else {
        //        canvas.style.width = (windowHeight * gameRatio) + 'px';
        //        canvas.style.height = windowHeight + 'px';
        //    }
        //};
        //setTimeout(function() {
        //    self.resize();
        //    window.addEventListener('resize', self.resize, false);
        //}, 500);
    }
};