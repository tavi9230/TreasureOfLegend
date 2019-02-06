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
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;
            this.resize = function() {
                self.windowWidth = window.innerWidth;
                self.windowHeight = window.innerHeight;
            };
            window.addEventListener('resize', this.resize, false);
            // Find a way to do this without sending the context as a parameter
            this._createMenuLayout();
        },
        update() {
            if (this.scene.get('TestLevelScene')) {
                this.scene.bringToTop();
                this._updateButtons();
            }
        },
        _createMenuLayout: function () {
            this.menuBackground = this.add.graphics();
            this.menuBackground.fillStyle(0x111111, 1);
            this.menuBackground.fillRect(0, 0, this.windowWidth, this.windowHeight);
            this.testMapButton = this.add.image((this.windowWidth / 2) - 150, (this.windowHeight / 2) - 50, 'mainMenuButton').setOrigin(0, 0);
            this.testMapButtonText = this.add.text((this.windowWidth / 2) - 130, (this.windowHeight / 2) - 30, 'Play Test Map', { fill: '#000' });
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