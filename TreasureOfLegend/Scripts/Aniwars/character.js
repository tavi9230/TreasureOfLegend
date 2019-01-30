import {Pathfinder} from 'Aniwars/pathfinder';
import {EnumHelper} from 'Aniwars/enumHelper';
import {ActionManager} from 'Aniwars/actionManager';
import {InventoryConfig} from 'Aniwars/inventoryConfig';
import {SpellsConfig} from 'Aniwars/spellsConfig';

export const Character = function(game) {
    var actionManager = new ActionManager(game);

    this.characterConfig = {
        path: [],
        armor: 0,
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
            max: 2,
            spent: 0,
            actionId: -1,
            selectedAction: null
        },
        minorActions: {
            max: 10,
            spent: 0,
            inProgress: null
        },
        inventory: {
            mainHand: lodash.cloneDeep(InventoryConfig.defaultMainHand),
            offHand: lodash.cloneDeep(InventoryConfig.defaultMainHand),
            head: lodash.cloneDeep(InventoryConfig.defaultHead),
            body: lodash.cloneDeep(InventoryConfig.defaultBody),
            feet: lodash.cloneDeep(InventoryConfig.defaultFeet),
            hands: lodash.cloneDeep(InventoryConfig.defaultHands),
            slots: {
                free: 2,
                max: 2,
                items: []
            },
            spells: []
        },
        attributes: {
            strength: 0,
            dexterity: 0,
            intelligence: 0
        },
        skillsToBuy: [SpellsConfig.firebolt],
        activeSkills: [],
        image: '',
        isPlayerControlled: true,
        statuses: [],
        resistances: [],
        vulnerabilities: [],
        invulnerabilities: [],
        experience: {
            current: 0,
            nextLevel: 200,
            attributePoints: 0
        },
        level: 1
    };
    this.game = game;
    this.map = this.game.activeMap;
    this.characters = this.game.add.group();
    this.souls = {
        current: 0,
        nextLevel: 5,
        skillPoints: 0
    };

    this.addNewCharacter = (x, y, spriteName) => {
        var character = this.game.physics.add.sprite(x, y, spriteName).setOrigin(0, 0);
        character.characterConfig = lodash.cloneDeep(this.characterConfig);
        var charConfig = character.characterConfig;
        charConfig.posX = x;
        charConfig.posY = y;
        charConfig.image = spriteName;
        charConfig.armor = charConfig.inventory.head.armor +
            charConfig.inventory.body.armor +
            charConfig.inventory.hands.armor +
            charConfig.inventory.feet.armor +
            (charConfig.inventory.offHand.armor
            ? charConfig.inventory.offHand.armor
            : 0);
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
            if (charConfig.minorActions.max - charConfig.minorActions.spent > 0
                && this._addItemToInventory(charConfig, lodash.cloneDeep(item.itemConfig))) {
                charConfig.minorActions.spent++;
                item.destroy();
                this.game.items.remove(item);
                this.game.events.emit('activeCharacterActed', character, this.game.characters);
            }
        } else {
            this.moveActiveCharacterToTile(item);
        }
    };

    this.dropItem = (itemToDrop) => {
        var character = this.game.activeCharacter,
            charConfig = character.characterConfig,
            self = this;
        if (itemToDrop.isEquipped) {
            if (itemToDrop.type === EnumHelper.inventoryEnum.mainHand) {
                if (itemToDrop.hold === 2) {
                    charConfig.inventory.offHand.isEquipped = false;
                    charConfig.inventory.offHand = lodash.cloneDeep(InventoryConfig.defaultMainHand);
                }
                charConfig.inventory.mainHand.isEquipped = false;
                charConfig.inventory.mainHand = lodash.cloneDeep(InventoryConfig.defaultMainHand);
            } else if (itemToDrop.type === EnumHelper.inventoryEnum.offHand) {
                if (itemToDrop.hold === 2) {
                    charConfig.inventory.mainHand.isEquipped = false;
                    charConfig.inventory.mainHand = lodash.cloneDeep(InventoryConfig.defaultMainHand);
                }
                if (itemToDrop.armor) {
                    charConfig.armor -= itemToDrop.armor;
                }
                charConfig.inventory.offHand.isEquipped = false;
                charConfig.inventory.offHand = lodash.cloneDeep(InventoryConfig.defaultMainHand);
            } else if (itemToDrop.type === EnumHelper.inventoryEnum.body) {
                charConfig.armor -= itemToDrop.armor;
                charConfig.inventory.body.isEquipped = false;
                charConfig.inventory.body = lodash.cloneDeep(InventoryConfig.defaultBody);
            } else if (itemToDrop.type === EnumHelper.inventoryEnum.head) {
                charConfig.armor -= itemToDrop.armor;
                charConfig.inventory.head.isEquipped = false;
                charConfig.inventory.head = lodash.cloneDeep(InventoryConfig.defaultHead);
            } else if (itemToDrop.type === EnumHelper.inventoryEnum.hands) {
                charConfig.armor -= itemToDrop.armor;
                charConfig.inventory.hands.isEquipped = false;
                charConfig.inventory.hands = lodash.cloneDeep(InventoryConfig.defaultHands);
            } else if (itemToDrop.type === EnumHelper.inventoryEnum.feet) {
                charConfig.armor -= itemToDrop.armor;
                charConfig.inventory.feet.isEquipped = false;
                charConfig.inventory.feet = lodash.cloneDeep(InventoryConfig.defaultFeet);
            }
        } else {
            var index = charConfig.inventory.slots.items.indexOf(itemToDrop);
            charConfig.inventory.slots.items.splice(index, 1);
        }
        var item = this.game.physics.add.sprite(character.x, character.y, itemToDrop.image).setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.itemConfig = lodash.cloneDeep(itemToDrop);
        this.game.items.add(item);
        charConfig.inventory.slots.free++;
        character.setDepth(1);
        this.game.events.emit('activeCharacterActed', character, this.game.characters);
        this.game.input.setHitArea([item]);
        item.on('pointerdown', _.bind(self.game.characters.pickUpItem, self, item));
        item.on('pointerover', _.bind(self.game.activeMap.highlightPathToItem, self, item));
    };

    this.replaceItem = (itemToReplace) => {
        var character = this.game.activeCharacter,
            charConfig = character.characterConfig;
        if (charConfig.minorActions.max - charConfig.minorActions.spent > 0) {
            var index = charConfig.inventory.slots.items.indexOf(itemToReplace);
            itemToReplace.isEquipped = true;
            if (itemToReplace.type === EnumHelper.inventoryEnum.mainHand) {
                charConfig.inventory.mainHand.isEquipped = false;
                if (charConfig.inventory.mainHand.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                    charConfig.inventory.slots.items.splice(index, 1, lodash.cloneDeep(charConfig.inventory.mainHand));
                    index++;
                } else {
                    charConfig.inventory.slots.items.splice(index, 1);
                }
                if (itemToReplace.hold === 2) {
                    if (charConfig.inventory.offHand.armor) {
                        charConfig.armor -= charConfig.inventory.offHand.armor;
                    }
                    charConfig.inventory.offHand.isEquipped = false;
                    charConfig.inventory.slots.items.splice(index, 1, lodash.cloneDeep(charConfig.inventory.offHand));
                    charConfig.inventory.offHand = lodash.cloneDeep(itemToReplace);
                }
                if (charConfig.inventory.mainHand.hold === 2) {
                    charConfig.inventory.offHand.isEquipped = false;
                    charConfig.inventory.offHand = lodash.cloneDeep(InventoryConfig.defaultMainHand);
                }
                charConfig.inventory.mainHand = lodash.cloneDeep(itemToReplace);
            } else if (itemToReplace.type === EnumHelper.inventoryEnum.offHand) {
                charConfig.inventory.offHand.isEquipped = false;
                if (charConfig.inventory.offHand.armor) {
                    charConfig.armor -= charConfig.inventory.offHand.armor;
                }
                if (charConfig.inventory.offHand.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                    charConfig.inventory.slots.items.splice(index, 1, lodash.cloneDeep(charConfig.inventory.offHand));
                    index++;
                } else {
                    charConfig.inventory.slots.items.splice(index, 1);
                }
                if (itemToReplace.hold === 2) {
                    charConfig.inventory.mainHand.isEquipped = false;
                    charConfig.inventory.slots.items.splice(index, 1, lodash.cloneDeep(charConfig.inventory.mainHand));
                    charConfig.inventory.mainHand = lodash.cloneDeep(itemToReplace);
                }
                if (charConfig.inventory.mainHand.hold === 2) {
                    charConfig.inventory.mainHand = lodash.cloneDeep(InventoryConfig.defaultMainHand);
                }
                if (itemToReplace.armor) {
                    charConfig.armor += itemToReplace.armor;
                }
                charConfig.inventory.offHand = lodash.cloneDeep(itemToReplace);
            } else if (itemToReplace.type === EnumHelper.inventoryEnum.body) {
                charConfig.inventory.body.isEquipped = false;
                charConfig.armor -= charConfig.inventory.body.armor;
                if (charConfig.inventory.body.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                    charConfig.inventory.slots.items.splice(index, 1, lodash.cloneDeep(charConfig.inventory.body));
                } else {
                    charConfig.inventory.slots.items.splice(index, 1);
                }
                charConfig.armor += itemToReplace.armor;
                charConfig.inventory.body = lodash.cloneDeep(itemToReplace);
            } else if (itemToReplace.type === EnumHelper.inventoryEnum.head) {
                charConfig.inventory.head.isEquipped = false;
                charConfig.armor -= charConfig.inventory.body.head;
                if (charConfig.inventory.head.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                    charConfig.inventory.slots.items.splice(index, 1, lodash.cloneDeep(charConfig.inventory.head));
                } else {
                    charConfig.inventory.slots.items.splice(index, 1);
                }
                charConfig.armor += itemToReplace.armor;
                charConfig.inventory.head = lodash.cloneDeep(itemToReplace);
            } else if (itemToReplace.type === EnumHelper.inventoryEnum.hands) {
                charConfig.inventory.hands.isEquipped = false;
                charConfig.armor -= charConfig.inventory.body.hands;
                if (charConfig.inventory.hands.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                    charConfig.inventory.slots.items.splice(index, 1, lodash.cloneDeep(charConfig.inventory.hands));
                } else {
                    charConfig.inventory.slots.items.splice(index, 1);
                }
                charConfig.armor += itemToReplace.armor;
                charConfig.inventory.hands = lodash.cloneDeep(itemToReplace);
            } else if (itemToReplace.type === EnumHelper.inventoryEnum.feet) {
                charConfig.inventory.feet.isEquipped = false;
                charConfig.armor -= charConfig.inventory.feet.armor;
                if (charConfig.inventory.feet.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                    charConfig.inventory.slots.items.splice(index, 1, lodash.cloneDeep(charConfig.inventory.feet));
                } else {
                    charConfig.inventory.slots.items.splice(index, 1);
                }
                charConfig.armor += itemToReplace.armor;
                charConfig.inventory.feet = lodash.cloneDeep(itemToReplace);
            }
            charConfig.minorActions.spent++;
            this.game.events.emit('activeCharacterActed', character, this.game.characters);
        }
    };

    this.addItemFromList = (item, lootbag) => {
        // TODO: Add item to active character inventory and remove it from the lootbag
        // and emit event to show changes in both char inventory and lootbag inventory
        var character = this.game.activeCharacter,
            charConfig = character.characterConfig;
        if (charConfig.minorActions.max - charConfig.minorActions.spent > 0
            && this._addItemToInventory(charConfig, lodash.cloneDeep(item))) {
            charConfig.minorActions.spent++;
            var lootbagConfig = lootbag.objectConfig.belongsTo.characterConfig;
            var index = lootbagConfig.inventory.slots.items.indexOf(item);
            lootbagConfig.inventory.slots.items.splice(index, 1);

            if (lootbagConfig.inventory.slots.items.length === 0
                && lootbagConfig.inventory.mainHand.type === EnumHelper.inventoryEnum.defaultEquipment
                && lootbagConfig.inventory.offHand.type === EnumHelper.inventoryEnum.defaultEquipment
                && lootbagConfig.inventory.head.type === EnumHelper.inventoryEnum.defaultEquipment
                && lootbagConfig.inventory.body.type === EnumHelper.inventoryEnum.defaultEquipment
                && lootbagConfig.inventory.hands.type === EnumHelper.inventoryEnum.defaultEquipment
                && lootbagConfig.inventory.feet.type === EnumHelper.inventoryEnum.defaultEquipment) {
                this.game.activeMap.deadCharacters.remove(lootbag);
                lootbag.destroy();
                this.game.events.emit('closeLootbag');
                // TODO: close lootbag and character config window
                // TODO: don't let player click on the same item more than once
            }
            if (lootbagConfig.inventory.slots.items.length > 0) {
                this.game.events.emit('showDeadCharacterInventory', lootbag);
            }
            this.game.events.emit('activeCharacterActed', character, this.game.characters);
        }
    };

    this.updateAttributes = (index) => {
        var activeCharacter = this.game.activeCharacter;
        if (index === EnumHelper.attributeEnum.strength) {
            activeCharacter.characterConfig.attributes.strength++;
        } else if (index === EnumHelper.attributeEnum.dexterity) {
            activeCharacter.characterConfig.attributes.dexterity++;
        } else if (index === EnumHelper.attributeEnum.intelligence) {
            activeCharacter.characterConfig.attributes.intelligence++;
        }
        activeCharacter.characterConfig.experience.attributePoints--;
        this.game.events.emit('activeCharacterActed', activeCharacter, this.game.characters);
    };

    this.buySkill = (skill) => {
        var activeCharacter = this.game.activeCharacter,
            charConfig = activeCharacter.characterConfig;
        if (!skill.isPassive && skill.isSpell) {
            var index = charConfig.inventory.spells.indexOf(skill);
            if (index < 0) {
                skill.level++;
                charConfig.inventory.spells.push(skill);
            } else {
                var level = charConfig.inventory.spells[index].level;
                if (level < charConfig.inventory.spells[index].maxLevel) {
                    charConfig.inventory.spells[index].level++;
                }
            }
        }
        this.souls.skillPoints--;
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
                        charConfig.minorActions.inProgress = null;
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

    this._addItemToInventory = (charConfig, newItem) => {
        var itemAdded = false;
        if (charConfig.inventory.mainHand.type === EnumHelper.inventoryEnum.defaultEquipment &&
            newItem.type === EnumHelper.inventoryEnum.mainHand) {
            if (charConfig.inventory.offHand.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                if (newItem.hold === 1) {
                    charConfig.inventory.mainHand = newItem;
                    newItem.isEquipped = true;
                    itemAdded = true;
                } else {
                    newItem.isEquipped = false;
                    charConfig.inventory.slots.items.push(newItem);
                    charConfig.inventory.slots.free--;
                    itemAdded = true;
                }
            } else {
                if (newItem.hold === 2) {
                    charConfig.inventory.offHand = newItem;
                }
                charConfig.inventory.mainHand = newItem;
                newItem.isEquipped = true;
                itemAdded = true;
            }
        } else if (charConfig.inventory.offHand.type === EnumHelper.inventoryEnum.defaultEquipment &&
            newItem.type === EnumHelper.inventoryEnum.offHand) {
            if (newItem.hold === 2) {
                charConfig.inventory.mainHand = newItem;
            }
            charConfig.inventory.offHand = newItem;
            newItem.isEquipped = true;
            if (newItem.armor) {
                charConfig.armor += newItem.armor;
            }
            itemAdded = true;
        } else if (charConfig.inventory.head.type === EnumHelper.inventoryEnum.defaultEquipment &&
            newItem.type === EnumHelper.inventoryEnum.head) {
            charConfig.inventory.head = newItem;
            newItem.isEquipped = true;
            charConfig.armor += newItem.armor;
            itemAdded = true;
        } else if (charConfig.inventory.body.type === EnumHelper.inventoryEnum.defaultEquipment &&
            newItem.type === EnumHelper.inventoryEnum.body) {
            charConfig.inventory.body = newItem;
            newItem.isEquipped = true;
            charConfig.armor += newItem.armor;
            itemAdded = true;
        } else if (charConfig.inventory.hands.type === EnumHelper.inventoryEnum.defaultEquipment &&
            newItem.type === EnumHelper.inventoryEnum.hands) {
            charConfig.inventory.hands = newItem;
            newItem.isEquipped = true;
            charConfig.armor += newItem.armor;
            itemAdded = true;
        } else if (charConfig.inventory.feet.type === EnumHelper.inventoryEnum.defaultEquipment &&
            newItem.type === EnumHelper.inventoryEnum.feet) {
            charConfig.inventory.feet = newItem;
            newItem.isEquipped = true;
            charConfig.armor += newItem.armor;
            itemAdded = true;
        } else if (charConfig.inventory.slots.free >= newItem.slots) {
            newItem.isEquipped = false;
            charConfig.inventory.slots.items.push(newItem);
            charConfig.inventory.slots.free--;
            itemAdded = true;
        }
        return itemAdded;
    };
};