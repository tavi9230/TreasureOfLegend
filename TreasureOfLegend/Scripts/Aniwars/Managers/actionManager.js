import { EnumHelper } from 'Aniwars/Helpers/enumHelper';
import { Pathfinder } from 'Aniwars/Helpers/pathfinder';
import { InventoryConfig } from 'Aniwars/Configurations/inventoryConfig';
import { EnergyConfig } from 'Aniwars/Configurations/energyConfig';
import { EnemyConfig } from 'Aniwars/Configurations/enemyConfig';

export const ActionManager = function (game) {
    this.game = game;

    this.interactWithObject = (object) => {
        if (Math.floor(object.objectConfig.id) === EnumHelper.idEnum.door.id) {
            this._interactWithDoor(object);
        } else if (object.objectConfig.id === EnumHelper.idEnum.lootbag.id) {
            this._interactWithLootbag(object);
        } else if (Math.floor(object.objectConfig.id) === EnumHelper.idEnum.well.id) {
            this._interactWithWell(object);
        }
    };

    this.interactWithEnemy = (enemy) => {
        var character = this.game.activeCharacter,
            charConfig = character.characterConfig;
        if (!charConfig.movement.isMoving) {
            if (charConfig.energy.actionId === EnumHelper.actionEnum.attackMainHand) {
                this._checkDefaultAction(character, enemy);
            } else if (charConfig.energy.actionId === EnumHelper.actionEnum.attackSpell) {
                this._checkSpellAttack(character, enemy);
            } else {
                this._checkDefaultAction(character, enemy);
            }
        }
    };

    // OBJECT INTERACTION -------------------------------------------------------------------------------------------------------------------
    this._interactWithDoor = (object) => {
        var charConfig = this.game.activeCharacter.characterConfig,
            x = object.x / 50,
            y = object.y / 50;
        charConfig.energy.spent += EnergyConfig.door.cost;
        this.game.activeMap.levelMap = this.game.activeMap.copyMap(this.game.activeMap.levelMap, this.game.activeMap.previousMap);
        //door animations would be nice
        if (!object.objectConfig.isActivated) {
            this.game.activeMap.levelMap[y][x] = 0;
            if (object.objectConfig.id === EnumHelper.idEnum.door.type.up || object.objectConfig.id === EnumHelper.idEnum.door.type.down) {
                object.setX(object.x - 50);
            } else if (object.objectConfig.id === EnumHelper.idEnum.door.type.right || object.objectConfig.id === EnumHelper.idEnum.door.type.left) {
                object.setY(object.y - 50);
            }
        } else {
            this.game.activeMap.levelMap[y][x] = object.objectConfig.id;
        }
        object.objectConfig.isActivated = !object.objectConfig.isActivated;
        if (charConfig.isPlayerControlled) {
            this.game.activeMap.showMovementGrid();
        }
    };

    this._interactWithLootbag = (object) => {
        this.game.events.emit('showDeadCharacterInventory', object);
    };

    this._interactWithWell = (object) => {
        var currentTurn = this.game.hudScene.getTurn();
        if (currentTurn - object.objectConfig.turnActivated >= object.objectConfig.turnsToReset) {
            object.objectConfig.turnActivated = 0;
            object.objectConfig.turnsToReset = 0;
            var activeCharacter = this.game.activeCharacter;
            if (object.objectConfig.id === EnumHelper.idEnum.well.type.health) {
                activeCharacter.characterConfig.life.current = activeCharacter.characterConfig.life.max;
            } else if (object.objectConfig.id === EnumHelper.idEnum.well.type.mana) {
                activeCharacter.characterConfig.mana.spent = 0;
            } else if (object.objectConfig.id === EnumHelper.idEnum.well.type.movement) {
                activeCharacter.characterConfig.movement.spent = 0;
                this.game.activeMap.showMovementGrid();
            } else if (object.objectConfig.id === EnumHelper.idEnum.well.type.energy) {
                activeCharacter.characterConfig.energy.spent = 0;
            }
            this.game.activeMap.createReactivatingObject({
                object: object,
                image: 'emptyWell',
                description: 'Empty well',
                displayWidth: 100,
                displayHeight: 100,
                width: 100,
                height: 100,
                isInteractible: true,
                turnsToReset: Math.floor(Math.random() * 5) + 1
            });
        }
    };

    //ENEMY INTERACTION --------------------------------------------------------------------------------------------------------------------
    this._attackWithMainHand = (character, enemy) => {
        var self = this,
            charConfig = character.characterConfig,
            enemyCharConfig = enemy.characterConfig,
            attackAttribute = EnumHelper.attributeEnum.strength === charConfig.inventory.mainHand.attribute
                ? charConfig.attributes.strength
                : charConfig.attributes.dexterity,
            d20 = Math.floor(Math.random() * 20) + 1 + attackAttribute;
        if (d20 <= enemyCharConfig.armor) {
            if (enemyCharConfig.armor - enemyCharConfig.naturalArmor > 0) {
                if (this._removeArmorPointsFromEquippedInventory(enemy, 1)) {
                    this._showArmorIcon(enemy, 1);
                }
            } else if (enemyCharConfig.naturalArmor > 0) {
                enemyCharConfig.naturalArmor--;
                this._showArmorIcon(enemy, 1);
            }
        } else {
            _.each(charConfig.inventory.mainHand.damage, function (damage) {
                var attackDamage = Math.floor(Math.random() * damage.value) + 1 + Math.floor(attackAttribute / 2);
                if (enemyCharConfig.invulnerabilities.indexOf(damage.type) === -1) {
                    if (enemyCharConfig.resistances.indexOf(damage.type) !== -1) {
                        enemyCharConfig.life.current -= Math.ceil(attackDamage / 2);
                        self._showLifeIcon(enemy, Math.ceil(attackDamage / 2));
                    } else if (enemyCharConfig.vulnerabilities.indexOf(damage.type) !== -1) {
                        enemyCharConfig.life.current -= (attackDamage * 2);
                        self._showLifeIcon(enemy, attackDamage * 2);
                    } else {
                        enemyCharConfig.life.current -= attackDamage;
                        self._showLifeIcon(enemy, attackDamage);
                    }
                }
                if (enemyCharConfig.armor - enemyCharConfig.naturalArmor > 0) {
                    if (self._removeArmorPointsFromEquippedInventory(enemy, Math.ceil(attackDamage / 2))) {
                        self._showArmorIcon(enemy, Math.ceil(attackDamage / 2));
                    }
                } else if (enemyCharConfig.naturalArmor > 0) {
                    enemyCharConfig.naturalArmor -= Math.ceil(attackDamage / 2);
                    self._showArmorIcon(enemy, Math.ceil(attackDamage / 2));
                    if (enemyCharConfig.naturalArmor < 0) {
                        enemyCharConfig.naturalArmor = 0;
                    }
                }
            });
        }
        enemyCharConfig.armor = enemyCharConfig.inventory.head.armor +
            enemyCharConfig.inventory.body.armor +
            enemyCharConfig.inventory.hands.armor +
            enemyCharConfig.inventory.feet.armor +
            (enemyCharConfig.inventory.offHand.armor
                ? enemyCharConfig.inventory.offHand.armor
                : 0) + enemyCharConfig.naturalArmor;

        charConfig.energy.spent += EnergyConfig.attackMainHand.cost;

        this._checkInitiative(enemy);
    };

    this._attackWithSpell = (character, enemy) => {
        var self = this,
            charConfig = character.characterConfig,
            enemyCharConfig = enemy.characterConfig,
            d20 = Math.floor(Math.random() * 20) + 1 + charConfig.attributes.intelligence;
        if (d20 <= enemyCharConfig.armor) {
            if (enemyCharConfig.armor - enemyCharConfig.naturalArmor > 0) {
                if (this._removeArmorPointsFromEquippedInventory(enemy, 1)) {
                    this._showArmorIcon(enemy, 1);
                }
            } else if (enemyCharConfig.naturalArmor > 0) {
                enemyCharConfig.naturalArmor--;
                this._showArmorIcon(enemy, 1);
            }
        } else {
            _.each(charConfig.energy.selectedAction.damage, function (damage) {
                var attackDamage = Math.floor(Math.random() * damage.value * Math.ceil(charConfig.energy.selectedAction.level / 2)) + 1 + Math.floor(charConfig.attributes.intelligence / 2);
                if (enemyCharConfig.invulnerabilities.indexOf(damage.type) === -1) {
                    if (enemyCharConfig.resistances.indexOf(damage.type) !== -1) {
                        enemyCharConfig.life.current -= Math.ceil(attackDamage / 2);
                        self._showLifeIcon(enemy, Math.ceil(attackDamage / 2));
                    } else if (enemyCharConfig.vulnerabilities.indexOf(damage.type) !== -1) {
                        enemyCharConfig.life.current -= (attackDamage * 2);
                        self._showLifeIcon(enemy, attackDamage * 2);
                    } else {
                        enemyCharConfig.life.current -= attackDamage;
                        self._showLifeIcon(enemy, attackDamage);
                    }
                }
                if (enemyCharConfig.armor - enemyCharConfig.naturalArmor > 0) {
                    if (self._removeArmorPointsFromEquippedInventory(enemy, Math.ceil(attackDamage / 2))) {
                        self._showArmorIcon(enemy, Math.ceil(attackDamage / 2));
                    }
                } else if (enemyCharConfig.naturalArmor > 0) {
                    enemyCharConfig.naturalArmor -= Math.ceil(attackDamage / 2);
                    self._showArmorIcon(enemy, Math.ceil(attackDamage / 2));
                    if (enemyCharConfig.naturalArmor < 0) {
                        enemyCharConfig.naturalArmor = 0;
                    }
                }
            });
        }
        enemyCharConfig.armor = enemyCharConfig.inventory.head.armor +
            enemyCharConfig.inventory.body.armor +
            enemyCharConfig.inventory.hands.armor +
            enemyCharConfig.inventory.feet.armor +
            (enemyCharConfig.inventory.offHand.armor
                ? enemyCharConfig.inventory.offHand.armor
                : 0) + enemyCharConfig.naturalArmor;

        charConfig.energy.spent += EnergyConfig.attackSpell.cost;
        charConfig.mana.spent += charConfig.energy.selectedAction.cost;

        this._checkInitiative(enemy);
    };

    // PRIVATE -------------------------------------------------------------------------------------------------------------------------------
    this._checkProjectileSuccess = (character, enemy) => {
        // TODO: Check Bresenham's algorithm (https://www.redblobgames.com/grids/line-drawing.html)
        // TODO: Check from each corner of character to each corner of enemy to make sure it hits
        var self = this,
            isNotBlocked = true,
            linePoints = this._supercoverLine(character, enemy);
        _.each(linePoints, function (point) {
            if (self.game.activeMap.levelMap[point.y / 50][point.x / 50] !== 0) {
                isNotBlocked = false;
            }
        });

        return isNotBlocked;
    };

    this._supercoverLine = function (character, enemy) {
        var dx = enemy.x - character.x,
            dy = enemy.y - character.y,
            nx = Math.abs(dx),
            ny = Math.abs(dy),
            signX = dx > 0 ? 1 : -1,
            signY = dy > 0 ? 1 : -1,
            p = {
                x: character.x,
                y: character.y
            },
            points = [{ x: p.x, y: p.y }];
        for (var ix = 0, iy = 0; ix < nx || iy < ny;) {
            if ((0.5 + ix) / nx === (0.5 + iy) / ny) {
                // next step is diagonal
                p.x += signX;
                p.y += signY;
                ix++;
                iy++;
            } else if ((0.5 + ix) / nx < (0.5 + iy) / ny) {
                // next step is horizontal
                p.x += signX;
                ix++;
            } else {
                // next step is vertical
                p.y += signY;
                iy++;
            }
            if (p.x % 10 === 0 && p.y % 10 === 0) {
                if (!points.find(function (point) {
                    return point.x === Math.floor(p.x / 50) * 50 &&
                        point.y === Math.floor(p.y / 50) * 50;
                })) {
                    points.push({
                        x: Math.floor(p.x / 50) * 50,
                        y: Math.floor(p.y / 50) * 50
                    });
                }
            }
        }
        return points;
    };

    this._tryMovingCharacter = (character, enemy) => {
        var path,
            charConfig = character.characterConfig;
        if (Math.abs(character.x - enemy.x) !== 0 || Math.abs(character.y - enemy.y) !== 0) {
            path = Pathfinder.getPathFromAToB(character, enemy, this.game.activeMap.levelMap);
            if (charConfig.isPlayerControlled && path) {
                this.game.characters.moveActiveCharacterNearObject(null, path[path.length - 2][0], path[path.length - 2][1]);
            }
        }
    };

    this._checkInitiative = (enemy) => {
        var charConfig = enemy.characterConfig,
            self = this;
        if (charConfig.life.current <= 0) {
            var lootbag;
            this._addItemsFromBodyToInventory(enemy);
            if (charConfig.inventory.slots.items.length > 0) {
                lootbag = this.game.add.image(enemy.x, enemy.y, 'lootbag').setOrigin(0, 0);
                lootbag.displayWidth = 50;
                lootbag.displayHeight = 50;
                lootbag.objectConfig = lodash.cloneDeep(this.game.activeMap.objConfig);
                lootbag.objectConfig.belongsTo = enemy;
                lootbag.objectConfig.id = EnumHelper.idEnum.lootbag.id;
                lootbag.objectConfig.isInteractible = true;
                this.game.activeMap.deadCharacters.add(lootbag);
                // TODO: Check if this is overridden with each killed enemy
                this.game.input.setHitArea(this.game.activeMap.deadCharacters.getChildren());
                lootbag.on('pointerdown', function () {
                    if (self.game.activeCharacter.characterConfig.isPlayerControlled) {
                        self.game.characters.interactWithObject(lootbag);
                    }
                });
            }
            if (!charConfig.isPlayerControlled) {
                _.each(this.game.characters.characters.getChildren(), function (character) {
                    character.characterConfig.experience.current += Math.floor(enemy.characterConfig.experience / self.game.characters.characters.getChildren().length);
                    var difference = Math.floor(character.characterConfig.experience.current - character.characterConfig.experience.nextLevel);
                    if (difference >= 0) {
                        character.characterConfig.experience.current = difference;
                        character.characterConfig.experience.level++;
                        character.characterConfig.experience.attributePoints++;
                        character.characterConfig.experience.nextLevel = Math.floor(character.characterConfig.experience.nextLevel * 1.3);
                    }
                });
                this.game.characters.souls.current += enemy.characterConfig.souls;
                // TODO: Attribute points cost 5 souls then 10 then 15 and so on. Change game logic to reflect this
                var difference = this.game.characters.souls.current - this.game.characters.souls.nextLevel;
                if (difference >= 0) {
                    this.game.characters.souls.current = difference;
                    this.game.characters.souls.nextLevel += 5;
                    this.game.characters.souls.skillPoints++;
                }
                this.game.events.emit('updateSouls', this.game.characters.souls);
            }

            enemy.destroy();
            if (charConfig.isPlayerControlled) {
                this.game.characters.characters.remove(enemy);
            } else {
                this.game.enemies.characters.remove(enemy);
                if (this.game.enemies.characters.getChildren().length === 0 && this.game.scene.key === 'TestLevelScene') {
                    this.game.enemies.total++;
                    for (let i = 0; i < this.game.enemies.total; i++) {
                        var positionFound = false,
                            enemy,
                            x,
                            y;
                        while (!positionFound) {
                            x = Math.floor(Math.random() * this.game.activeMap.levelMap[0].length) * 50,
                                y = Math.floor(Math.random() * this.game.activeMap.levelMap.length) * 50;
                            var tiles = this.game.activeMap.tiles.getChildren().filter(function (object) {
                                return object.x === x && object.y === y;
                            });
                            if (tiles.length > 0) {
                                positionFound = true;
                            }
                        }
                        enemy = i % 5 === 0
                            ? this.game.enemies.addNewRandomVulnerabilitiesCharacter(x, y, EnemyConfig.thug)
                            : this.game.enemies.addNewCharacter(x, y, EnemyConfig.thug);
                        this.game.input.setHitArea([enemy]);
                        this.game.sceneManager.bindEnemyEvents(enemy);
                    }
                    this.game.initiative = null;
                    this.game.initiativeIndex = -1;
                }
            }
            this.game.initiative = this.game.sceneManager.getInitiativeArray([enemy]);
        }
        this.game.events.emit('showCharacterInitiative', this.game.initiative);
    };

    this._checkDefaultAction = (character, enemy) => {
        // TODO: Check if offhand is empty?
        // Check if in range
        var charConfig = character.characterConfig;
        if (Math.abs(character.x - enemy.x) <= 50 * charConfig.inventory.mainHand.range &&
            Math.abs(character.y - enemy.y) <= 50 * charConfig.inventory.mainHand.range &&
            (Math.abs(character.x - enemy.x) > 0 || Math.abs(character.y - enemy.y) > 0)
            && charConfig.energy.max - EnergyConfig.attackMainHand.cost >= charConfig.energy.spent) {
            // If weapon is held with two hands check to have nothing in the offhand.
            // If it is a projectile weapon it can have projectiles in offhand
            // if it is a melee weapon check if two handed skill is available or some skill
            // that allows character to use TH weapons as OH
            if (charConfig.inventory.mainHand.hold === 2 &&
                charConfig.inventory.offHand.type === EnumHelper.inventoryEnum.defaultEquipment
                || charConfig.inventory.mainHand.hold === 1) {
                // If it is a ranged weapon check if projectile hits
                if (charConfig.inventory.mainHand.range > 1) {
                    if (this._checkProjectileSuccess(character, enemy)) {
                        this._attackWithMainHand(character, enemy);
                    }
                } else {
                    this._attackWithMainHand(character, enemy);
                }
            }
        }
        // Otherwise move near the object and try again
        else {
            this._tryMovingCharacter(character, enemy);
        }
    };

    this._checkSpellAttack = (character, enemy) => {
        // TODO: Check if offhand is empty?
        var charConfig = character.characterConfig;
        if (charConfig.mana.max - charConfig.mana.spent >= 0) {
            if (Math.abs(character.x - enemy.x) <= 50 * charConfig.energy.selectedAction.range &&
                Math.abs(character.y - enemy.y) <= 50 * charConfig.energy.selectedAction.range &&
                (Math.abs(character.x - enemy.x) > 0 || Math.abs(character.y - enemy.y) > 0)
                && charConfig.energy.max - EnergyConfig.attackSpell.cost >= charConfig.energy.spent) {
                if (this._checkProjectileSuccess(character, enemy)) {
                    this._attackWithSpell(character, enemy);
                }
            } else {
                this._tryMovingCharacter(character, enemy);
            }
        }
    };

    this._removeArmorPointsFromEquippedInventory = (enemy, value) => {
        var pieceHit = Math.floor(Math.random() * 6) + 1,
            inventory = enemy.characterConfig.inventory,
            hasHit = false;
        switch (pieceHit) {
            case EnumHelper.inventoryEnum.offHand:
                if (inventory.offHand.type !== InventoryConfig.defaultMainHand.type && inventory.offHand.armor) {
                    if (inventory.offHand.armor - value <= 0) {
                        inventory.offHand = lodash.cloneDeep(InventoryConfig.defaultMainHand);
                    } else {
                        inventory.offHand.armor -= value;
                    }
                    hasHit = true;
                }
                break;
            case EnumHelper.inventoryEnum.head:
                if (inventory.head.type !== InventoryConfig.defaultHead.type) {
                    if (inventory.head.armor - value <= 0) {
                        inventory.head = lodash.cloneDeep(InventoryConfig.defaultHead);
                    } else {
                        inventory.head.armor -= value;
                    }
                    hasHit = true;
                }
                break;
            case EnumHelper.inventoryEnum.body:
                if (inventory.body.type !== InventoryConfig.defaultBody.type) {
                    if (inventory.body.armor - value <= 0) {
                        inventory.body = lodash.cloneDeep(InventoryConfig.defaultBody);
                    } else {
                        inventory.body.armor -= value;
                    }
                    hasHit = true;
                }
                break;
            case EnumHelper.inventoryEnum.hands:
                if (inventory.hands.type !== InventoryConfig.defaultHands.type) {
                    if (inventory.hands.armor - value <= 0) {
                        inventory.hands = lodash.cloneDeep(InventoryConfig.defaultHands);
                    } else {
                        inventory.hands.armor -= value;
                    }
                    hasHit = true;
                }
                break;
            case EnumHelper.inventoryEnum.feet:
                if (inventory.feet.type !== InventoryConfig.defaultFeet.type) {
                    if (inventory.feet.armor - value <= 0) {
                        inventory.feet = lodash.cloneDeep(InventoryConfig.defaultFeet);
                    } else {
                        inventory.feet.armor -= value;
                    }
                    hasHit = true;
                }
                break;
            default:
                break;
        }
        return hasHit;
    };

    this._addItemsFromBodyToInventory = (character) => {
        if (character.characterConfig.inventory.mainHand.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            character.characterConfig.inventory.slots.items.push(lodash
                .cloneDeep(character.characterConfig.inventory.mainHand));
            character.characterConfig.inventory.mainHand = lodash.cloneDeep(InventoryConfig.defaultMainHand);
        }
        if (character.characterConfig.inventory.offHand.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            character.characterConfig.inventory.slots.items.push(lodash
                .cloneDeep(character.characterConfig.inventory.offHand));
            character.characterConfig.inventory.offHand = lodash.cloneDeep(InventoryConfig.defaultMainHand);
        }
        if (character.characterConfig.inventory.head.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            character.characterConfig.inventory.slots.items.push(lodash.cloneDeep(character.characterConfig.inventory.head));
            character.characterConfig.inventory.head = lodash.cloneDeep(InventoryConfig.defaultHead);
        }
        if (character.characterConfig.inventory.body.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            character.characterConfig.inventory.slots.items.push(lodash.cloneDeep(character.characterConfig.inventory.body));
            character.characterConfig.inventory.body = lodash.cloneDeep(InventoryConfig.defaultBody);
        }
        if (character.characterConfig.inventory.hands.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            character.characterConfig.inventory.slots.items.push(lodash.cloneDeep(character.characterConfig.inventory.hands));
            character.characterConfig.inventory.hands = lodash.cloneDeep(InventoryConfig.defaultHands);
        }
        if (character.characterConfig.inventory.feet.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            character.characterConfig.inventory.slots.items.push(lodash.cloneDeep(character.characterConfig.inventory.feet));
            character.characterConfig.inventory.feet = lodash.cloneDeep(InventoryConfig.defaultFeet);
        }
    };

    this._showArmorIcon = (enemy, text) => {
        var textStyle = {
            fontSize: 20,
            wordWrap: { width: 96, useAdvancedWrap: true }
        },
            armorIcon = this.game.physics.add.sprite(enemy.x + 17, enemy.y - 35, 'armorIcon').setOrigin(0, 0),
            armorText = this.game.add.text(armorIcon.x + 7, armorIcon.y + 3, -text, textStyle);
        armorIcon.displayHeight = 30;
        armorIcon.displayWidth = 30;
        //this.game.physics.moveTo(armorIcon, enemy.x + 17, enemy.y - 80, 2, 2000);
        setTimeout(function () {
            armorIcon.destroy();
            armorText.destroy();
        }, 850);
    };
    this._showLifeIcon = (enemy, text) => {
        var textStyle = {
            fontSize: 20,
            wordWrap: { width: 96, useAdvancedWrap: true }
        },
            healthIcon = this.game.physics.add.sprite(enemy.x + 50, enemy.y - 35, 'healthIcon').setOrigin(0, 0),
            healthText = this.game.add.text(healthIcon.x + 7, healthIcon.y + 3, -text, textStyle);
        healthIcon.displayHeight = 30;
        healthIcon.displayWidth = 30;
        setTimeout(function () {
            healthIcon.destroy();
            healthText.destroy();
        }, 850);
    };
};