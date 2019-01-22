import {BattleMap} from 'Aniwars/map';
import {Character} from 'Aniwars/character';
import {Enemy} from 'Aniwars/enemy';

export const SceneManager = function (game) {
    this.game = game;
    this.createMap = () => {
        this.game.activeMap = new BattleMap(this.game);
        this.game.activeMap.generateMap();
        var self = this;
        _.each(this.game.activeMap.tiles.getChildren(),
            function(tile) {
                //mouse input on clicking game tiles and hovering over them
                tile.on('pointerdown', _.bind(self._moveCharacterOnClick, self, tile));
                tile.on('pointerover', _.bind(self._hoverTile, self, tile));
            });
        _.each(this.game.activeMap.objects.getChildren(),
            function(object) {
                //mouse input on clicking game objects
                object.on('pointerdown', _.bind(self._interactWithObject, self, object));
                object.on('pointerover', _.bind(self._hoverObject, self, object));
            });
    };

    this.createCharacters = () => {
        //party characters
        this.game.characters = new Character(this.game);
        this.game.characters.addNewCharacter(600, 350, 'character');

        this.game.activeCharacter = this.game.characters.characters.getChildren()[0];
        this.game.activeMap.showMovementGrid();
    };

    this.createEnemies = () => {
        //enemy characters
        var self = this;
        this.game.enemies = new Enemy(this.game);
        this.game.enemies.addNewCharacter(1100, 350, 'character');
        this.game.input.setHitArea(this.game.enemies.characters.getChildren());
        _.each(this.game.enemies.characters.getChildren(), function(enemy) {
            //mouse input on clicking game objects
            enemy.on('pointerdown', _.bind(self._interactWithEnemy, self, enemy));
            enemy.on('pointerover', _.bind(self._hoverEnemy, self, enemy));
        });
    };

    this.createCamera = () => {
        //main camera
        this.game.cameras.main.setBounds(0, -100, this.game.activeMap.levelMap[0].length * 50, this.game.activeMap.levelMap.length * 50 + 100);
        this.game.cameras.main.startFollow(this.game.activeCharacter, true, 0.09, 0.09);
    };

    this.checkManager = () => {
        if (this.game.activeCharacter.characterConfig.isPlayerControlled) {
            if (this.game.activeCharacter.characterConfig.isMoving) {
                this.game.events.emit('activeCharacterPositionModified', this.game.activeCharacter);
                this.game.characters.stopActiveCharacter();
            } else if (!this.game.activeCharacter.characterConfig.isMoving &&
                this.game.activeCharacter.characterConfig.path.length > 0) {
                this.game.characters.keepMovingActiveCharacter();
            }
        } else {
            // If enemy has movement left
            if (this.game.activeCharacter.characterConfig.movement - this.game.activeCharacter.characterConfig.movementSpent > 0) {
                if (this.game.activeCharacter.characterConfig.isMoving) {
                    this.game.enemies.stopActiveCharacter();
                }
                // If it does not have a path
                if (this.game.activeCharacter.characterConfig.path.length === 0) {
                    var paths = this.game.enemies.getPathsToEnemies();
                    if (paths.length > 0) {
                        // Get the path to the closest character
                        if (paths[0].path.length > 0) {
                            this.game.activeCharacter.characterConfig.path = paths[0].path;
                            this.game.activeCharacter.characterConfig.posX = this.game.activeCharacter.characterConfig.path[0][0] * 50;
                            this.game.activeCharacter.characterConfig.posY = this.game.activeCharacter.characterConfig.path[0][1] * 50;
                            // And move
                            this.game.enemies.moveActiveCharacterToPosition(this.game.activeCharacter.characterConfig.posX, this.game.activeCharacter.characterConfig.posY);
                        }
                    } else {
                        // If no path is found to a character it might mean we are stuck in a room
                        paths = this.game.enemies.getPathsToClosestDoor();
                        if (paths.length > 0) {
                            if (paths[0].path.length > 0) {
                                this.game.activeCharacter.characterConfig.path = paths[0].path;
                                this.game.activeCharacter.characterConfig.posX = this.game.activeCharacter.characterConfig.path[0][0] * 50;
                                this.game.activeCharacter.characterConfig.posY = this.game.activeCharacter.characterConfig.path[0][1] * 50;
                                this.game.enemies.moveActiveCharacterToPosition(this.game.activeCharacter.characterConfig.posX, this.game.activeCharacter.characterConfig.posY);
                            }
                        }
                    }
                } else {
                    // Move on the path
                    var path = this.game.activeCharacter.characterConfig.path;
                    this.game.activeCharacter.characterConfig.posX = this.game.activeCharacter.characterConfig.path[0][0] * 50;
                    this.game.activeCharacter.characterConfig.posY = this.game.activeCharacter.characterConfig.path[0][1] * 50;
                    this.game.enemies.moveActiveCharacterToPosition(path[0][0] * 50, path[0][1] * 50);
                }
            } else {
                // If no more movement, remove path in case player characters move
                this.game.activeCharacter.characterConfig.path = [];
                if (this.game.activeCharacter.characterConfig.isMoving) {
                    this.game.enemies.stopActiveCharacter();
                }
            }

            if (!this.game.activeCharacter.characterConfig.isMoving) {
                var didSomething = false;
                if (this.game.activeCharacter.characterConfig.actions - this.game.activeCharacter.characterConfig.actionsSpent > 0) {
                    var closestEnemy = this.game.enemies.getPathsToEnemies();
                    if (closestEnemy.length > 0) {
                        if (closestEnemy[0].path.length === 1) {
                            this.game.enemies.interactWithEnemy(closestEnemy[0].enemy);
                            didSomething = true;
                        }
                    }
                }

                if (this.game.activeCharacter.characterConfig.minorActions - this.game.activeCharacter.characterConfig.minorActionsSpent > 0) {
                    var closestDoor = this.game.enemies.getPathsToClosestDoor();
                    if (closestDoor.length > 0) {
                        if (closestDoor[0].path.length === 1) {
                            this.game.enemies.interactWithObject(closestDoor[0].object);
                            didSomething = true;
                        }
                    }
                }

                if (!didSomething) {
                    this.game.activeCharacter.characterConfig.minorActionsSpent++;
                    this.game.activeCharacter.characterConfig.actionsSpent++;
                    this.game.activeCharacter.characterConfig.movementSpent++;
                }
            }

            if (this.game.activeCharacter.characterConfig.movement - this.game.activeCharacter.characterConfig.movementSpent <= 0
                && !this.game.activeCharacter.characterConfig.isMoving && this.game.activeCharacter.characterConfig.path.length <= 0
                && this.game.activeCharacter.characterConfig.actions - this.game.activeCharacter.characterConfig.actionsSpent <= 0
                && this.game.activeCharacter.characterConfig.minorActions - this.game.activeCharacter.characterConfig.minorActionsSpent <= 0) {
                this.game.events.emit('endEnemyTurn');
            }
        }
    };

    this.getInitiativeArray = () => {
        var initiative = this.game.characters.characters.getChildren();
        initiative = initiative.concat(this.game.enemies.characters.getChildren());
        return initiative.sort(function(a, b) {
            if (a.characterConfig.dexterity < b.characterConfig.dexterity) {
                return -1;
            } else if (a.characterConfig.dexterity > b.characterConfig.dexterity) {
                return 1;
            }
            return 0;
        });
    };

    // PRIVATE
    // INTERACTION -------------------------------------------------------------------------------------
    this._moveCharacterOnClick = (tile) => {
        this.game.characters.moveActiveCharacterToTile(tile);
    };
    this._hoverTile = (tile) => {
        this._showDescription(tile);
        this.game.activeMap.highlightPathToTile(tile);
    };
    this._hoverObject = (object) => {
        this._showDescription(object);
        this.game.activeMap.highlightPathToObject(object);
    };
    this._interactWithObject = (object) => {
        this.game.characters.interactWithObject(object);
    };
    this._showDescription = (object) => {
        this.game.events.emit('showObjectDescription', object);
    };
    this._interactWithEnemy = (enemy) => {
        this.game.characters.interactWithEnemy(enemy);
    };
    this._hoverEnemy = (enemy) => {
        this.game.activeMap.highlightPathToEnemy(enemy);
    };
};