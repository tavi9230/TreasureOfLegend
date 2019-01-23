﻿import {Pathfinder} from 'Aniwars/pathfinder';
import {EnumHelper} from 'Aniwars/enumHelper';
import {ActionManager} from 'Aniwars/actionManager';
import {InventoryConfig} from 'Aniwars/inventoryConfig';

export const Enemy = function(game) {
    var actionManager = new ActionManager(game);

    this.characterConfig = {
        life: {
            max: 10,
            current: 4
        },
        maxLife: 10,
        mana: {
            max: 0,
            spent: 0
        },
        movement: {
            max: 6,
            spent: 0,
            isMoving: false
        },
        armor: 10,
        velocity: 200,
        posX: 0,
        posY: 0,
        path: [],
        actions: {
            max: 1,
            spent: 0,
            actionId: -1,
            selectedAction: null
        },
        minorActions: {
            max: 1,
            spent: 0,
            inProgress: null
        },
        inventory: {
            mainHand: InventoryConfig.punch,
            offHand: '',
            head: '',
            body: '',
            feet: '',
            hands: '',
            slots: {
                free: 2,
                max: 2,
                items: []
            },
            spells: []
        },
        attributes: {
            strength: 5,
            dexterity: 5,
            intelligence: 5
        },
        image: '',
        isPlayerControlled: false,
        traits: [EnumHelper.traitEnum.standard],
        statuses: []
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
        var currentCharacter = this.game.activeCharacter,
            charConfig = currentCharacter.characterConfig;
        if (!charConfig.movement.isMoving && (currentCharacter.x !== x || currentCharacter.y !== y)) {
            // Move if tile is unoccupied
            var obstacle = this._isTileOccupied(x, y);
            if (!obstacle.isObstacleInTheWay) {
                charConfig.movement.spent++;
                charConfig.movement.isMoving = true;
                if (x > currentCharacter.x && y > currentCharacter.y) {
                    currentCharacter.setVelocity(charConfig.velocity,
                        charConfig.velocity);
                } else if (x < currentCharacter.x && y < currentCharacter.y) {
                    currentCharacter.setVelocity(-1 * charConfig.velocity,
                        -1 * charConfig.velocity);
                } else if (x < currentCharacter.x && y > currentCharacter.y) {
                    currentCharacter.setVelocity(-1 * charConfig.velocity,
                        charConfig.velocity);
                } else if (x > currentCharacter.x && y < currentCharacter.y) {
                    currentCharacter.setVelocity(charConfig.velocity,
                        -1 * charConfig.velocity);
                } else if (x > currentCharacter.x) {
                    currentCharacter.setVelocityX(charConfig.velocity);
                } else if (x < currentCharacter.x) {
                    currentCharacter.setVelocityX(-1 * charConfig.velocity);
                } else if (y > currentCharacter.y) {
                    currentCharacter.setVelocityY(charConfig.velocity);
                } else if (y < currentCharacter.y) {
                    currentCharacter.setVelocityY(-1 * charConfig.velocity);
                }
            }
        }
    };

    this.stopActiveCharacter = () => {
        var currentCharacter = this.game.activeCharacter,
            charConfig = currentCharacter.characterConfig;
        //reduce speed on X
        this._reduceSpeedX(currentCharacter);

        //reduce speed on Y
        this._reduceSpeedY(currentCharacter);

        if (currentCharacter.x === charConfig.posX &&
            currentCharacter.y === charConfig.posY ) {
            charConfig.movement.isMoving = false;
            charConfig.path.shift();
        }
    };

    this.getPathsToEnemies = () => {
        var currentCharacter = this.game.activeCharacter;
        var paths = [];
        var auxMap = this.game.activeMap.addEnemiesToMap(this.game.characters);
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
        var auxMap = this.game.activeMap.addEnemiesToMap(this.game.characters);
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
        var realCoords = this.game.activeMap.getObjRealCoords(object);
        object.x = realCoords.x;
        object.y = realCoords.y;
        actionManager.interactWithObject(object);
    };

    this.check = () => {
        if (this.game.activeCharacter.characterConfig.traits.indexOf(EnumHelper.traitEnum.standard) !== -1) {
            this._doStandardActions(this.game.activeCharacter);
        }
    };

    // Private -----------------------------------------------------------------------------------------------------
    this._reduceSpeedX = function(currentCharacter) {
        var charConfig = currentCharacter.characterConfig;
        if (Math.abs(currentCharacter.x - charConfig.posX) <= 100 &&
            Math.abs(currentCharacter.x - charConfig.posX) > 30) {
            currentCharacter.x > charConfig.posX
                ? currentCharacter.setVelocityX(-150)
                : currentCharacter.setVelocityX(150);
        } else if (Math.abs(currentCharacter.x - charConfig.posX) <= 30 &&
            Math.abs(currentCharacter.x - charConfig.posX) > 5) {
            currentCharacter.x > charConfig.posX
                ? currentCharacter.setVelocityX(-90)
                : currentCharacter.setVelocityX(90);
        } else if (Math.abs(currentCharacter.x - charConfig.posX) <= 5 &&
            Math.abs(currentCharacter.x - charConfig.posX) > 1) {
            currentCharacter.x > charConfig.posX
                ? currentCharacter.setVelocityX(-45)
                : currentCharacter.setVelocityX(45);
        } else if (Math.abs(currentCharacter.x - charConfig.posX) < 1) {
            currentCharacter.setVelocityX(0);
            currentCharacter.x = charConfig.posX;
        }
    };

    this._reduceSpeedY = function(currentCharacter) {
        var charConfig = currentCharacter.characterConfig;
        if (Math.abs(currentCharacter.y - charConfig.posY) <= 100 &&
            Math.abs(currentCharacter.y - charConfig.posY) > 30) {
            currentCharacter.y > charConfig.posY
                ? currentCharacter.setVelocityY(-150)
                : currentCharacter.setVelocityY(150);
        } else if (Math.abs(currentCharacter.y - charConfig.posY) <= 30 &&
            Math.abs(currentCharacter.y - charConfig.posY) > 10) {
            currentCharacter.y > charConfig.posY
                ? currentCharacter.setVelocityY(-90)
                : currentCharacter.setVelocityY(90);
        } else if (Math.abs(currentCharacter.y - charConfig.posY) <= 10 &&
            Math.abs(currentCharacter.y - charConfig.posY) > 1) {
            currentCharacter.y > charConfig.posY
                ? currentCharacter.setVelocityY(-45)
                : currentCharacter.setVelocityY(45);
        } else if (Math.abs(currentCharacter.y - charConfig.posY) < 1) {
            currentCharacter.setVelocityY(0);
            currentCharacter.y = charConfig.posY;
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

    this._doStandardActions = (currentCharacter) => {
        var charConfig = currentCharacter.characterConfig,
            enemies = this.game.enemies;
        // If enemy has movement left
        if (charConfig.movement.max - charConfig.movement.spent > 0) {
            if (charConfig.movement.isMoving) {
                enemies.stopActiveCharacter();
            }
            // If it does not have a path
            if (charConfig.path.length === 0) {
                var paths = enemies.getPathsToEnemies();
                if (paths.length > 0 && paths[0].path.length > 0) {
                    // Get the path to the closest character
                    charConfig.path = paths[0].path;
                    charConfig.posX = charConfig.path[0][0] * 50;
                    charConfig.posY = charConfig.path[0][1] * 50;
                    // And move
                    enemies.moveActiveCharacterToPosition(charConfig.posX, charConfig.posY);
                } else {
                    // If no path is found to a character it might mean we are stuck in a room
                    paths = enemies.getPathsToClosestDoor();
                    if (paths.length > 0 && paths[0].path.length > 0) {
                        charConfig.path = paths[0].path;
                        charConfig.posX = charConfig.path[0][0] * 50;
                        charConfig.posY = charConfig.path[0][1] * 50;
                        enemies.moveActiveCharacterToPosition(charConfig.posX, charConfig.posY);
                    }
                }
            } else {
                // Move on the path
                var path = charConfig.path;
                charConfig.posX = charConfig.path[0][0] * 50;
                charConfig.posY = charConfig.path[0][1] * 50;
                enemies.moveActiveCharacterToPosition(path[0][0] * 50, path[0][1] * 50);
            }
        } else {
            // If no more movement, remove path in case player characters move
            charConfig.path = [];
            if (charConfig.movement.isMoving) {
                enemies.stopActiveCharacter();
            }
        }

        if (!charConfig.movement.isMoving) {
            var didSomething = false;
            // If enemy cannot move, try doing an action or minor action
            if (charConfig.actions.max - charConfig.actions.spent > 0) {
                var closestEnemy = enemies.getPathsToEnemies();
                if (closestEnemy.length > 0) {
                    if (closestEnemy[0].path.length === charConfig.inventory.mainHand.range) {
                        enemies.interactWithEnemy(closestEnemy[0].enemy);
                        didSomething = true;
                    }
                }
            }

            if (charConfig.minorActions.max - charConfig.minorActions.spent > 0) {
                var closestDoor = enemies.getPathsToClosestDoor();
                if (closestDoor.length > 0) {
                    if (closestDoor[0].path.length === 1) {
                        enemies.interactWithObject(closestDoor[0].object);
                        didSomething = true;
                    }
                }
            }

            // If no action has been done it might mean we are out of movement and not near an enemy or object
            if (!didSomething) {
                charConfig.minorActions.spent++;
                charConfig.actions.spent++;
                charConfig.movement.spent++;
            }
        }

        if (charConfig.movement.max - charConfig.movement.spent <= 0 &&
            !charConfig.movement.isMoving && charConfig.path.length <= 0 &&
            charConfig.actions.max - charConfig.actions.spent <= 0 &&
            charConfig.minorActions.max - charConfig.minorActions.spent <= 0) {
            this.game.events.emit('endEnemyTurn');
        }
    };
};