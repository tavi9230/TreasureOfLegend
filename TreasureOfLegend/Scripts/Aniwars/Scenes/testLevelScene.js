import {SceneManager} from 'Aniwars/sceneManager';

export const TestLevelScene = function() {
    return new Phaser.Class({
        Extends: Phaser.Scene,
        initialize: function TestLevelScene() {
            Phaser.Scene.call(this, { key: 'TestLevelScene' });
        },
        preload() { },
        create() {
            this.sceneManager = new SceneManager(this);
            this.sceneManager.createMap();
            this.sceneManager.createCharacters();
            this.sceneManager.createEnemies();
            this.sceneManager.createCamera();
            this._activateHUDScene();
            this.cursors = this.input.keyboard.createCursorKeys();
        },
        update() {
            this.sceneManager.checkManager();
            this._moveCamera();
        },
        _activateHUDScene() {
            var self = this;
            this.hudScene = this.scene.get('HUDScene');
            this.hudScene.scene.bringToTop();
            this.hudScene.events.on('endTurn', function() {
                if (self.activeCharacter.characterConfig.path.length === 0 &&
                    !self.activeCharacter.characterConfig.isMoving) {
                    self.activeCharacter.characterConfig.movementSpent = 0;
                    self.activeCharacter.characterConfig.minorActionsSpent = 0;
                    self.activeCharacter.characterConfig.actionsSpent = 0;
                    self.events.emit('activeCharacterChanged', self.activeCharacter);
                    self.activeMap.showMovementGrid();
                }
            });
            this.hudScene.events.on('getCharacterStartData', function() {
                self.events.emit('activeCharacterChanged', self.activeCharacter);
            });
        },
        _moveCamera() {
            //camera movement not done correctly
            if (this.cursors.left.isDown) {
                this.cameras.main.x += 10;
                if (this.cameras.main.x > 0) {
                    this.cameras.main.x = 0;
                }

            }

            if (this.cursors.right.isDown) {
                this.cameras.main.x -= 10;
                if (this.cameras.main.x < this.activeMap.levelMap[0].length * 50) {
                    this.cameras.main.x = this.activeMap.levelMap[0].length * 50;
                }
            }

            if (this.cursors.up.isDown) {
                this.cameras.main.y += 10;
                if (this.cameras.main.y > 0) {
                    this.cameras.main.y = 0;
                }

            }
            if (this.cursors.down.isDown) {
                this.cameras.main.y -= 10;
                if (this.cameras.main.y < -100) {
                    this.cameras.main.y = -100;
                }
            }
        }
    });
};