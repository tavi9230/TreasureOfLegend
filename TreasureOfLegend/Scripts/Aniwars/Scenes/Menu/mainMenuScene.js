import {AssetLoader} from 'Aniwars/Helpers/assetLoader';
import {HUDScene} from 'Aniwars/Scenes/HUD/hudScene';
import { TestLevelScene } from 'Aniwars/Scenes/TestLevel/testLevelScene';
import { TestLevelScene2 } from 'Aniwars/Scenes/TestLevel/testLevelScene2';
import { TestLevelScene3 } from 'Aniwars/Scenes/TestLevel/testLevelScene3';

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
            if (this.check) {
                this.check();
                this.check = null;
            }
        },
        _createMenuLayout: function () {
            this.menuBackground = this.add.graphics();
            this.menuBackground.fillStyle(0x111111, 1);
            this.menuBackground.fillRect(0, 0, this.windowWidth, this.windowHeight);
            this.testMapButton = this.add.image((this.windowWidth / 2) - 150, (this.windowHeight / 2) - 50, 'mainMenuButton').setOrigin(0, 0);
            this.testMapButtonText = this.add.text((this.windowWidth / 2) - 130, (this.windowHeight / 2) - 30, 'Test Map', { fill: '#000' });
            this.testMapButton.on('pointerdown', _.bind(this._showTestLevelMapSelection, this));
            this.input.setHitArea([this.testMapButton]);
        },
        _updateButtons: function() {
            this.testMapButtonText.setText('Resume Test Map');
        },
        _showTestLevelMapSelection: function () {
            var self = this;
            this.testMapButton.visible = false;
            this.testMapButtonText.visible = false;
            this.testLevelMapGroup = this.add.group();
            var level = this.add.image(10, 10, 'mainMenuButton').setOrigin(0, 0);
            level.name = 'TestLevelScene';
            level.displayWidth = 100;
            level.displayHeight = 50;
            this.testLevelMapGroup.add(level);
            level = this.add.image(120, 10, 'mainMenuButton').setOrigin(0, 0);
            level.name = 'TestLevelScene2';
            level.displayWidth = 100;
            level.displayHeight = 50;
            this.testLevelMapGroup.add(level);
            level = this.add.image(230, 10, 'mainMenuButton').setOrigin(0, 0);
            level.name = 'TestLevelScene3';
            level.displayWidth = 100;
            level.displayHeight = 50;
            this.testLevelMapGroup.add(level);
            this.input.setHitArea(this.testLevelMapGroup.getChildren());
            _.each(this.testLevelMapGroup.getChildren(), function (level) {
                level.on('pointerdown', _.bind(self._startTestLevel, self, level.name));
            });
        },
        _startTestLevel: function(levelName) {
            if (!this.scene.get(levelName)) {
                for (let i = 0; i < this.scene.manager.scenes.length; i++) {
                    if (this.scene.manager.scenes[i].scene.key !== 'MainMenuScene' && this.scene.manager.scenes[i].scene.key !== 'BootScene') {
                        this.game.scene.remove(this.scene.manager.scenes[i].scene.key);
                    }
                }
                var self = this;
                setTimeout(function () {
                    self.check = _.bind(self._startScene, self, levelName);
                }, 500);
            } else {
                this.scene.sleep('MainMenuScene');
                this.scene.wake(levelName);
                this.scene.wake('HUDScene');
            }
        },
        _startScene: function (levelName) {
            var hudScene = new HUDScene(levelName);
            var testLevelScene;
            switch (levelName) {
                case 'TestLevelScene':
                    testLevelScene = new TestLevelScene();
                    break;
                case 'TestLevelScene2':
                    testLevelScene = new TestLevelScene2();
                    break;
                case 'TestLevelScene3':
                    testLevelScene = new TestLevelScene3();
                    break;
                default:
                    testLevelScene = new TestLevelScene();
            }
            this.scene.sleep('MainMenuScene');
            this.scene.add('HUDScene', hudScene, true);
            this.scene.add(levelName, testLevelScene, true);
        }
    });

    return this.sceneObject;
};