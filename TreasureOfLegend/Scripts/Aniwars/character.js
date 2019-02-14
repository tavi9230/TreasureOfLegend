import { Pathfinder } from 'Aniwars/Helpers/pathfinder';
import { EnumHelper } from 'Aniwars/Helpers/enumHelper';
import { ActionManager } from 'Aniwars/Managers/actionManager';
import { InventoryConfig } from 'Aniwars/Configurations/inventoryConfig';
import { EnergyConfig } from 'Aniwars/Configurations/energyConfig';
import { StatusIconConfig } from 'Aniwars/Configurations/statusIconConfig';
import { CharacterConfig } from 'Aniwars/Configurations/characterConfig';

export const Character = function (game) {
    var actionManager = new ActionManager(game),
        game = game;
    this.characters = game.add.group();
    this.souls = {
        current: 0,
        nextLevel: 1,
        skillPoints: 1
    };

    this.addNewCharacter = (x, y, spriteName) => {
        var character = game.physics.add.sprite(x, y, spriteName).setOrigin(0, 0.5);
        character.height = 50;
        character.width = 50;
        character.characterConfig = lodash.cloneDeep(lodash.cloneDeep(CharacterConfig.config));
        character.characterConfig.inventory.mainHand = lodash.cloneDeep(character.characterConfig.inventory.mainHand);
        character.characterConfig.inventory.offHand = lodash.cloneDeep(character.characterConfig.inventory.offHand);
        character.characterConfig.inventory.head = lodash.cloneDeep(character.characterConfig.inventory.head);
        character.characterConfig.inventory.body = lodash.cloneDeep(character.characterConfig.inventory.body);
        character.characterConfig.inventory.feet = lodash.cloneDeep(character.characterConfig.inventory.feet);
        character.characterConfig.inventory.hands = lodash.cloneDeep(character.characterConfig.inventory.hands);
        character.characterConfig.inventory.spells = lodash.cloneDeep(character.characterConfig.inventory.spells);
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
                : 0) + charConfig.naturalArmor;
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

    this.interactWithObject = (object) => {
        var character = game.activeCharacter,
            charConfig = character.characterConfig;
        charConfig.energy.inProgress = null;
        if (object.objectConfig.isInteractible && charConfig.energy.max - charConfig.energy.spent > 0 && !charConfig.movement.isMoving) {
            var obj = {
                x: object.x,
                y: object.y
            },
                isWithinReach = false;
            if (Math.floor(object.objectConfig.id) === EnumHelper.idEnum.door.id) {
                obj = game.activeMap.getObjRealCoords(object);
                if (Math.abs(character.x - obj.x) <= 50 && Math.abs(character.y - obj.y) <= 50 &&
                    (Math.abs(character.x - obj.x) > 0 || Math.abs(character.y - obj.y) > 0)) {
                    isWithinReach = true;
                    object.x = obj.x;
                    object.y = obj.y;
                }
            } else if (Math.floor(object.objectConfig.id) === EnumHelper.idEnum.well.id) {
                var XY = Math.abs(character.x - object.x) <= 50 &&
                    Math.abs(character.y - object.y) <= 50 &&
                    (Math.abs(character.x - object.x) > 0 || Math.abs(character.y - object.y) > 0),
                    plusXY = Math.abs(character.x - (object.x + (object.width / 2))) <= 50 && Math.abs(character.y - object.y) <= 50 &&
                        (Math.abs(character.x - (object.x + (object.width / 2))) > 0 || Math.abs(character.y - object.y)) > 0,
                    XplusY = Math.abs(character.x - object.x) <= 50 && Math.abs(character.y - (object.y + (object.height / 2))) <= 50 &&
                        (Math.abs(character.x - object.x) > 0 || Math.abs(character.y - (object.y + (object.height / 2)))) > 0,
                    plusXplusY = Math.abs(character.x - (object.x + (object.width / 2))) <= 50 && Math.abs(character.y - (object.y + (object.height / 2))) <= 50 &&
                        (Math.abs(character.x - (object.x + (object.width / 2))) > 0 || Math.abs(character.y - (object.y + (object.height / 2)))) > 0;
                if (XY || plusXY || XplusY || plusXplusY) {
                    isWithinReach = true;
                }
            } else if (Math.abs(character.x - obj.x) <= 50 && Math.abs(character.y - obj.y) <= 50 &&
                (Math.abs(character.x - obj.x) > 0 || Math.abs(character.y - obj.y) > 0)) {
                isWithinReach = true;
            }

            // If object within reach try the interaction
            if (isWithinReach) {
                actionManager.interactWithObject(object);
                // Otherwise move near the object and try again
            } else if (Math.abs(character.x - obj.x) !== 0 || Math.abs(character.y - obj.y) !== 0) {
                var path = Pathfinder.getPathFromAToB(character, object, game.activeMap.levelMap);
                if (path) {
                    if (!this._isTileOccupied(path[path.length - 2][0] * 50, path[path.length - 2][1] * 50)) {
                        charConfig.energy.inProgress = object;
                        this.moveActiveCharacterNearObject(null, path[path.length - 2][0], path[path.length - 2][1]);
                    } else {
                        var auxMap = [];
                        auxMap = game.activeMap.copyMap(game.activeMap.levelMap, auxMap);
                        auxMap[path[path.length - 2][1]][path[path.length - 2][0]] = 1;
                        path = Pathfinder.getPathFromAToB(character, object, auxMap);
                        if (path) {
                            charConfig.energy.inProgress = object;
                            this.moveActiveCharacterNearObject(null, path[path.length - 2][0], path[path.length - 2][1]);
                        }
                    }
                }
            }
        }
    };

    this.interactWithEnemy = (enemy) => {
        var character = game.activeCharacter,
            charConfig = character.characterConfig;
        charConfig.energy.inProgress = null;
        if (charConfig.energy.max - charConfig.energy.spent > 0) {
            actionManager.interactWithEnemy(enemy);
        }
    };

    this.check = () => {
        var currentCharacter = game.activeCharacter,
            charConfig = currentCharacter.characterConfig;
        if (!charConfig.movement.isMoving && charConfig.path.length > 0) {
            this._moveCharacter(currentCharacter);
        }
    };

    this.pickUpItem = (item) => {
        var character = game.activeCharacter,
            charConfig = character.characterConfig;
        if (Math.abs(character.x - item.x) <= 50 && Math.abs(character.y - item.y) <= 50 &&
            (Math.abs(character.x - item.x) >= 0 || Math.abs(character.y - item.y) >= 0)) {
            if (charConfig.energy.max - charConfig.energy.spent > 0 && this._addItemToInventory(charConfig, item.itemConfig)) {
                charConfig.energy.spent += EnergyConfig.pickup.cost;
                StatusIconConfig.showEnergyIcon(game, character, EnergyConfig.pickup.cost);
                item.destroy();
                game.items.remove(item);
                game.events.emit('showCharacterInitiative', game.initiative);
                game.events.emit('refreshCharacterInventory', character);
                if (character.characterConfig.energy.actionId === 1) {
                    game.events.emit('showSelectedActionIcon', character.characterConfig.inventory.mainHand.image);
                }
            }
        } else {
            charConfig.energy.inProgress = item;
            this.moveActiveCharacterToTile(item);
        }
    };

    this.dropItem = (itemToDrop) => {
        var character = game.activeCharacter,
            charConfig = character.characterConfig,
            self = this;
        if (itemToDrop.isEquipped) {
            if (itemToDrop.type === EnumHelper.inventoryEnum.mainHand) {
                charConfig.inventory.mainHand.isEquipped = false;
                charConfig.inventory.mainHand = lodash.cloneDeep(InventoryConfig.defaultMainHand);
            } else if (itemToDrop.type === EnumHelper.inventoryEnum.offHand) {
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
        var item = game.physics.add.sprite(character.x, character.y, itemToDrop.image).setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.itemConfig = lodash.cloneDeep(itemToDrop);
        game.items.add(item);
        character.setDepth(1);
        game.input.setHitArea([item]);
        item.on('pointerdown', _.bind(game.characters.pickUpItem, self, item));
        item.on('pointerover', _.bind(game.activeMap.highlightPathToItem, self, item));
        game.events.emit('refreshCharacterInventory', character);
        if (character.characterConfig.energy.actionId === 1) {
            game.events.emit('showSelectedActionIcon', character.characterConfig.inventory.mainHand.image);
        }
    };

    this.replaceItem = (itemToReplace) => {
        var character = game.activeCharacter,
            charConfig = character.characterConfig;
        if (charConfig.energy.max - charConfig.energy.spent > 0) {
            var index = charConfig.inventory.slots.items.indexOf(itemToReplace);
            if (itemToReplace.type === EnumHelper.inventoryEnum.mainHand) {
                charConfig.inventory.mainHand.isEquipped = false;
                if (charConfig.inventory.mainHand.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                    charConfig.inventory.slots.items.splice(index, 1, lodash.cloneDeep(charConfig.inventory.mainHand));
                } else {
                    charConfig.inventory.slots.items.splice(index, 1);
                }
                charConfig.inventory.mainHand = lodash.cloneDeep(itemToReplace);
                charConfig.inventory.mainHand.isEquipped = true;
            } else if (itemToReplace.type === EnumHelper.inventoryEnum.offHand) {
                charConfig.inventory.offHand.isEquipped = false;
                if (charConfig.inventory.offHand.armor) {
                    charConfig.armor -= charConfig.inventory.offHand.armor;
                }
                if (charConfig.inventory.offHand.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                    charConfig.inventory.slots.items.splice(index, 1, lodash.cloneDeep(charConfig.inventory.offHand));
                } else {
                    charConfig.inventory.slots.items.splice(index, 1);
                }
                if (itemToReplace.armor) {
                    charConfig.armor += itemToReplace.armor;
                }
                charConfig.inventory.offHand = lodash.cloneDeep(itemToReplace);
                charConfig.inventory.offHand.isEquipped = true;
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
                charConfig.inventory.body.isEquipped = true;
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
                charConfig.inventory.head.isEquipped = true;
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
                charConfig.inventory.hands.isEquipped = true;
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
                charConfig.inventory.feet.isEquipped = true;
            }
            charConfig.energy.spent += EnergyConfig.pickup.cost;
            StatusIconConfig.showEnergyIcon(game, character, EnergyConfig.pickup.cost);
            game.events.emit('showCharacterInitiative', game.initiative);
            game.events.emit('refreshCharacterInventory', character);
            if (character.characterConfig.energy.actionId === 1) {
                game.events.emit('showSelectedActionIcon', character.characterConfig.inventory.mainHand.image);
            }
        }
    };

    this.addItemFromList = (item, lootbag) => {
        var character = game.activeCharacter,
            charConfig = character.characterConfig;
        if (charConfig.energy.max - charConfig.energy.spent > 0 && this._addItemToInventory(charConfig, item)) {
            charConfig.energy.spent += EnergyConfig.pickup.cost;
            StatusIconConfig.showEnergyIcon(game, character, EnergyConfig.pickup.cost);
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
                game.activeMap.deadCharacters.remove(lootbag);
                lootbag.destroy();
                game.events.emit('showDeadCharacterInventory', lootbag);
                game.events.emit('closeLootbag');
            }
            if (lootbagConfig.inventory.slots.items.length > 0) {
                game.events.emit('showDeadCharacterInventory', lootbag);
            }
            game.events.emit('showCharacterInitiative', game.initiative);
            if (character.characterConfig.energy.actionId === 1) {
                game.events.emit('showSelectedActionIcon', character.characterConfig.inventory.mainHand.image);
            }
        }
    };

    this.updateAttributes = (index) => {
        var activeCharacter = game.activeCharacter;
        if (index === EnumHelper.attributeEnum.strength) {
            activeCharacter.characterConfig.attributes.strength++;
        } else if (index === EnumHelper.attributeEnum.dexterity) {
            activeCharacter.characterConfig.attributes.dexterity++;
        } else if (index === EnumHelper.attributeEnum.intelligence) {
            activeCharacter.characterConfig.attributes.intelligence++;
        }
        activeCharacter.characterConfig.experience.attributePoints--;
        game.events.emit('updateStats', activeCharacter);
    };

    this.buySkill = (skill) => {
        if (skill.level < skill.maxLevel) {
            skill.level++;
            this.souls.skillPoints--;
        }
    };

    this.useDash = () => {
        var activeCharacter = game.activeCharacter;
        if (!activeCharacter.characterConfig.movement.usedDash &&
            activeCharacter.characterConfig.energy.max - activeCharacter.characterConfig.energy.spent >= EnergyConfig.dash.cost
            && activeCharacter.characterConfig.movement.max - activeCharacter.characterConfig.movement.spent === 0) {
            activeCharacter.characterConfig.movement.usedDash = true;
            StatusIconConfig.showMovementIcon(game, activeCharacter, -activeCharacter.characterConfig.movement.spent);
            activeCharacter.characterConfig.movement.spent = 0;
            activeCharacter.characterConfig.energy.spent += EnergyConfig.dash.cost;
            StatusIconConfig.showEnergyIcon(game, activeCharacter, EnergyConfig.dash.cost);
            game.activeMap.showMovementGrid();
            game.events.emit('showCharacterInitiative', game.initiative);
        } else {
            if (!activeCharacter.characterConfig.movement.usedDash) {
                game.events.emit('deselectButtons', 'walkButton');
            }
        }
    };

    this.inspect = (object) => {
        if (this.inspectionBox) {
            this.inspectionBox.destroy(true);
        }
        this.inspectionBox = game.add.group();
        var panel = game.add.graphics(),
            textPanel,
            text = '',
            x = object.x,
            y = object.y,
            style = {
                fontSize: 20,
                wordWrap: { width: 96, useAdvancedWrap: true }
            };
        if (object.objectConfig) {
            text = object.objectConfig.description;
        } else if (object.characterConfig) {
            text = object.characterConfig.description;
        }
        if (x === game.activeMap.levelMap[0].length * 50 - 50) {
            x -= 100;
        }
        if (y === game.activeMap.levelMap.length * 50 - 50) {
            y -= 100;
        }
        textPanel = game.add.text(x + 2, y + 2, text, style);
        panel.fillStyle(0x111111, 1);
        panel.fillRect(x, y, textPanel.width + 4, textPanel.height + 4);
        this.inspectionBox.add(panel);
        this.inspectionBox.add(textPanel);
        game.events.emit('removeSelectedActionIcon');
    };

    this.closeInspect = function () {
        if (this.inspectionBox) {
            this.inspectionBox.destroy(true);
            this.inspectionBox = null;
        }
    };

    this.showRangeLine = function (character, enemy) {
        actionManager.showRangeLines(character, enemy);
    };

    this.hideRangeLine = function () {
        actionManager.hideRangeLines();
    };

    // Private -----------------------------------------------------------------------------------------------------
    this._moveCharacter = function (currentCharacter) {
        var self = this,
            charConfig = currentCharacter.characterConfig;
        charConfig.movement.spent++;
        charConfig.movement.isMoving = true;
        StatusIconConfig.showMovementIcon(game, currentCharacter, 1);
        game.events.emit('showCharacterInitiative', game.initiative);
        charConfig.posX = charConfig.path[0][0] * 50;
        charConfig.posY = charConfig.path[0][1] * 50;
        charConfig.path.shift();
        var tile = game.activeMap.tiles.getChildren().find(function (tile) {
            return tile.x === charConfig.posX && tile.y === charConfig.posY;
        });
        if (tile) {
            game.cameras.main.startFollow(currentCharacter, true, 0.09, 0.09);
            var onCompleteHandler = function () {
                game.tweens.killAll();
                setTimeout(function () {
                    charConfig.movement.isMoving = false;
                    if (charConfig.path.length === 0) {
                        game.cameras.main.stopFollow();
                        game.activeMap.showMovementGrid(currentCharacter);
                        self._checkIfObjectInteractionInProgress(charConfig.energy.inProgress);
                    }
                    game.events.emit('showCharacterInitiative', game.initiative);
                }, 5);
            };
            game.tweens.add({
                targets: currentCharacter,
                x: tile.x,
                y: tile.y,
                ease: 'Power1',
                duration: 500,
                onComplete: onCompleteHandler
            });
        }
    };

    this._moveActiveCharacter = (posX, posY) => {
        var currentCharacter = game.activeCharacter,
            charConfig = currentCharacter.characterConfig;
        if (!charConfig.movement.isMoving &&
            (currentCharacter.x !== posX || currentCharacter.y !== posY)) {
            if (!this._isTileOccupied(posX, posY)) {
                var auxMap = game.activeMap.addEnemiesToMap(game.enemies),
                    pathWay = Pathfinder.findWay(currentCharacter.x / 50, currentCharacter.y / 50, posX / 50, posY / 50, auxMap);
                charConfig.path = pathWay || [];
                if (pathWay.length > 0) {
                    charConfig.path.shift();
                    // if there was a click on an object close to the limit of movement, move near object
                    if (charConfig.energy.inProgress && charConfig.path.length === charConfig.movement.max + 1) {
                        charConfig.path.pop();
                    }

                    if (charConfig.path.length <= charConfig.movement.max - charConfig.movement.spent) {
                        this._moveCharacter(currentCharacter);
                        game.activeMap.hideMovementGrid();
                    } else if (charConfig.path.length > charConfig.movement.max - charConfig.movement.spent) {
                        charConfig.path = [];
                        charConfig.energy.inProgress = null;
                    }
                }
            }
        }
    };

    this._isTileOccupied = (posX, posY) => {
        var isObstacleInTheWay;
        if (game.enemies) {
            isObstacleInTheWay = game.enemies.characters.getChildren().filter(function (enemy) {
                return enemy.x === posX && enemy.y === posY;
            });
            if (isObstacleInTheWay.length > 0) {
                return true;
            }
        }
        isObstacleInTheWay = game.characters.characters.getChildren().filter(function (character) {
            return character.x === posX && character.y === posY;
        });
        if (isObstacleInTheWay.length > 0) {
            return true;
        }
        isObstacleInTheWay = game.activeMap.objects.getChildren().filter(function (object) {
            if (object.x === posX && object.y === posY) {
                //if object is a door check if it is open/activated
                if (Math.floor(object.objectConfig.id) === Math.floor(EnumHelper.idEnum.door.id) && !object.objectConfig.isActivated) {
                    return true;
                } else if (Math.floor(object.objectConfig.id) !== Math.floor(EnumHelper.idEnum.door.id)) {
                    return true;
                }
            }
        });
        if (isObstacleInTheWay.length > 0) {
            return true;
        }
        return false;
    };

    this._checkIfObjectInteractionInProgress = (object) => {
        if (object) {
            if (object.objectConfig) {
                this.interactWithObject(object);
            }
        }
    };

    this._addItemToInventory = (charConfig, item) => {
        switch (item.type) {
            case EnumHelper.inventoryEnum.mainHand:
                return this._addItem(charConfig, lodash.cloneDeep(item), 'mainHand');
            case EnumHelper.inventoryEnum.offHand:
                return this._addItem(charConfig, lodash.cloneDeep(item), 'offHand');
            case EnumHelper.inventoryEnum.head:
                return this._addItem(charConfig, lodash.cloneDeep(item), 'head');
            case EnumHelper.inventoryEnum.body:
                return this._addItem(charConfig, lodash.cloneDeep(item), 'body');
            case EnumHelper.inventoryEnum.hands:
                return this._addItem(charConfig, lodash.cloneDeep(item), 'hands');
            case EnumHelper.inventoryEnum.feet:
                return this._addItem(charConfig, lodash.cloneDeep(item), 'feet');
            default:
                return false;
        }
    };

    this._addItem = (charConfig, newItem, location) => {
        var itemAdded = false;
        if (charConfig.inventory[location].type === EnumHelper.inventoryEnum.defaultEquipment) {
            charConfig.inventory[location] = newItem;
            newItem.isEquipped = true;
            if (newItem.armor) {
                charConfig.armor += newItem.armor;
            }
            itemAdded = true;
        } else if (charConfig.inventory.slots.max - charConfig.inventory.slots.items.length > 0) {
            charConfig.inventory.slots.items.push(newItem);
            itemAdded = true;
        }
        return itemAdded;
    };
};