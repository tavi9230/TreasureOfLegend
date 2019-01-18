import {AssetLoader} from 'Aniwars/assetLoader';
import {BootScene} from 'Aniwars/Scenes/bootScene';
import {MainMenuScene} from 'Aniwars/Scenes/mainMenuScene';

export const AniwarsGame = function () {
    var bootScene = new BootScene();
    var mainMenuScene = new MainMenuScene();
    //var testLevelScene = new TestLevelScene();
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
};