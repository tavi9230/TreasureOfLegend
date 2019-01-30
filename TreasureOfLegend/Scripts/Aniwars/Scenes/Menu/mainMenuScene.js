import {AssetLoader} from 'Aniwars/Helpers/assetLoader';
import {HUDScene} from 'Aniwars/Scenes/HUD/hudScene';
import {TestLevelScene} from 'Aniwars/Scenes/TestLevel/testLevelScene';

export const MainMenuScene = function() {
    this.sceneObject = new Phaser.Class({
        Extends: Phaser.Scene,

        initialize: function MainMenuScene() {
            Phaser.Scene.call(this, { key: 'MainMenuScene', active: true});
        },

        preload() {
            var assetLoader = new AssetLoader(this);
            assetLoader.loadMainMenuImages();
        },

        create() {
            // Find a way to do this without sending the context as a parameter
            this._createMenuLayout();
        },
        update() {
            if (this.scene.get('TestLevelScene')) {
                this._updateButtons();
            }
        },
        _createMenuLayout: function () {
            this.testMapButton = this.add.image(450, 250, 'mainMenuButton').setOrigin(0, 0);
            this.testMapButtonText = this.add.text(470, 270, 'Play Test Map', { fill: '#000' });
            this.testMapButton.on('pointerdown', _.bind(this._startTestLevel, this));
            this.input.setHitArea(this.testMapButton);
        },
        _updateButtons: function() {
            this.testMapButtonText.setText('Resume Test Map');
        },
        _startTestLevel: function() {
            if (!this.scene.get('TestLevelScene')) {
                var hudScene = new HUDScene('TestLevelScene');
                var testLevelScene = new TestLevelScene();
                this.scene.sleep('MainMenuScene');
                this.scene.add('HUDScene', hudScene, true);
                this.scene.add('TestLevelScene', testLevelScene, true);
            } else {
                this.scene.sleep('MainMenuScene');
                this.scene.wake('TestLevelScene');
                this.scene.wake('HUDScene');
            }
        }
    });

    return this.sceneObject;
};