import {Pathfinder} from 'Aniwars/pathfinder';
import {EnumHelper} from 'Aniwars/enumHelper';
import {ActionManager} from 'Aniwars/actionManager';

export const Character = function(game) {
    var actionManager = new ActionManager(game);

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
        minorActionsSpent: 0,
        actionInProgress: null
    };
    this.game = game;
    this.map = game.activeMap;
    this.characters = game.add.group();

    this.addNewCharacter = (x, y, spriteName) => {
        var character = game.physics.add.sprite(x, y, spriteName).setOrigin(0, 0);
        character.characterConfig = Object.assign({}, this.characterConfig);
        character.characterConfig.posX = x;
        character.characterConfig.posY = y;
        this.characters.add(character);
    };

    this.moveActiveCharacterToTile = (tile) => {
        var posX = tile.x;
        var posY = tile.y;
        this._moveActiveCharacter(posX, posY);
    };

    this.moveActiveCharacterNearObject = (object, pathX, pathY) => {
        var posX = object ? object.x : pathX * 50;
        var posY = object ? object.y : pathY * 50;
        this._moveActiveCharacter(posX, posY);
    };

    this.stopActiveCharacter = () => {
        var currentCharacter = game.activeCharacter;
        //reduce speed on X
        this._reduceSpeedX(currentCharacter);

        //reduce speed on Y
        this._reduceSpeedY(currentCharacter);

        //show grid if stopped
        if (currentCharacter.x === currentCharacter.characterConfig.posX &&
            currentCharacter.y === currentCharacter.characterConfig.posY && !game.activeMap.isMovementGridShown) {
            if (currentCharacter.characterConfig.path.length === 0) {
                game.events.emit('activeCharacterActed', currentCharacter);
                game.activeMap.showMovementGrid(currentCharacter);
                this._checkIfObjectInteractionInProgress(currentCharacter.characterConfig.actionInProgress);
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

    this.interactWithObject = (object) => {
        var character = game.activeCharacter;
        character.characterConfig.actionInProgress = null;
        if (object.objectConfig.isInteractible && character.characterConfig.minorActions - character.characterConfig.minorActionsSpent > 0) {
            var obj = this._getObjRealCoords(object);
            // If object within reach try the interaction
            if (Math.abs(character.x - obj.x) <= 50 && Math.abs(character.y - obj.y) <= 50 &&
                (Math.abs(character.x - obj.x) > 0 || Math.abs(character.y - obj.y) > 0)) {
                object.x = obj.x;
                object.y = obj.y;
                actionManager.interactWithObject(object);
                // Otherwise move near the object and try again
            } else if (Math.abs(character.x - obj.x) !== 0 || Math.abs(character.y - obj.y) !== 0) {
                character.characterConfig.actionInProgress = object;
                var path = Pathfinder.getPathFromAToB(character, object, game.activeMap.levelMap);
                this.moveActiveCharacterNearObject(null, path[path.length - 2][0], path[path.length - 2][1]);
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

    this._moveActiveCharacter = (posX, posY) => {
        var currentCharacter = game.activeCharacter;
        if (!currentCharacter.characterConfig.isMoving &&
            (currentCharacter.x !== posX || currentCharacter.y !== posY)) {
            if (!this._isTileOccupied(posX, posY)) {
                var pathWay = Pathfinder.findWay(currentCharacter.x / 50, currentCharacter.y / 50, posX / 50, posY / 50, game.activeMap.levelMap);
                currentCharacter.characterConfig.path = pathWay || [];
                if (pathWay.length > 0) {
                    currentCharacter.characterConfig.path.shift();
                    // if there was a click on an object close to the limit of movement, move near object
                    if (currentCharacter.characterConfig.actionInProgress && currentCharacter.characterConfig.path.length === currentCharacter.characterConfig.movement + 1) {
                        currentCharacter.characterConfig.path.pop();
                    }

                    if (currentCharacter.characterConfig.path.length <= currentCharacter.characterConfig.movement - currentCharacter.characterConfig.movementSpent) {
                        this._moveCharacter(currentCharacter);
                        game.activeMap.hideMovementGrid();
                    } else if (currentCharacter.characterConfig.path.length > currentCharacter.characterConfig.movement - currentCharacter.characterConfig.movementSpent) {
                        currentCharacter.characterConfig.path = [];
                    }
                }
            }
        }
    };

    this._isTileOccupied = (posX, posY) => {
        var isObstacleInTheWay = false;
        _.each(game.enemies.characters.getChildren(),
            function(enemy) {
                if (enemy.x === posX && enemy.y === posY) {
                    isObstacleInTheWay = true;
                    //return;
                }
            });
        _.each(game.activeMap.objects.getChildren(),
            function(object) {
                if (object.x === posX && object.y === posY) {
                    //if object is a door check if it is open/activated
                    if ((object.objectConfig.id === EnumHelper.idEnum.door.up ||
                        object.objectConfig.id === EnumHelper.idEnum.door.right ||
                        object.objectConfig.id === EnumHelper.idEnum.door.down ||
                        object.objectConfig.id === EnumHelper.idEnum.door.left)
                        && !object.objectConfig.isActivated) {
                        isObstacleInTheWay = true;
                    } else if ((object.objectConfig.id !== EnumHelper.idEnum.door.up &&
                        object.objectConfig.id !== EnumHelper.idEnum.door.right &&
                        object.objectConfig.id !== EnumHelper.idEnum.door.down &&
                        object.objectConfig.id !== EnumHelper.idEnum.door.left)) {
                        isObstacleInTheWay = true;
                    }
                    //return;
                }
            });
        return isObstacleInTheWay;
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
};