import {AssetLoader} from 'Aniwars/assetLoader';
import {BootScene} from 'Aniwars/Scenes/bootScene';
import {MainMenuScene} from 'Aniwars/Scenes/mainMenuScene';

export const AniwarsGame = function () {
    var bootScene = new BootScene();
    var mainMenuScene = new MainMenuScene();
    var self = this;
    this.game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: 'content',
        width: 1200,
        height: 800,
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
    this.resize = () => {
        var canvas = document.querySelector('canvas');
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var windowRatio = windowWidth / windowHeight;
        var gameRatio = self.game.config.width / self.game.config.height;
        if (windowRatio < gameRatio) {
            canvas.style.width = windowWidth + 'px';
            canvas.style.height = (windowWidth / gameRatio) + 'px';
        }
        else {
            canvas.style.width = (windowHeight * gameRatio) + 'px';
            canvas.style.height = windowHeight + 'px';
        }
    };
    setTimeout(function() {
        self.resize();
        window.addEventListener('resize', self.resize, false);
    }, 500);
};