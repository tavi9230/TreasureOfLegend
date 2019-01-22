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
            this.initiative = this.sceneManager.getInitiativeArray();
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
                    self.initiativeIndex++;
                    if (self.initiativeIndex >= self.initiative.length) {
                        self.initiativeIndex = 0;
                    }
                    self.activeCharacter = self.initiative[self.initiativeIndex];
                    self.activeMap.showMovementGrid();
                }
            });
            this.hudScene.events.on('getCharacterStartData', function() {
                self.events.emit('activeCharacterChanged', self.activeCharacter);
                self.events.emit('showCharacterInitiative', self.initiative);
            });
        },
        _moveCamera() {
            // TODO: Stop following active character and follow back when you don't want to scroll anymore
            //this.cameras.main.stopFollow();
            if (this.cursors.left.isDown) {
                this.cameras.main.scrollX -= 10;
            }
            if (this.cursors.right.isDown) {
                this.cameras.main.scrollX += 10;
            }
            if (this.cursors.up.isDown) {
                this.cameras.main.scrollY -= 10;
            }
            if (this.cursors.down.isDown) {
                this.cameras.main.scrollY += 10;
            }
        }
    });
};