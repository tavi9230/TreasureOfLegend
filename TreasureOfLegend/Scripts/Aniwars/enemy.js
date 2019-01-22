import {Pathfinder} from 'Aniwars/pathfinder';
import {EnumHelper} from 'Aniwars/enumHelper';
import {ActionManager} from 'Aniwars/actionManager';
import {InventoryConfig} from 'Aniwars/inventoryConfig';

export const Enemy = function(game) {
    var actionManager = new ActionManager(game);

    this.characterConfig = {
        life: 2,
        maxLife: 10,
        mana: 0,
        movement: 6,
        movementSpent: 0,
        armor: 10,
        velocity: 200,
        posX: 0,
        posY: 0,
        isMoving: false,
        path: [],
        actions: 1,
        actionsSpent: 0,
        minorActions: 1,
        minorActionsSpent: 0,
        actionInProgress: null,
        actionId: -1,
        inventory: {
            mainHand: InventoryConfig.punch,
            offHand: '',
            head: '',
            body: '',
            feet: '',
            hands: ''
        },
        attributes: {
            strength: 5,
            dexterity: 5,
            intelligence: 5
        },
        image: '',
        isPlayerControlled: false,
        traits: [EnumHelper.traitEnum.standard]
    };
    this.game = game;
    this.map = this.game.activeMap;
    this.characters = this.game.add.group();

    this.addNewCharacter = (x, y, spriteName) => {
        var character = this.game.physics.add.sprite(x, y, spriteName).setOrigin(0, 0);
        character.characterConfig = Object.assign({}, this.characterConfig);
        character.characterConfig.posX = x;
        character.characterConfig.posY = y;
        character.characterConfig.image = spriteName;
        this.characters.add(character);
    };

    this.moveActiveCharacterToPosition = (x, y) => {
        var currentCharacter = this.game.activeCharacter;
        if (!currentCharacter.characterConfig.isMoving && (currentCharacter.x !== x || currentCharacter.y !== y)) {
            // Move if tile is unoccupied
            var obstacle = this._isTileOccupied(x, y);
            if (!obstacle.isObstacleInTheWay) {
                currentCharacter.characterConfig.movementSpent++;
                currentCharacter.characterConfig.isMoving = true;
                if (x > currentCharacter.x && y > currentCharacter.y) {
                    currentCharacter.setVelocity(currentCharacter.characterConfig.velocity,
                        currentCharacter.characterConfig.velocity);
                } else if (x < currentCharacter.x && y < currentCharacter.y) {
                    currentCharacter.setVelocity(-1 * currentCharacter.characterConfig.velocity,
                        -1 * currentCharacter.characterConfig.velocity);
                } else if (x < currentCharacter.x && y > currentCharacter.y) {
                    currentCharacter.setVelocity(-1 * currentCharacter.characterConfig.velocity,
                        currentCharacter.characterConfig.velocity);
                } else if (x > currentCharacter.x && y < currentCharacter.y) {
                    currentCharacter.setVelocity(currentCharacter.characterConfig.velocity,
                        -1 * currentCharacter.characterConfig.velocity);
                } else if (x > currentCharacter.x) {
                    currentCharacter.setVelocityX(currentCharacter.characterConfig.velocity);
                } else if (x < currentCharacter.x) {
                    currentCharacter.setVelocityX(-1 * currentCharacter.characterConfig.velocity);
                } else if (y > currentCharacter.y) {
                    currentCharacter.setVelocityY(currentCharacter.characterConfig.velocity);
                } else if (y < currentCharacter.y) {
                    currentCharacter.setVelocityY(-1 * currentCharacter.characterConfig.velocity);
                }
            }
        }
    };

    this.stopActiveCharacter = () => {
        var currentCharacter = this.game.activeCharacter;
        //reduce speed on X
        this._reduceSpeedX(currentCharacter);

        //reduce speed on Y
        this._reduceSpeedY(currentCharacter);

        if (currentCharacter.x === currentCharacter.characterConfig.posX &&
            currentCharacter.y === currentCharacter.characterConfig.posY ) {
            currentCharacter.characterConfig.isMoving = false;
            currentCharacter.characterConfig.path.shift();
        }
    };

    this.getPathsToEnemies = () => {
        var currentCharacter = this.game.activeCharacter;
        var paths = [];
        var auxMap = this._addEnemiesToMap(this.game.characters);
        _.each(this.game.characters.characters.getChildren(), function(character) {
            auxMap[character.y / 50][character.x / 50] = 0;
            var path = Pathfinder.findWay(currentCharacter.x / 50,
                currentCharacter.y / 50,
                character.x / 50,
                character.y / 50,
                auxMap);
            if (path.length > 0) {
                path.shift();
                if (path.length > 0) {
                    paths.push({ path: path, enemy: character });
                }
            }
        });
        paths.sort(function(a, b) {
            if (a.path.length > b.path.length) {
                return 1;
            } else if (a.path.length < b.path.length) {
                return -1;
            }
            return 0;
        });
        return paths;
    };

    this.getPathsToClosestDoor = () => {
        var currentCharacter = this.game.activeCharacter;
        var paths = [];
        var auxMap = this._addEnemiesToMap(this.game.characters);
        _.each(this.game.activeMap.objects.getChildren(), function(object) {
            if (object.objectConfig.id === EnumHelper.idEnum.door.up ||
                object.objectConfig.id === EnumHelper.idEnum.door.down ||
                object.objectConfig.id === EnumHelper.idEnum.door.left ||
                object.objectConfig.id === EnumHelper.idEnum.door.right) {
                if (!object.objectConfig.isActivated) {
                    auxMap[object.y / 50][object.x / 50] = 0;
                    var path = Pathfinder.findWay(currentCharacter.x / 50,
                        currentCharacter.y / 50,
                        object.x / 50,
                        object.y / 50,
                        auxMap);
                    if (path.length > 0) {
                        path.shift();
                        if (path.length > 0) {
                            paths.push({ path: path, object: object });
                        }
                    }
                }
            }
        });
        paths.sort(function(a, b) {
            if (a.path.length > b.path.length) {
                return 1;
            } else if (a.path.length < b.path.length) {
                return -1;
            }
            return 0;
        });
        return paths;
    };

    this.interactWithEnemy = (enemy) => {
        actionManager.interactWithEnemy(enemy);
    };

    this.interactWithObject = (object) => {
        var realCoords = this._getObjRealCoords(object);
        object.x = realCoords.x;
        object.y = realCoords.y;
        actionManager.interactWithObject(object);
    };

    this.check = () => {
        if (this.game.activeCharacter.characterConfig.traits.indexOf(EnumHelper.traitEnum.standard) !== -1) {
            this._doStandardActions();
        }
    };

    // Private -----------------------------------------------------------------------------------------------------
    this._reduceSpeedX = function(currentCharacter) {
        if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) <= 100 &&
            Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) > 30) {
            currentCharacter.x > currentCharacter.characterConfig.posX
                ? currentCharacter.setVelocityX(-150)
                : currentCharacter.setVelocityX(150);
        } else if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) <= 30 &&
            Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) > 5) {
            currentCharacter.x > currentCharacter.characterConfig.posX
                ? currentCharacter.setVelocityX(-90)
                : currentCharacter.setVelocityX(90);
        } else if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) <= 5 &&
            Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) > 1) {
            currentCharacter.x > currentCharacter.characterConfig.posX
                ? currentCharacter.setVelocityX(-45)
                : currentCharacter.setVelocityX(45);
        } else if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) < 1) {
            currentCharacter.setVelocityX(0);
            currentCharacter.x = currentCharacter.characterConfig.posX;
        }
    };

    this._reduceSpeedY = function(currentCharacter) {
        if (Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) <= 100 &&
            Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) > 30) {
            currentCharacter.y > currentCharacter.characterConfig.posY
                ? currentCharacter.setVelocityY(-150)
                : currentCharacter.setVelocityY(150);
        } else if (Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) <= 30 &&
            Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) > 10) {
            currentCharacter.y > currentCharacter.characterConfig.posY
                ? currentCharacter.setVelocityY(-90)
                : currentCharacter.setVelocityY(90);
        } else if (Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) <= 10 &&
            Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) > 1) {
            currentCharacter.y > currentCharacter.characterConfig.posY
                ? currentCharacter.setVelocityY(-45)
                : currentCharacter.setVelocityY(45);
        } else if (Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) < 1) {
            currentCharacter.setVelocityY(0);
            currentCharacter.y = currentCharacter.characterConfig.posY;
        }
    };

    this._isTileOccupied = (posX, posY) => {
        var obstacle = {
            isObstacleInTheWay: false
        };
        _.each(this.game.characters.characters.getChildren(), function(character) {
            if (character.x === posX && character.y === posY) {
                obstacle.isObstacleInTheWay = true;
                obstacle.object = character;
                //return;
            }
        });
        _.each(this.game.activeMap.objects.getChildren(), function(object) {
            if (object.x === posX && object.y === posY) {
                //if object is a door check if it is open/activated
                if ((object.objectConfig.id === EnumHelper.idEnum.door.up ||
                    object.objectConfig.id === EnumHelper.idEnum.door.right ||
                    object.objectConfig.id === EnumHelper.idEnum.door.down ||
                    object.objectConfig.id === EnumHelper.idEnum.door.left)
                    && !object.objectConfig.isActivated) {
                    obstacle.isObstacleInTheWay = true;
                    obstacle.object = object;
                } else if ((object.objectConfig.id !== EnumHelper.idEnum.door.up &&
                    object.objectConfig.id !== EnumHelper.idEnum.door.right &&
                    object.objectConfig.id !== EnumHelper.idEnum.door.down &&
                    object.objectConfig.id !== EnumHelper.idEnum.door.left)) {
                    obstacle.isObstacleInTheWay = true;
                    obstacle.object = object;
                }
                //return;
            }
        });
        return obstacle;
    };

    this._checkIfObjectInteractionInProgress = (object) => {
        if (object) {
            this.interactWithObject(object);
        }
    };

    this._getObjRealCoords = (object) => {
        var objX = object.x;
        var objY = object.y;
        if (object.objectConfig.id === EnumHelper.idEnum.door.right || object.objectConfig.id === EnumHelper.idEnum.door.left) {
            objY = object.objectConfig.isActivated ? object.y + 50 : object.y;
        } else if (object.objectConfig.id === EnumHelper.idEnum.door.down || object.objectConfig.id === EnumHelper.idEnum.door.up) {
            objX = object.objectConfig.isActivated ? object.x + 50 : object.x;
        }
        return {
            x: objX,
            y: objY
        };
    };

    this._addEnemiesToMap = (enemies) => {
        var auxMap = [];
        auxMap = this.game.activeMap.copyMap(this.game.activeMap.levelMap, auxMap);
        if (this.game.enemies) {
            _.each(enemies.characters.getChildren(), function(enemy) {
                auxMap[enemy.y / 50][enemy.x / 50] = 1;
            });
        }
        return auxMap;
    };

    this._doStandardActions = () => {
        // If enemy has movement left
        if (this.game.activeCharacter.characterConfig.movement - this.game.activeCharacter.characterConfig.movementSpent > 0) {
            if (this.game.activeCharacter.characterConfig.isMoving) {
                this.game.enemies.stopActiveCharacter();
            }
            // If it does not have a path
            if (this.game.activeCharacter.characterConfig.path.length === 0) {
                var paths = this.game.enemies.getPathsToEnemies();
                if (paths.length > 0 && paths[0].path.length > 0) {
                    // Get the path to the closest character
                    this.game.activeCharacter.characterConfig.path = paths[0].path;
                    this.game.activeCharacter.characterConfig.posX = this.game.activeCharacter.characterConfig.path[0][0] * 50;
                    this.game.activeCharacter.characterConfig.posY = this.game.activeCharacter.characterConfig.path[0][1] * 50;
                    // And move
                    this.game.enemies.moveActiveCharacterToPosition(this.game.activeCharacter.characterConfig.posX, this.game.activeCharacter.characterConfig.posY);
                } else {
                    // If no path is found to a character it might mean we are stuck in a room
                    paths = this.game.enemies.getPathsToClosestDoor();
                    if (paths.length > 0 && paths[0].path.length > 0) {
                        this.game.activeCharacter.characterConfig.path = paths[0].path;
                        this.game.activeCharacter.characterConfig.posX = this.game.activeCharacter.characterConfig.path[0][0] * 50;
                        this.game.activeCharacter.characterConfig.posY = this.game.activeCharacter.characterConfig.path[0][1] * 50;
                        this.game.enemies.moveActiveCharacterToPosition(this.game.activeCharacter.characterConfig.posX, this.game.activeCharacter.characterConfig.posY);
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

        if (this.game.activeCharacter.characterConfig.movement - this.game.activeCharacter.characterConfig.movementSpent <= 0 &&
            !this.game.activeCharacter.characterConfig.isMoving && this.game.activeCharacter.characterConfig.path.length <= 0 &&
            this.game.activeCharacter.characterConfig.actions - this.game.activeCharacter.characterConfig.actionsSpent <= 0 &&
            this.game.activeCharacter.characterConfig.minorActions - this.game.activeCharacter.characterConfig.minorActionsSpent <= 0) {
            this.game.events.emit('endEnemyTurn');
        }
    };
};