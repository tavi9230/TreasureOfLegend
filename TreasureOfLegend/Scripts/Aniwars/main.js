import {AssetLoader} from 'Aniwars/assetLoader';
import {BootScene} from 'Aniwars/Scenes/bootScene';
import {HUDScene} from 'Aniwars/Scenes/hudScene';
import {TestLevelScene} from 'Aniwars/Scenes/testLevelScene';

export const AniwarsGame = function () {
    var bootScene = new BootScene();
    var hudScene = new HUDScene('TestLevelScene');
    var testLevelScene = new TestLevelScene();
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
            hudScene,
            testLevelScene
        ]
    });
};