import {AssetLoader} from 'Aniwars/Helpers/assetLoader';

export const BootScene = function() {
    return new Phaser.Class({
        Extends: Phaser.Scene,

        initialize: function BootScene() {
            Phaser.Scene.call(this, { key: 'BootScene' });
        },

        preload() {
            var assetLoader = new AssetLoader(this);
            assetLoader.loadImages();
            assetLoader.loadSounds();
        },

        create() {
            this.scene.start('TestLevelScene');
        }
    });
};