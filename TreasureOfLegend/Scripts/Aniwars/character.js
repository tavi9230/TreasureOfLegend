import {Pathfinder} from 'Aniwars/Helpers/pathfinder';
import {EnumHelper} from 'Aniwars/Helpers/enumHelper';
import {ActionManager} from 'Aniwars/Managers/actionManager';
import {InventoryConfig} from 'Aniwars/Configurations/inventoryConfig';
import {SpellsConfig} from 'Aniwars/Configurations/spellsConfig';
import {EnergyConfig} from 'Aniwars/Configurations/energyConfig';

export const Character = function(game) {
    var actionManager = new ActionManager(game);

    this.characterConfig = {
        path: [],
        armor: 0,
        naturalArmor: 0,
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
            isMoving: false,
            usedDash: false
        },
        energy: {
            max: 10,
            spent: 0,
            actionId: -1,
            selectedAction: null,
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
                max: 2,
                items: []
            },
            money: 0,
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
            nextLevel: 12,
            attributePoints: 1,
            level: 1
        }
    };
    this.game = game;
    this.map = this.game.activeMap;
    this.characters = this.game.add.group();
    this.souls = {
        current: 0,
        nextLevel: 1,
        skillPoints: 1
    };

    this.addNewCharacter = (x, y, spriteName) => {
        var character = this.game.physics.add.sprite(x, y, spriteName).setOrigin(0, 0.5);
        character.height = 50;
        character.width = 50;
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
                this.game.activeMap.showMovementGrid(currentCharacter);
                this._checkIfObjectInteractionInProgress(charConfig.energy.inProgress);
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
        charConfig.energy.inProgress = null;
        if (object.objectConfig.isInteractible && charConfig.energy.max - charConfig.energy.spent > 0) {
            var obj = {
                x: object.x,
                y: object.y
            },
                isWithinReach = false;
            if (Math.floor(object.objectConfig.id) === EnumHelper.idEnum.door.id) {
                obj = this.game.activeMap.getObjRealCoords(object);
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
                var path = Pathfinder.getPathFromAToB(character, object, this.game.activeMap.levelMap);
                if (path) {
                    if (!this._isTileOccupied(path[path.length - 2][0] * 50, path[path.length - 2][1] * 50)) {
                        charConfig.energy.inProgress = object;
                        this.moveActiveCharacterNearObject(null, path[path.length - 2][0], path[path.length - 2][1]);
                    } else {
                        var auxMap = [];
                        auxMap = this.game.activeMap.copyMap(this.game.activeMap.levelMap, auxMap);
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
        var character = this.game.activeCharacter,
            charConfig = character.characterConfig;
        charConfig.energy.inProgress = null;
        if (charConfig.energy.max - charConfig.energy.spent > 0) {
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
            if (charConfig.energy.max - charConfig.energy.spent > 0 && this._addItemToInventory(charConfig, item.itemConfig)) {
                charConfig.energy.spent += EnergyConfig.pickup.cost;
                item.destroy();
                this.game.items.remove(item);
            }
        } else {
            charConfig.energy.inProgress = item;
            this.moveActiveCharacterToTile(item);
        }
    };

    this.dropItem = (itemToDrop) => {
        var character = this.game.activeCharacter,
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
        var item = this.game.physics.add.sprite(character.x, character.y, itemToDrop.image).setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.itemConfig = lodash.cloneDeep(itemToDrop);
        this.game.items.add(item);
        character.setDepth(1);
        this.game.input.setHitArea([item]);
        item.on('pointerdown', _.bind(self.game.characters.pickUpItem, self, item));
        item.on('pointerover', _.bind(self.game.activeMap.highlightPathToItem, self, item));
    };

    this.replaceItem = (itemToReplace) => {
        var character = this.game.activeCharacter,
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
        }
    };

    this.addItemFromList = (item, lootbag) => {
        var character = this.game.activeCharacter,
            charConfig = character.characterConfig;
        if (charConfig.energy.max - charConfig.energy.spent > 0 && this._addItemToInventory(charConfig, item)) {
            charConfig.energy.spent += EnergyConfig.pickup.cost;
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
                this.game.events.emit('showDeadCharacterInventory', lootbag);
                this.game.events.emit('closeLootbag');
            }
            if (lootbagConfig.inventory.slots.items.length > 0) {
                this.game.events.emit('showDeadCharacterInventory', lootbag);
            }
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
        this.game.events.emit('updateStats', activeCharacter);
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

    this.useDash = () => {
        var activeCharacter = this.game.activeCharacter;
        if (!activeCharacter.characterConfig.movement.usedDash &&
            activeCharacter.characterConfig.energy.max - activeCharacter.characterConfig.energy.spent >= EnergyConfig.dash.cost
            && activeCharacter.characterConfig.movement.max - activeCharacter.characterConfig.movement.spent === 0) {
            activeCharacter.characterConfig.movement.usedDash = true;
            activeCharacter.characterConfig.movement.spent = 0;
            activeCharacter.characterConfig.energy.spent += 2;
            this.game.activeMap.showMovementGrid();
        }
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
        if (this.game.enemies) {
            isObstacleInTheWay = this.game.enemies.characters.getChildren().filter(function(enemy) {
                return enemy.x === posX && enemy.y === posY;
            });
            if (isObstacleInTheWay.length > 0) {
                return true;
            }
        }
        isObstacleInTheWay = this.game.characters.characters.getChildren().filter(function(character) {
            return character.x === posX && character.y === posY;
        });
        if (isObstacleInTheWay.length > 0) {
            return true;
        }
        isObstacleInTheWay = this.game.activeMap.objects.getChildren().filter(function(object) {
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