import {AssetLoader} from 'Aniwars/assetLoader';

export const BootScene = {
    initialize: () => {
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
                this.scene.start('WorldScene');
            }
        });
    }
};