import {Pathfinder} from 'Aniwars/pathfinder';
import {EnumHelper} from 'Aniwars/enumHelper';

export const Character = function(game, characterGroup) {
    this.characterConfig = {
        life: 10,
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
        minorActionsSpent: 0
    };
    this.game = game;
    this.map = game.activeMap;
    this.characters = characterGroup;

    this.addNewCharacter = (x, y, spriteName) => {
        var character = game.physics.add.sprite(x, y, spriteName).setOrigin(0, 0);
        character.characterConfig = Object.assign({}, this.characterConfig);
        character.characterConfig.posX = x;
        character.characterConfig.posY = y;
        this.characters.add(character);
    };

    this.moveActiveCharacter = (tile, config) => {
        var enemies = config.enemies;
        var currentCharacter = game.activeCharacter;
        if (!currentCharacter.characterConfig.isMoving &&
            (currentCharacter.x !== tile.x || currentCharacter.y !== tile.y)) {
            var isObstacleInTheWay = false;
            _.each(enemies.characters.getChildren(),
                function(enemy) {
                    if (enemy.x === tile.x && enemy.y === tile.y) {
                        isObstacleInTheWay = true;
                        //return;
                    }
                });
            _.each(game.activeMap.objects.getChildren(),
                function(object) {
                    if (object.x === tile.x && object.y === tile.y) {
                        //if object is a door check if it is open/activated
                        if (object.objectConfig.id === EnumHelper.idEnum.door && !object.objectConfig.isActivated) {
                            isObstacleInTheWay = true;
                        } else if (object.objectConfig.id !== EnumHelper.idEnum.door) {
                            isObstacleInTheWay = true;
                        }
                        //return;
                    }
                });
            if (!isObstacleInTheWay) {
                var pathWay = Pathfinder.findWay(currentCharacter.x / 50,
                    currentCharacter.y / 50,
                    tile.x / 50,
                    tile.y / 50,
                    game.activeMap.levelMap);
                currentCharacter.characterConfig.path = pathWay || [];
                if (pathWay.length > 0) {
                    currentCharacter.characterConfig.path.shift();
                    if (currentCharacter.characterConfig.path.length <=
                        currentCharacter.characterConfig.movement - currentCharacter.characterConfig.movementSpent) {
                        this._moveCharacter(currentCharacter);
                        game.activeMap.hideMovementGrid();
                    } else if (currentCharacter.characterConfig.path.length >
                        currentCharacter.characterConfig.movement - currentCharacter.characterConfig.movementSpent) {
                        currentCharacter.characterConfig.path = [];
                    }
                }
            }
        }
    };

    this.stopActiveCharacter = () => {
        var currentCharacter = game.activeCharacter;
        //reduce speed on X
        this._reduceSpeedX(currentCharacter);

        //reduce speed on Y
        this._reduceSpeedY(currentCharacter);

        //show grid if stopped
        if (currentCharacter.x === currentCharacter.characterConfig.posX &&
            currentCharacter.y === currentCharacter.characterConfig.posY &&
            !game.activeMap.isMovementGridShown) {
            if (currentCharacter.characterConfig.path.length === 0) {
                game.activeMap.showMovementGrid(currentCharacter);
            }
            currentCharacter.characterConfig.isMoving = false;
        }
    };

    this.keepMovingActiveCharacter = () => {
        var currentCharacter = game.activeCharacter;
        if (!currentCharacter.characterConfig.isMoving && currentCharacter.characterConfig.path.length > 0) {
            this._moveCharacter(currentCharacter);
        }
    };

    this.interactWithObject = (object, character) => {
        if (object.objectConfig.isInteractible &&
            character.characterConfig.minorActions - character.characterConfig.minorActionsSpent > 0) {
            var objX = object.x;
            if (object.objectConfig.isAngled) {
                if (object.objectConfig.isActivated) {
                    objX = object.x + 25;
                } else {
                    objX = object.x - 50;
                }
            }
            if (Math.abs(character.x - objX) <= 50 &&
                Math.abs(character.y - object.y) <= 50 &&
                (Math.abs(character.x - objX) > 0 ||
                Math.abs(character.y - object.y) > 0)) {
                if (object.objectConfig.id === EnumHelper.idEnum.door) {
                    //move code to other file?
                    character.characterConfig.minorActionsSpent++;
                    game.events.emit('activeCharacterActed', character);
                    var x = object.x / 50;
                    var y = object.y / 50;
                    if (object.objectConfig.isAngled) {
                        if (object.objectConfig.isActivated) {
                            x = (object.x + 25) / 50;
                        } else {
                            x = (object.x - 50) / 50;
                        }
                    }
                    game.activeMap.levelMap = game.activeMap.copyMap(game.activeMap.levelMap, game.activeMap.previousMap);
                    //door animations would be nice
                    if (!object.objectConfig.isActivated) {
                        game.activeMap.levelMap[y][x] = 0;
                        if (y - 1 > 0 && game.activeMap.levelMap[y - 1][x] !== EnumHelper.idEnum.tile && game.activeMap.levelMap[y - 1][x] !== EnumHelper.idEnum.door) {
                            object.setAngle(-90);
                        } else if (x - 1 > 0 && game.activeMap.levelMap[y][x - 1] !== EnumHelper.idEnum.tile && game.activeMap.levelMap[y][x - 1] !== EnumHelper.idEnum.door) {
                            object.setAngle(0);
                            object.setX(object.x -75);
                        }
                    } else {
                        game.activeMap.levelMap[y][x] = 2;
                        if (y - 1 > 0 && game.activeMap.levelMap[y - 1][x] !== EnumHelper.idEnum.tile && game.activeMap.levelMap[y - 1][x] !== EnumHelper.idEnum.door) {
                            object.setAngle(0);
                        } else if (x - 1 > 0 && game.activeMap.levelMap[y][x - 1] !== EnumHelper.idEnum.tile && game.activeMap.levelMap[y][x - 1] !== EnumHelper.idEnum.door) {
                            object.setX(object.x + 75);
                            object.setAngle(90);
                        }
                    }
                    object.objectConfig.isActivated = !object.objectConfig.isActivated;
                    game.activeMap.showMovementGrid();
                }
            } else {
                //move to character near object
            }
        }
    };
    // Private -----------------------------------------------------------------------------------------------------
    this._moveCharacter = function(currentCharacter) {
        currentCharacter.characterConfig.movementSpent++;
        currentCharacter.characterConfig.isMoving = true;
        currentCharacter.characterConfig.posX = currentCharacter.characterConfig.path[0][0] * 50;
        currentCharacter.characterConfig.posY = currentCharacter.characterConfig.path[0][1] * 50;
        currentCharacter.characterConfig.path.shift();
        if (currentCharacter.characterConfig.posX > currentCharacter.x && currentCharacter.characterConfig.posY > currentCharacter.y) {
            currentCharacter.setVelocity(this.characterConfig.velocity, this.characterConfig.velocity);
        } else if (currentCharacter.characterConfig.posX < currentCharacter.x && currentCharacter.characterConfig.posY < currentCharacter.y) {
            currentCharacter.setVelocity(-1 * this.characterConfig.velocity, -1 * this.characterConfig.velocity);
        } else if (currentCharacter.characterConfig.posX < currentCharacter.x && currentCharacter.characterConfig.posY > currentCharacter.y) {
            currentCharacter.setVelocity(-1 * this.characterConfig.velocity, this.characterConfig.velocity);
        } else if (currentCharacter.characterConfig.posX > currentCharacter.x && currentCharacter.characterConfig.posY < currentCharacter.y) {
            currentCharacter.setVelocity(this.characterConfig.velocity, -1 * this.characterConfig.velocity);
        } else if (currentCharacter.characterConfig.posX > currentCharacter.x) {
            currentCharacter.setVelocityX(this.characterConfig.velocity);
        } else if (currentCharacter.characterConfig.posX < currentCharacter.x) {
            currentCharacter.setVelocityX(-1 * this.characterConfig.velocity);
        } else if (currentCharacter.characterConfig.posY > currentCharacter.y) {
            currentCharacter.setVelocityY(this.characterConfig.velocity);
        } else if (currentCharacter.characterConfig.posY < currentCharacter.y) {
            currentCharacter.setVelocityY(-1 * this.characterConfig.velocity);
        }
        game.events.emit('activeCharacterActed', currentCharacter);
    };

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
};