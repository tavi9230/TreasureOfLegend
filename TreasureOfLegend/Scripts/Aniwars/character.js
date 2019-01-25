import {Pathfinder} from 'Aniwars/pathfinder';
import {EnumHelper} from 'Aniwars/enumHelper';
import {ActionManager} from 'Aniwars/actionManager';
import {InventoryConfig} from 'Aniwars/inventoryConfig';
import {SpellsConfig} from 'Aniwars/spellsConfig';

export const Character = function(game) {
    var actionManager = new ActionManager(game);

    this.characterConfig = {
        path: [],
        armor: 10,
        posX: 0,
        posY: 0,
        velocity: 200,
        life: {
            max: 10,
            current: 4
        },
        mana: {
            max: 10,
            spent: 0
        },
        movement: {
            max: 6,
            spent: 0,
            isMoving: false
        },
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
            spells: [SpellsConfig.firebolt]
        },
        attributes: {
            strength: 5,
            dexterity: 5,
            intelligence: 5
        },
        image: '',
        isPlayerControlled: true,
        statuses: []
    };
    this.game = game;
    this.map = this.game.activeMap;
    this.characters = this.game.add.group();

    this.addNewCharacter = (x, y, spriteName) => {
        var character = this.game.physics.add.sprite(x, y, spriteName).setOrigin(0, 0);
        character.characterConfig = lodash.cloneDeep(this.characterConfig);
        character.characterConfig.posX = x;
        character.characterConfig.posY = y;
        character.characterConfig.image = spriteName;
        this.characters.add(character);
    };

    this.moveActiveCharacterToTile = (tile) => {
        var posX = tile.x,
            posY = tile.y;
        this._moveActiveCharacter(posX, posY);
    };

    this.moveActiveCharacterNearObject = (object, pathX, pathY) => {
        var posX = object ? object.x : pathX * 50,
            posY = object ? object.y : pathY * 50;
        this._moveActiveCharacter(posX, posY);
    };

    this.stopActiveCharacter = () => {
        var currentCharacter = this.game.activeCharacter,
            charConfig = currentCharacter.characterConfig;
        //reduce speed on X
        this._reduceSpeedX(currentCharacter);

        //reduce speed on Y
        this._reduceSpeedY(currentCharacter);

        //show grid if stopped
        if (currentCharacter.x === charConfig.posX &&
            currentCharacter.y === charConfig.posY && !this.game.activeMap.isMovementGridShown) {
            if (charConfig.path.length === 0) {
                this.game.events.emit('activeCharacterActed', currentCharacter, this.game.characters);
                this.game.activeMap.showMovementGrid(currentCharacter);
                this._checkIfObjectInteractionInProgress(charConfig.minorActions.inProgress);
            }
            charConfig.movement.isMoving = false;
        }
    };

    this.keepMovingActiveCharacter = () => {
        var currentCharacter = this.game.activeCharacter,
            charConfig = currentCharacter.characterConfig;
        if (!charConfig.movement.isMoving && charConfig.path.length > 0) {
            this._moveCharacter(currentCharacter);
        }
    };

    this.interactWithObject = (object) => {
        var character = this.game.activeCharacter,
            charConfig = character.characterConfig;
        charConfig.minorActions.inProgress = null;
        if (object.objectConfig.isInteractible && charConfig.minorActions.max - charConfig.minorActions.spent > 0) {
            var obj = this.game.activeMap.getObjRealCoords(object);
            // If object within reach try the interaction
            if (Math.abs(character.x - obj.x) <= 50 && Math.abs(character.y - obj.y) <= 50 &&
                (Math.abs(character.x - obj.x) > 0 || Math.abs(character.y - obj.y) > 0)) {
                object.x = obj.x;
                object.y = obj.y;
                actionManager.interactWithObject(object);
                // Otherwise move near the object and try again
            } else if (Math.abs(character.x - obj.x) !== 0 || Math.abs(character.y - obj.y) !== 0) {
                charConfig.minorActions.inProgress = object;
                var path = Pathfinder.getPathFromAToB(character, object, this.game.activeMap.levelMap);
                this.moveActiveCharacterNearObject(null, path[path.length - 2][0], path[path.length - 2][1]);
            }
        }
    };

    this.interactWithEnemy = (enemy) => {
        var character = this.game.activeCharacter,
            charConfig = character.characterConfig;
        charConfig.minorActions.inProgress = null;
        if (charConfig.actions.max - charConfig.actions.spent > 0) {
            actionManager.interactWithEnemy(enemy);
        }
    };

    this.check = () => {
        var charConfig = this.game.activeCharacter.characterConfig;
        if (charConfig.movement.isMoving) {
            this.game.events.emit('activeCharacterPositionModified', this.game.activeCharacter);
            this.game.characters.stopActiveCharacter();
        } else if (!charConfig.movement.isMoving &&
            charConfig.path.length > 0) {
            this.game.characters.keepMovingActiveCharacter();
        }
    };

    this.pickUpItem = (item) => {
        var character = this.game.activeCharacter,
            charConfig = character.characterConfig;
        if (Math.abs(character.x - item.x) <= 50 && Math.abs(character.y - item.y) <= 50 &&
            (Math.abs(character.x - item.x) >= 0 || Math.abs(character.y - item.y) >= 0)) {
            if (charConfig.minorActions.max - charConfig.minorActions.spent > 0) {
                if (charConfig.inventory.slots.free >= item.itemConfig.slots) {
                    charConfig.minorActions.spent++;
                    if (charConfig.inventory.mainHand.id === InventoryConfig.punch.id) {
                        charConfig.inventory.mainHand = item.itemConfig;
                        if (item.itemConfig.hold === 2) {
                            charConfig.inventory.offHand = item.itemConfig;
                        }
                    } else {
                        charConfig.inventory.slots.items.push(item.itemConfig);
                        charConfig.inventory.slots.free--;
                    }
                    item.destroy();
                    this.game.items.remove(item);
                }
                this.game.events.emit('activeCharacterActed', character, this.game.characters);
            }
        }
        this.moveActiveCharacterToTile(item);
    };

    // Private -----------------------------------------------------------------------------------------------------
    this._moveCharacter = function(currentCharacter) {
        var charConfig = currentCharacter.characterConfig;
        charConfig.movement.spent++;
        charConfig.movement.isMoving = true;
        charConfig.posX = charConfig.path[0][0] * 50;
        charConfig.posY = charConfig.path[0][1] * 50;
        charConfig.path.shift();
        if (charConfig.posX > currentCharacter.x && charConfig.posY > currentCharacter.y) {
            currentCharacter.setVelocity(charConfig.velocity, charConfig.velocity);
        } else if (charConfig.posX < currentCharacter.x && charConfig.posY < currentCharacter.y) {
            currentCharacter.setVelocity(-1 * charConfig.velocity, -1 * charConfig.velocity);
        } else if (charConfig.posX < currentCharacter.x && charConfig.posY > currentCharacter.y) {
            currentCharacter.setVelocity(-1 * charConfig.velocity, charConfig.velocity);
        } else if (charConfig.posX > currentCharacter.x && charConfig.posY < currentCharacter.y) {
            currentCharacter.setVelocity(charConfig.velocity, -1 * charConfig.velocity);
        } else if (charConfig.posX > currentCharacter.x) {
            currentCharacter.setVelocityX(charConfig.velocity);
        } else if (charConfig.posX < currentCharacter.x) {
            currentCharacter.setVelocityX(-1 * charConfig.velocity);
        } else if (charConfig.posY > currentCharacter.y) {
            currentCharacter.setVelocityY(charConfig.velocity);
        } else if (charConfig.posY < currentCharacter.y) {
            currentCharacter.setVelocityY(-1 * charConfig.velocity);
        }
        this.game.events.emit('activeCharacterActed', currentCharacter, this.game.characters);
    };

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

    this._moveActiveCharacter = (posX, posY) => {
        var currentCharacter = this.game.activeCharacter,
            charConfig = currentCharacter.characterConfig;
        if (!charConfig.movement.isMoving &&
            (currentCharacter.x !== posX || currentCharacter.y !== posY)) {
            if (!this._isTileOccupied(posX, posY)) {
                var auxMap = this.game.activeMap.addEnemiesToMap(this.game.enemies),
                    pathWay = Pathfinder.findWay(currentCharacter.x / 50, currentCharacter.y / 50, posX / 50, posY / 50, auxMap);
                charConfig.path = pathWay || [];
                if (pathWay.length > 0) {
                    charConfig.path.shift();
                    // if there was a click on an object close to the limit of movement, move near object
                    if (charConfig.minorActions.inProgress && charConfig.path.length === charConfig.movement.max + 1) {
                        charConfig.path.pop();
                    }

                    if (charConfig.path.length <= charConfig.movement.max - charConfig.movement.spent) {
                        this._moveCharacter(currentCharacter);
                        game.activeMap.hideMovementGrid();
                    } else if (charConfig.path.length > charConfig.movement.max - charConfig.movement.spent) {
                        charConfig.path = [];
                    }
                }
            }
        }
    };

    this._isTileOccupied = (posX, posY) => {
        var isObstacleInTheWay = false;
        _.each(this.game.enemies.characters.getChildren(), function(enemy) {
            if (enemy.x === posX && enemy.y === posY) {
                isObstacleInTheWay = true;
            }
        });
        _.each(this.game.characters.characters.getChildren(), function(character) {
            if (character.x === posX && character.y === posY) {
                isObstacleInTheWay = true;
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
            if (object.objectConfig) {
                this.interactWithObject(object);
            }
        }
    };
};