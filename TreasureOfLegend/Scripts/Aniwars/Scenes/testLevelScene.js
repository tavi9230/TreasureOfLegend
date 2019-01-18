import {BattleMap} from 'Aniwars/map';
import {Character} from 'Aniwars/character';

export const TestLevelScene = {
    initialize: () => {
        return new Phaser.Class({
            Extends: Phaser.Scene,

            initialize: function WorldScene() {
                Phaser.Scene.call(this, { key: 'WorldScene' });
            },

            preload() {

            },
            create() {
                this._createMap();
                this._createCharacters();
                this._createEnemies();
                this._createCamera();
                this._activateHUDScene();
                this.cursors = this.input.keyboard.createCursorKeys();
                this.events.emit('activeCharacterChanged', this.activeCharacter);
                this.events.emit('activeCharacterPositionModified', this.activeCharacter);
                //mouse input on clicking game objects and hovering over them
                //this.input.on('gameobjectdown', _.bind(this._moveCharacterOnClick, this));
                //this.input.on('pointerover', _.bind(this._hoverTile, this));
            },
            update() {
                this._checkManager();
                this._moveCamera();
            },
            _checkManager() {
                if (this.activeCharacter.characterConfig.isMoving) {
                    this.events.emit('activeCharacterPositionModified', this.activeCharacter);
                    this.characters.stopActiveCharacter();
                } else if (!this.activeCharacter.characterConfig.isMoving &&
                    this.activeCharacter.characterConfig.path.length > 0) {
                    this.characters.keepMovingActiveCharacter();
                }
            },
            _activateHUDScene() {
                var self = this;
                this.hudScene = this.scene.get('HUDScene');
                this.hudScene.scene.bringToTop();
                this.hudScene.events.on('endTurn',
                    function() {
                        if (self.activeCharacter.characterConfig.path.length === 0 &&
                            !self.activeCharacter.characterConfig.isMoving) {
                            self.activeCharacter.characterConfig.movementSpent = 0;
                            self.activeCharacter.characterConfig.minorActionsSpent = 0;
                            self.activeCharacter.characterConfig.actionsSpent = 0;
                            self.events.emit('activeCharacterChanged', self.activeCharacter);
                            self.activeMap.showMovementGrid();
                        }
                    });
            },

            // CREATE -------------------------------------------------------------------------------------
            _createMap() {
                this.activeMap = new BattleMap(this);
                this.activeMap.generateMap();
                var self = this;
                _.each(this.activeMap.tiles.getChildren(),
                    function(tile) {
                        //mouse input on clicking game tiles and hovering over them
                        tile.on('pointerdown', _.bind(self._moveCharacterOnClick, self, tile));
                        tile.on('pointerover', _.bind(self._hoverTile, self, tile));
                    });
                _.each(this.activeMap.objects.getChildren(),
                    function(object) {
                        //mouse input on clicking game objects
                        object.on('pointerdown', _.bind(self._interactWithObject, self, object));
                        object.on('pointerover', _.bind(self._hoverObject, self, object));
                    });
            },
            _createCharacters () {
                //party characters
                this.characters = new Character(this);
                this.characters.addNewCharacter(600, 350, 'character');

                this.activeCharacter = this.characters.characters.getChildren()[0];
                this.activeMap.showMovementGrid();
            },
            _createEnemies () {
                //enemy characters
                this.enemies = new Character(this);
                this.enemies.addNewCharacter(1100, 350, 'character');
            },
            _createCamera() {
                //main camera
                this.cameras.main.setBounds(0,
                    0,
                    this.activeMap.levelMap.length * 50,
                    this.activeMap.levelMap.length * 50 + 100);
                this.cameras.main.startFollow(this.activeCharacter, true, 0.09, 0.09);
                //this.cameras.main.setZoom(1.2);
            },

            // INTERACTION -------------------------------------------------------------------------------------
            _moveCharacterOnClick(tile) {
                this.characters.moveActiveCharacterToTile(tile);
            },
            _hoverTile(tile) {
                this._showDescription(tile);
                this.activeMap.highlightPathToTile(tile);
            },
            _hoverObject (object) {
                this._showDescription(object);
                this.activeMap.highlightPathToObject(object);
            },
            _interactWithObject(object) {
                this.characters.interactWithObject(object);
            },
            _showDescription(object) {
                this.events.emit('showObjectDescription', object);
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
    }
};