import { EnumHelper } from 'TreasureOfLegend/Helpers/enumHelper';
import { InventoryConfig } from 'TreasureOfLegend/Configurations/inventoryConfig';
import { EnergyConfig } from 'TreasureOfLegend/Configurations/energyConfig';
import { EnemyConfig } from 'TreasureOfLegend/Configurations/enemyConfig';
import { StatusIconConfig } from 'TreasureOfLegend/Configurations/statusIconConfig';
import { CoordHelper } from 'TreasureOfLegend/Helpers/coordHelper';

export const ActionManager = function (scene) {
    var game = scene,
        rangeLines = null;

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
        var character = game.activeCharacter,
            charConfig = character.characterConfig;
        if (!charConfig.movement.isMoving) {
            if (charConfig.energy.actionId === EnumHelper.actionEnum.attackMainHand) {
                return this._checkMainHandAttack(character, enemy);
            } else if (charConfig.energy.actionId === EnumHelper.actionEnum.attackSpell) {
                return this._checkSpellAttack(character, enemy);
            } else if (charConfig.energy.actionId === EnumHelper.actionEnum.attackOffHand) {
                return this._checkOffHandAttack(character, enemy);
            }
        }
        return false;
    };

    this.showRangeLines = function (character, enemy) {
        // TODO: Fix this when player - wall - enemy
        var projectileLines = this._checkProjectileSuccess(character, enemy),
            charConfig = character.characterConfig,
            isThrownWeapon = charConfig.energy.selectedAction.properties
                ? charConfig.energy.selectedAction.properties.indexOf(EnumHelper.weaponPropertiesEnum.thrown) > -1
                : false;
        this.hideRangeLines();
        rangeLines = game.add.group();
        if (projectileLines.isFound &&
            Math.abs(character.x - enemy.x) <= 50 * (isThrownWeapon ? charConfig.energy.selectedAction.rangeThrown : charConfig.energy.selectedAction.range) &&
            Math.abs(character.y - enemy.y) <= 50 * (isThrownWeapon ? charConfig.energy.selectedAction.rangeThrown : charConfig.energy.selectedAction.range) &&
            (Math.abs(character.x - enemy.x) > 0 || Math.abs(character.y - enemy.y) > 0)) {
            _.each(projectileLines.lines, function (line) {
                rangeLines.add(game.add.line(0, 0, line.charX, line.charY, line.enemyX, line.enemyY, 0x00ff00).setOrigin(0, 0));
            });
        } else {
            rangeLines.add(game.add.line(0, 0, character.x, character.y, enemy.x, enemy.y, 0xff0000).setOrigin(0, 0));
        }
    };

    this.hideRangeLines = function () {
        if (rangeLines) {
            rangeLines.destroy(true);
            rangeLines = null;
        }
    };

    this.checkLineOfSight = function (character, enemy) {
        var projectileLines = this._checkProjectileSuccess(character, enemy);
        projectileLines.linePoints.shift();
        // TODO: projectileLines.linePoints.length < character.characterConfig.lineOfSight is correct when enemy is below character
        return projectileLines.isFound && projectileLines.linePoints.length <= character.characterConfig.lineOfSight
            ?
            {
                hasBeenSeen: true,
                distance: projectileLines.linePoints.length
            }
            :
            {
                hasBeenSeen: false,
                distance: projectileLines.linePoints.length
            };
    };

    // PRIVATE ----------------------------------------------------------------------------------------------------------------------------------------------

    // OBJECT INTERACTION -------------------------------------------------------------------------------------------------------------------
    this._interactWithDoor = (object) => {
        // TODO: Don't close door when another character is in it's position
        var charConfig = game.activeCharacter.characterConfig,
            cartesianObject = CoordHelper.IsometricToCartesian(object.x, object.y),
            x = cartesianObject.x / 50,
            y = cartesianObject.y / 50;
        if (charConfig.energy.max - charConfig.energy.spent >= EnergyConfig.door.cost) {
            charConfig.energy.spent += EnergyConfig.door.cost;
            StatusIconConfig.showEnergyIcon(game, game.activeCharacter, EnergyConfig.door.cost);
            game.events.emit('showCharacterInitiative', game.initiative);
            game.activeMap.levelMap = game.activeMap.copyMap(game.activeMap.levelMap, game.activeMap.previousMap);
            //door animations would be nice
            if (!object.objectConfig.isActivated) {
                game.activeMap.levelMap[y][x] = 0;
                object.setTexture(object.objectConfig.activatedImage);
                //if (object.objectConfig.id === EnumHelper.idEnum.door.type.up || object.objectConfig.id === EnumHelper.idEnum.door.type.down) {
                //    object.setX(object.x - 50);
                //} else if (object.objectConfig.id === EnumHelper.idEnum.door.type.right || object.objectConfig.id === EnumHelper.idEnum.door.type.left) {
                //    object.setY(object.y - 50);
                //}
            } else {
                game.activeMap.levelMap[y][x] = object.objectConfig.id;
                object.setTexture(object.objectConfig.image);
            }
            var doorSound = game.sound.add('open_door', { volume: 0.5 });
            doorSound.play();
            object.objectConfig.isActivated = !object.objectConfig.isActivated;
            if (charConfig.isPlayerControlled || charConfig.isMasterControlled) {
                game.activeMap.showMovementGrid();
            }
        }
    };

    this._interactWithLootbag = (object) => {
        var lootbagOpenSound = game.sound.add('lootbag_open', { volume: 0.5 });
        lootbagOpenSound.play();
        game.events.emit('showDeadCharacterInventory', object);
    };

    this._interactWithWell = (object) => {
        var currentTurn = game.hudScene.getTurn(),
            activeCharacter = game.activeCharacter,
            charConfig = activeCharacter.characterConfig;
        if (charConfig.energy.max - charConfig.energy.spent >= EnergyConfig.well.cost) {
            if (currentTurn - object.objectConfig.turnActivated >= object.objectConfig.turnsToReset) {
                object.objectConfig.turnActivated = 0;
                object.objectConfig.turnsToReset = 0;
                charConfig.energy.spent += EnergyConfig.well.cost;
                if (object.objectConfig.id === EnumHelper.idEnum.well.type.health) {
                    StatusIconConfig.showManaIcon(game, activeCharacter, -(charConfig.life.max - charConfig.life.spent));
                    charConfig.life.current = charConfig.life.max;
                } else if (object.objectConfig.id === EnumHelper.idEnum.well.type.mana) {
                    StatusIconConfig.showManaIcon(game, activeCharacter, -charConfig.mana.spent);
                    charConfig.mana.spent = 0;
                } else if (object.objectConfig.id === EnumHelper.idEnum.well.type.movement) {
                    StatusIconConfig.showMovementIcon(game, activeCharacter, -charConfig.movement.spent);
                    charConfig.movement.spent = 0;
                    game.activeMap.showMovementGrid();
                } else if (object.objectConfig.id === EnumHelper.idEnum.well.type.energy) {
                    StatusIconConfig.showEnergyIcon(game, activeCharacter, -charConfig.energy.spent);
                    charConfig.energy.spent = 0;
                }
                var drinkSound = game.sound.add('drink_well', { volume: 0.5 });
                drinkSound.play();
                game.activeMap.createReactivatingObject({
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
                game.events.emit('showCharacterInitiative', game.initiative);
            }
        }
    };

    //ENEMY INTERACTION --------------------------------------------------------------------------------------------------------------------
    this._getAttackAttribute = (charConfig) => {
        var isFinesseWeapon = charConfig.energy.selectedAction.properties ? charConfig.energy.selectedAction.properties.indexOf(EnumHelper.weaponPropertiesEnum.finesse) > -1 : false,
            isStrengthBased = EnumHelper.attributeEnum.strength === charConfig.energy.selectedAction.attribute,
            isDexterityBased = EnumHelper.attributeEnum.dexterity === charConfig.energy.selectedAction.attribute,
            isIntelligenceBased = EnumHelper.attributeEnum.intelligence === charConfig.energy.selectedAction.attribute;
        if (isFinesseWeapon) {
            return charConfig.attributes.strength > charConfig.attributes.dexterity
                ? charConfig.attributes.strength
                : charConfig.attributes.dexterity;
        } else if (isStrengthBased) {
            return charConfig.attributes.strength;
        } else if (isDexterityBased) {
            return charConfig.attributes.dexterity;
        } else if (isIntelligenceBased) {
            return charConfig.attributes.intelligence;
        }
        return charConfig.attributes.dexterity;
    };

    this._canAttack = (character, enemy) => {
        var charConfig = character.characterConfig,
            cost = charConfig.energy.actionId === EnumHelper.actionEnum.attackMainHand
                ? EnergyConfig.attackMainHand.cost
                : charConfig.energy.actionId === EnumHelper.actionEnum.attackSpell
                    ? EnergyConfig.attackSpell.cost
                    : EnergyConfig.attackOffHand.cost,
            isReachWeapon = charConfig.energy.selectedAction.properties ? charConfig.energy.selectedAction.properties.indexOf(EnumHelper.weaponPropertiesEnum.reach) > -1 : false,
            isThrownWeapon = charConfig.energy.selectedAction.properties ? charConfig.energy.selectedAction.properties.indexOf(EnumHelper.weaponPropertiesEnum.thrown) > -1 : false;
        if (Math.abs(character.x - enemy.x) <= 50 * (isThrownWeapon ? charConfig.energy.selectedAction.rangeThrown : charConfig.energy.selectedAction.range) + (isReachWeapon ? 50 : 0) &&
            Math.abs(character.y - enemy.y) <= 50 * (isThrownWeapon ? charConfig.energy.selectedAction.rangeThrown : charConfig.energy.selectedAction.range) + (isReachWeapon ? 50 : 0) &&
            (Math.abs(character.x - enemy.x) > 0 || Math.abs(character.y - enemy.y) > 0)
            && charConfig.energy.max - cost >= charConfig.energy.spent) {
            return {
                throwAttack: Math.abs(character.x - enemy.x) > 50 || Math.abs(character.y - enemy.y) > 50 && (Math.abs(character.x - enemy.x) > 0 || Math.abs(character.y - enemy.y) > 0),
                canAttack: true
            };
        }
        return {
            canAttack: false
        };
    };

    this._isProjectileHitting = (character, enemy) => {
        // TODO: Instead of arrow, send Selected Action Projectile Image
        var rangeLines = this._checkProjectileSuccess(character, enemy);
        if (rangeLines.isFound) {
            var arrow = game.physics.add.sprite(character.x, character.y, 'arrow'),
                enemyCenter = game.physics.add.sprite(enemy.x + 25, enemy.y + 25, 'arrow');
            enemyCenter.displayWidth = 1;
            enemyCenter.displayHeight = 1;
            enemyCenter.visible = false;
            arrow.displayWidth = 50;
            arrow.displayHeight = 25;
            var angle = game.physics.moveToObject(arrow, enemyCenter, 0, 500);
            arrow.setRotation(angle + 180 / 57.2958);
            game.physics.add.overlap(arrow, enemyCenter, function () {
                arrow.destroy();
                enemyCenter.destroy();
            });
            return true;
        }
        return false;
    };

    this._removeThrownWeapon = (character, enemy, hasHit, characterEnergy) => {
        // TODO: If enemy is hit, add item to tempInventory?
        // TODO: If enemy not hit, add item to character + thrownRange in direction of enemy
        // TODO: If there's a lootbag on the ground, add items to lootbag
        var itemX = enemy.x,
            itemY = enemy.y,
            item,
            isMainHandAttack = characterEnergy.actionId === EnumHelper.actionEnum.attackMainHand;
        if (hasHit) {
            itemX = enemy.x;
            itemY = enemy.y;
        }
        item = game.add.image(itemX, itemY, characterEnergy.selectedAction.image).setOrigin(0, 0);
        item.displayWidth = 50;
        item.displayHeight = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(characterEnergy.selectedAction);
        game.items.add(item);
        // TODO: Check if this is overridden with each killed enemy
        game.input.setHitArea([item]);
        game.sceneManager.bindItemEvents(item);
        character.characterConfig.inventory[isMainHandAttack ? 'mainHand' : 'offHand'] = lodash.cloneDeep(InventoryConfig.weapons.defaultEquipment);
    };

    this._checkMainHandAttack = (character, enemy) => {
        // Check if in range
        var charConfig = character.characterConfig,
            attack = this._canAttack(character, enemy);
        if (attack.canAttack) {
            // If it is a ranged weapon check if projectile hits
            if (charConfig.energy.selectedAction.range > 1 && (charConfig.energy.selectedAction.ammunition && charConfig.inventory.offHand.ammunition &&
                charConfig.inventory.offHand.ammunition === charConfig.energy.selectedAction.ammunition && charConfig.inventory.offHand.quantity > 0)) {
                var isLoadingWeapon = charConfig.energy.selectedAction.properties
                    ? charConfig.energy.selectedAction.properties.indexOf(EnumHelper.weaponPropertiesEnum.loading) > -1
                    : false,
                    hasBeenUsed = false;
                hasBeenUsed = charConfig.energy.selectedAction.hasBeenUsed;
                charConfig.energy.selectedAction.hasBeenUsed = isLoadingWeapon > -1;
                if (!hasBeenUsed && this._isProjectileHitting(character, enemy)) {
                    charConfig.inventory.offHand.quantity--;
                    this._tryAttack(character, enemy, this._getAttackAttribute(charConfig));
                    return true;
                }
            }
            if (!charConfig.energy.selectedAction.ammunition) {
                var canAttack = true;
                if (charConfig.energy.selectedAction.location === 'mainHand' && charConfig.energy.selectedAction.hold === 2 &&
                    charConfig.inventory.offHand.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                    canAttack = false;
                }
                if (canAttack) {
                    if (attack.throwAttack) {
                        if (this._isProjectileHitting(character, enemy)) {
                            var characterEnergy = lodash.cloneDeep(charConfig.energy),
                                hasHit = this._tryAttack(character, enemy, this._getAttackAttribute(charConfig), false, false, attack.throwAttack);
                            this._removeThrownWeapon(character, enemy, hasHit, characterEnergy);
                            return hasHit;
                        }
                    } else {
                        return this._tryAttack(character, enemy, this._getAttackAttribute(charConfig), false, false, attack.throwAttack);
                    }
                }
            }
        }
        return false;
    };

    this._checkOffHandAttack = (character, enemy) => {
        // Check if in range
        var charConfig = character.characterConfig,
            attack = this._canAttack(character, enemy);
        if (attack.canAttack) {
            // If it is a ranged weapon check if projectile hits
            if (charConfig.energy.selectedAction.range > 1) {
                if (this._isProjectileHitting(character, enemy)) {
                    this._tryAttack(character, enemy, this._getAttackAttribute(charConfig), false, true);
                    return true;
                }
            } else {
                if (attack.throwAttack) {
                    if (this._isProjectileHitting(character, enemy)) {
                        var characterEnergy = lodash.cloneDeep(charConfig.energy),
                            hasHit = this._tryAttack(character, enemy, this._getAttackAttribute(charConfig), false, false, attack.throwAttack);
                        this._removeThrownWeapon(character, enemy, hasHit, characterEnergy);
                        return hasHit;
                    }
                } else {
                    return this._tryAttack(character, enemy, this._getAttackAttribute(charConfig), false, true, attack.throwAttack);
                }
            }
        }
        return false;
    };

    this._checkSpellAttack = (character, enemy) => {
        // TODO: Check if offhand is empty?
        var charConfig = character.characterConfig;
        if (charConfig.mana.max - charConfig.mana.spent >= charConfig.energy.selectedAction.cost) {
            var attack = this._canAttack(character, enemy);
            if (attack.canAttack) {
                if (charConfig.energy.selectedAction.range > 1 && charConfig.energy.selectedAction.area.shape === EnumHelper.areaEnum.point) {
                    if (this._isProjectileHitting(character, enemy)) {
                        return this._tryAttack(character, enemy, this._getAttackAttribute(charConfig), true);
                    }
                } else if (charConfig.energy.selectedAction.range > 1 && charConfig.energy.selectedAction.area.shape === EnumHelper.areaEnum.line) {
                    return this._checkLineShapedSpell(character, enemy);
                } else if (charConfig.energy.selectedAction.range > 1 && charConfig.energy.selectedAction.area.shape === EnumHelper.areaEnum.cube) {
                    return this._checkCubeShapedSpell(character, enemy);
                } else {
                    return this._tryAttack(character, enemy, this._getAttackAttribute(charConfig), true);
                }
            }
        }
        return false;
    };

    this._getCharacterPoints = (character, enemy) => {
        var charX, charY, enemyX, enemyY;
        if (character.x > enemy.x && character.y > enemy.y) {
            charX = character.x;
            charY = character.y;
            enemyX = enemy.x + enemy.width - 10;
            enemyY = enemy.y + enemy.height - 10;
        } else if (character.x < enemy.x && character.y < enemy.y) {
            charX = character.x + character.width - 10;
            charY = character.y + character.height - 10;
            enemyX = enemy.x;
            enemyY = enemy.y;
        } else if (character.x > enemy.x && character.y < enemy.y) {
            charX = character.x;
            charY = character.y + character.height - 10;
            enemyX = enemy.x + enemy.width - 10;
            enemyY = enemy.y;
        } else if (character.x < enemy.x && character.y > enemy.y) {
            charX = character.x + character.width - 10;
            charY = character.y;
            enemyX = enemy.x;
            enemyY = enemy.y + enemy.height - 10;
        } else if (character.x < enemy.x && character.y === enemy.y) {
            charX = character.x + character.width - 10;
            charY = character.y;
            enemyX = enemy.x;
            enemyY = enemy.y;
        } else if (character.x > enemy.x && character.y === enemy.y) {
            charX = character.x;
            charY = character.y;
            enemyX = enemy.x + enemy.width - 10;
            enemyY = enemy.y;
        } else if (character.x === enemy.x && character.y < enemy.y) {
            charX = character.x + character.width - 10;
            charY = character.y + character.height - 10;
            enemyX = enemy.x;
            enemyY = enemy.y;
        } else if (character.x === enemy.x && character.y > enemy.y) {
            charX = character.x;
            charY = character.y;
            enemyX = enemy.x + enemy.width - 10;
            enemyY = enemy.y + enemy.height - 10;
        }
        return {
            charX: charX,
            charY: charY,
            enemyX: enemyX,
            enemyY: enemyY
        };
    };

    this._checkLineShapedSpell = (character, enemy) => {
        var characterPoints = this._getCharacterPoints(character, enemy),
            linePoints = this._supercoverLine(characterPoints.charX, characterPoints.charY, characterPoints.enemyX, characterPoints.enemyY),
            targetsToHit = [],
            tilesToAnimate = [],
            target,
            charConfig = lodash.cloneDeep(character.characterConfig),
            index,
            hasHit = false,
            leftoverImage = charConfig.energy.selectedAction.imageLeftover;
        linePoints.shift();
        _.each(linePoints, function (point) {
            var tile = game.activeMap.levelMap[point.y / 50][point.x / 50];
            if (Math.floor(tile) === 0) {
                target = !enemy.characterConfig.isPlayerControlled
                    ? game.enemies.characters.getChildren().find(function (enemy) {
                        return enemy.x === point.x && enemy.y === point.y;
                    })
                    : game.characters.characters.getChildren().find(function (enemy) {
                        return enemy.x === point.x && enemy.y === point.y;
                    });
                if (target) {
                    if (charConfig.energy.selectedAction.area.targets === -1) {
                        if (targetsToHit.length < 1) {
                            targetsToHit.push(target);
                        }
                    }
                    else if (charConfig.energy.selectedAction.area.targets > 0 &&
                        charConfig.energy.selectedAction.area.targets <= targetsToHit.length) {
                        targetsToHit.push(target);
                    }
                }
                tilesToAnimate.push({ x: point.x, y: point.y });
            } else {
                targetsToHit.push(-1);
                tilesToAnimate.push(-1);
            }
        });
        index = targetsToHit.indexOf(-1);
        if (index !== -1) {
            targetsToHit.splice(index, targetsToHit.length);
            tilesToAnimate.splice(index, tilesToAnimate.length);
        }
        if (targetsToHit.length > 0) {
            var self = this,
                lineGroup = game.add.group();
            _.each(tilesToAnimate, function (tile) {
                var img = game.add.image(tile.x, tile.y, leftoverImage).setOrigin(0, 0);
                img.displayWidth = 50;
                img.displayHeight = 50;
                lineGroup.add(img);
            });
            _.each(targetsToHit, function (enemy) {
                var attack = self._tryAttack(character, enemy, self._getAttackAttribute(charConfig), true);
                character.characterConfig.energy.actionId = charConfig.energy.actionId;
                character.characterConfig.energy.selectedAction = charConfig.energy.selectedAction;
                if (attack) {
                    hasHit = true;
                }
            });
            setTimeout(function () {
                lineGroup.destroy(true);
                lineGroup = null;
            }, 1250);
        }
        character.characterConfig.energy.actionId = -1;
        character.characterConfig.energy.selectedAction = null;
        return hasHit;
    };

    this._checkCubeShapedSpell = (character, enemy) => {
        var characterPoints = this._getCharacterPoints(character, enemy),
            linePoints = this._supercoverLine(characterPoints.charX, characterPoints.charY, characterPoints.enemyX, characterPoints.enemyY),
            canHit = true,
            charConfig = lodash.cloneDeep(character.characterConfig),
            length = charConfig.energy.selectedAction.area.length,
            cubeGroup = game.add.group(),
            hasHit = false,
            leftoverImage = charConfig.energy.selectedAction.imageLeftover;
        _.each(linePoints, function (point) {
            var tile = game.activeMap.levelMap[point.y / 50][point.x / 50];
            if (Math.floor(tile) !== 0) {
                canHit = false;
            }
        });
        if (canHit) {
            var startY = enemy.y - 50 * length,
                startX = enemy.x - 50 * length,
                endY = enemy.y + 50 * length + 50,
                endX = enemy.x + 50 * length + 50;
            var area = this._getCubeShapedAffectedObjects(enemy, character);
            for (let y = startY, j = 0; y < endY; y += 50, j++) {
                for (let x = startX, i = 0; x < endX; x += 50, i++) {
                    if ((y >= 0 || y < game.activeMap.levelMap.length * 50) && (x >= 0 || x < game.activeMap.levelMap.length * 50)) {
                        if (area[j][i] === 1) {
                            var t = game.activeMap.tiles.getChildren().find(function (tile) {
                                return tile.x === x && tile.y === y;
                            });
                            if (t) {
                                var img = game.add.image(t.x, t.y, leftoverImage).setOrigin(0, 0);
                                img.displayWidth = 50;
                                img.displayHeight = 50;
                                cubeGroup.add(img);
                            }
                            var target = game.initiative.find(function (character) {
                                return character.x === x && character.y === y;
                            });
                            if (target) {
                                var attack = this._tryAttack(character, target, this._getAttackAttribute(charConfig), true);
                                character.characterConfig.energy.actionId = charConfig.energy.actionId;
                                character.characterConfig.energy.selectedAction = charConfig.energy.selectedAction;
                                if (attack) {
                                    hasHit = true;
                                }
                            }
                        } else if (area[j][i] === 0) {
                            var o = game.activeMap.objects.getChildren().find(function (tile) {
                                return tile.x === x && tile.y === y;
                            });
                            if (o) {
                                var img = game.add.image(o.x, o.y, leftoverImage).setOrigin(0, 0);
                                img.displayWidth = 50;
                                img.displayHeight = 50;
                                cubeGroup.add(img);
                            } else {
                                var t = game.activeMap.tiles.getChildren().find(function (tile) {
                                    return tile.x === x && tile.y === y;
                                });
                                if (t) {
                                    var img = game.add.image(t.x, t.y, leftoverImage).setOrigin(0, 0);
                                    img.displayWidth = 50;
                                    img.displayHeight = 50;
                                    cubeGroup.add(img);
                                }
                            }
                        }
                    }
                }
            }
            setTimeout(function () {
                cubeGroup.destroy(true);
                cubeGroup = null;
            }, 1250);

        }
        character.characterConfig.energy.actionId = -1;
        character.characterConfig.energy.selectedAction = null;
        return hasHit;
    };

    this._getCubeShapedAffectedObjects = (enemy, character) => {
        var area = [],
            areaLength = 50 * character.characterConfig.energy.selectedAction.area.length;
        for (let y = enemy.y - areaLength, j = 0; y < enemy.y + (areaLength * 2) - 50; y += 50, j++) {
            area[j] = [];
            for (let x = enemy.x - areaLength, i = 0; x < enemy.x + (areaLength * 2) - 50; x += 50, i++) {
                if (x >= 0 && x <= game.activeMap.levelMap[0].length * 50 && y >= 0 && y <= game.activeMap.levelMap.length * 50) {
                    if (Math.floor(game.activeMap.levelMap[y / 50][x / 50]) === 0) {
                        area[j][i] = 1;
                    } else {
                        area[j][i] = 0;
                    }
                } else {
                    area[j][i] = -1;
                }
            }
        }
        // top
        for (let i = (area.length - 3) / 2; i >= 0; i--) {
            if (area[i + 1][(area.length - 1) / 2] === 0 || area[i + 1][(area.length - 1) / 2] === -1) {
                area[i][(area.length - 1) / 2] = -1;
            }
        }
        // bottom
        for (let i = (area.length + 1) / 2; i < area.length; i++) {
            if (area[i - 1][(area.length - 1) / 2] === 0 || area[i - 1][(area.length - 1) / 2] === -1) {
                area[i][(area.length - 1) / 2] = -1;
            }
        }
        // left
        for (let j = (area.length - 3) / 2; j >= 0; j--) {
            if (area[(area.length - 1) / 2][j + 1] === 0 || area[(area.length - 1) / 2][j + 1] === -1) {
                area[(area.length - 1) / 2][j] = -1;
            }
        }
        // right
        for (let j = (area.length + 1) / 2; j < area.length; j++) {
            if (area[(area.length - 1) / 2][j - 1] === 0 || area[(area.length - 1) / 2][j - 1] === -1) {
                area[(area.length - 1) / 2][j] = -1;
            }
        }
        // top-left
        for (let i = (area.length - 3) / 2; i >= 0; i--) {
            for (let j = (area.length - 3) / 2; j >= 0; j--) {
                if (area[i + 1][j] === 0 && area[i][j + 1] === 0 || area[i + 1][j] === -1 && area[i][j + 1] === -1
                    || area[i + 1][j] === -1 && area[i][j + 1] === 0 || area[i + 1][j] === 0 && area[i][j + 1] === -1) {
                    area[i][j] = -1;
                }
            }
        }
        // top-right
        for (let i = (area.length - 3) / 2; i >= 0; i--) {
            for (let j = (area.length - 1) / 2 + 1; j < area.length; j++) {
                if (area[i + 1][j] === 0 && area[i][j - 1] === 0 || area[i + 1][j] === -1 && area[i][j - 1] === -1
                    || area[i + 1][j] === -1 && area[i][j - 1] === 0 || area[i + 1][j] === 0 && area[i][j - 1] === -1) {
                    area[i][j] = -1;
                }
            }
        }
        // bottom-left
        for (let i = (area.length - 1) / 2 + 1; i < area.length; i++) {
            for (let j = (area.length - 3) / 2; j >= 0; j--) {
                if (area[i - 1][j] === 0 && area[i][j + 1] === 0 || area[i - 1][j] === -1 && area[i][j + 1] === -1
                    || area[i - 1][j] === -1 && area[i][j + 1] === 0 || area[i - 1][j] === 0 && area[i][j + 1] === -1) {
                    area[i][j] = -1;
                }
            }
        }
        //bottom-right
        for (let i = (area.length - 1) / 2 + 1; i < area.length; i++) {
            for (let j = (area.length - 1) / 2 + 1; j < area.length; j++) {
                if (area[i - 1][j] === 0 && area[i][j - 1] === 0 || area[i - 1][j] === -1 && area[i][j - 1] === -1
                    || area[i - 1][j] === -1 && area[i][j - 1] === 0 || area[i - 1][j] === 0 && area[i][j - 1] === -1) {
                    area[i][j] = -1;
                }
            }
        }
        return area;
    };

    this._removeArmorPointsFromEquippedInventory = (enemy, value) => {
        // TODO: remove durability points from EVERYTHING except default stuff.
        // if armor piece, it will lose 1/3 (2/3) armor when 1/3 (2/3) durability is gone
        // if weapon piece, it will lose 1/3 (2/3) attack power when 1/3 (2/3) durability is gone
        var pieceHit = Math.floor(Math.random() * 6) + 1,
            enemyCharConfig = enemy.characterConfig,
            inventory = enemyCharConfig.inventory,
            hasHit = false;
        switch (pieceHit) {
            case EnumHelper.inventoryEnum.offHand:
                if (inventory.offHand.type !== InventoryConfig.weapons.defaultEquipment.type && inventory.offHand.armor && inventory.offHand.durability !== 0
                    && !inventory.offHand.quantity) {
                    if (inventory.offHand.durability.current - value <= 0) {
                        inventory.feet.durability.current = 0;
                        inventory.offHand.armor = 0;
                    } else {
                        inventory.offHand.durability.current -= value;
                    }
                    hasHit = true;
                }
                break;
            case EnumHelper.inventoryEnum.head:
                if (inventory.head.type !== InventoryConfig.head.defaultEquipment.type && inventory.head.durability !== 0) {
                    if (inventory.head.durability.current - value <= 0) {
                        inventory.feet.durability.current = 0;
                        inventory.head.armor = 0;
                    } else {
                        inventory.head.durability.current -= value;
                    }
                    hasHit = true;
                }
                break;
            case EnumHelper.inventoryEnum.body:
                if (inventory.body.type !== InventoryConfig.body.defaultEquipment.type && inventory.body.durability !== 0) {
                    if (inventory.body.durability.current - value <= 0) {
                        inventory.feet.durability.current = 0;
                        inventory.body.armor = 0;
                    } else {
                        inventory.body.durability.current -= value;
                    }
                    hasHit = true;
                }
                break;
            case EnumHelper.inventoryEnum.hands:
                if (inventory.hands.type !== InventoryConfig.hands.defaultEquipment.type && inventory.hands.durability !== 0) {
                    if (inventory.hands.durability.current - value <= 0) {
                        inventory.feet.durability.current = 0;
                        inventory.hands.armor = 0;
                    } else {
                        inventory.hands.durability.current -= value;
                    }
                    hasHit = true;
                }
                break;
            case EnumHelper.inventoryEnum.feet:
                if (inventory.feet.type !== InventoryConfig.feet.defaultEquipment.type && inventory.feet.durability !== 0) {
                    if (inventory.feet.durability.current - value <= 0) {
                        inventory.feet.durability.current = 0;
                        inventory.feet.armor = 0;
                    } else {
                        inventory.feet.durability.current -= value;
                    }
                    hasHit = true;
                }
                break;
            default:
                break;
        }
        enemyCharConfig.armor = enemyCharConfig.inventory.head.armor +
            enemyCharConfig.inventory.body.armor +
            enemyCharConfig.inventory.hands.armor +
            enemyCharConfig.inventory.feet.armor +
            (enemyCharConfig.inventory.offHand.armor
                ? enemyCharConfig.inventory.offHand.armor
                : 0) + enemyCharConfig.attributes.dexterity;
        return hasHit;
    };

    this._showStatusText = function (enemy, text) {
        var statusText = game.add.text(enemy.x, enemy.y - 25, text, { color: '#dd0000' });
        setTimeout(function () {
            statusText.destroy();
        }, 800);
    };

    this._tryAttack = (character, enemy, attackAttribute, isSpell, isOffHand) => {
        var self = this,
            charConfig = character.characterConfig,
            enemyCharConfig = enemy.characterConfig,
            d20 = Math.floor(Math.random() * 20) + 1 + attackAttribute,
            enemyD20 = Math.floor(Math.random() * 20) + 1 + enemy.characterConfig.attributes.dexterity,
            hitSound,
            hasHit = false,
            isVersatile = charConfig.energy.selectedAction.properties
                ? charConfig.energy.selectedAction.properties.indexOf(EnumHelper.weaponPropertiesEnum.versatile) > -1
                : false;
        if (d20 < enemyD20) {
            this._showStatusText(enemy, 'Too quick for ya!');
        } else {
            if (d20 <= enemyCharConfig.armor) {
                if (enemyCharConfig.armor - enemyCharConfig.attributes.dexterity > 0) {
                    _.each(charConfig.energy.selectedAction.damage, function (damage) {
                        var attackDice = isVersatile &&
                            charConfig.inventory.offHand.type === EnumHelper.inventoryEnum.defaultEquipment
                            ? damage.versatileValue.split('d')
                            : damage.value.split('d'),
                            attackDamage = parseInt(attackDice[0]) * (Math.floor(Math.random() * parseInt(attackDice[1])) + 1)
                                + (isOffHand ? 0 : attackAttribute);
                        // TODO: Remove durability from the same armor piece in case of multi damage type attack
                        // TODO: If armor was not hit, enemy loses hp
                        if (self._removeArmorPointsFromEquippedInventory(enemy, Math.ceil(attackDamage / 2))) {
                            StatusIconConfig.showArmorIcon(game, enemy, Math.ceil(attackDamage / 2));
                            if (charConfig.energy.selectedAction.sound) {
                                hitSound = game.sound.add(charConfig.energy.selectedAction.sound.hittingArmor, { volume: 0.5 });
                                hitSound.play();
                                hasHit = true;
                            }
                        }
                    });
                }
                if (!hasHit) {
                    this._showStatusText(enemy, 'Missed all armor!');
                }
            } else {
                _.each(charConfig.energy.selectedAction.damage, function (damage) {
                    var attackDice = isVersatile &&
                        charConfig.inventory.offHand.type === EnumHelper.inventoryEnum.defaultEquipment
                        ? damage.versatileValue.split('d')
                        : damage.value.split('d'),
                        attackDamage = parseInt(attackDice[0]) * (Math.floor(Math.random() * parseInt(attackDice[1])) + 1)
                            + (isOffHand ? 0 : attackAttribute);
                    if (enemyCharConfig.invulnerabilities.indexOf(damage.type) === -1) {
                        if (enemyCharConfig.resistances.indexOf(damage.type) !== -1) {
                            enemyCharConfig.life.current -= Math.ceil(attackDamage / 2);
                            StatusIconConfig.showLifeIcon(game, enemy, Math.ceil(attackDamage / 2));
                            if (charConfig.energy.selectedAction.sound) {
                                hitSound = game.sound.add(charConfig.energy.selectedAction.sound.hittingFlesh, { volume: 0.5 });
                                hitSound.play();
                            }
                            self._showMissedText(enemy, 'Resistant!');
                        } else if (enemyCharConfig.vulnerabilities.indexOf(damage.type) !== -1) {
                            enemyCharConfig.life.current -= (attackDamage * 2);
                            StatusIconConfig.showLifeIcon(game, enemy, attackDamage * 2);
                            if (charConfig.energy.selectedAction.sound) {
                                hitSound = game.sound.add(charConfig.energy.selectedAction.sound.hittingFlesh, { volume: 0.5 });
                                hitSound.play();
                            }
                            self._showMissedText(enemy, 'Vulnerable!');
                        } else {
                            enemyCharConfig.life.current -= attackDamage;
                            StatusIconConfig.showLifeIcon(game, enemy, attackDamage);
                            if (charConfig.energy.selectedAction.sound) {
                                hitSound = game.sound.add(charConfig.energy.selectedAction.sound.hittingFlesh, { volume: 0.5 });
                                hitSound.play();
                            }
                        }
                        hasHit = true;
                    } else {
                        self._showMissedText(enemy, 'Invulnerable!');
                    }
                });
            }
        }
        if (isSpell) {
            charConfig.mana.spent += charConfig.energy.selectedAction.cost;
            StatusIconConfig.showManaIcon(game, character, charConfig.energy.selectedAction.cost);
            charConfig.energy.spent += EnergyConfig.attackSpell.cost;
            StatusIconConfig.showEnergyIcon(game, character, EnergyConfig.attackSpell.cost);
        } else if (isOffHand) {
            charConfig.energy.spent += EnergyConfig.attackOffHand.cost;
            StatusIconConfig.showEnergyIcon(game, character, EnergyConfig.attackOffHand.cost);
        } else {
            charConfig.energy.spent += EnergyConfig.attackMainHand.cost;
            StatusIconConfig.showEnergyIcon(game, character, EnergyConfig.attackMainHand.cost);
        }

        charConfig.energy.actionId = -1;
        charConfig.energy.selectedAction = null;
        game.events.emit('removeSelectedActionIcon');

        this._checkInitiative(enemy);
        return hasHit;
    };

    this._checkInitiative = (enemy) => {
        var charConfig = enemy.characterConfig,
            lootbag;
        if (charConfig.life.current <= 0) {
            this._addItemsFromBodyToInventory(enemy);
            if (charConfig.inventory.slots.items.length > 0) {
                // TODO: If there's an item on the ground, add it to the lootbag
                lootbag = game.add.image(enemy.x, enemy.y, 'lootbag').setOrigin(0, 0);
                lootbag.displayWidth = 50;
                lootbag.displayHeight = 50;
                lootbag.objectConfig = lodash.cloneDeep(game.activeMap.objConfig);
                lootbag.objectConfig.belongsTo = enemy;
                lootbag.objectConfig.id = EnumHelper.idEnum.lootbag.id;
                lootbag.objectConfig.isInteractible = true;
                game.activeMap.deadCharacters.add(lootbag);
                game.input.setHitArea([lootbag]);
                lootbag.on('pointerdown', function () {
                    if (game.activeCharacter.characterConfig.isPlayerControlled || game.activeCharacter.characterConfig.isMasterControlled) {
                        game.characters.interactWithObject(lootbag);
                    }
                });
            }
            if (!charConfig.isPlayerControlled && !charConfig.isMasterControlled) {
                _.each(game.characters.characters.getChildren(), function (character) {
                    character.characterConfig.experience.current += Math.floor(enemy.characterConfig.experience / game.characters.characters.getChildren().length);
                    var difference = Math.floor(character.characterConfig.experience.current - character.characterConfig.experience.nextLevel);
                    if (difference >= 0) {
                        character.characterConfig.experience.current = difference;
                        character.characterConfig.experience.level++;
                        character.characterConfig.experience.attributePoints++;
                        character.characterConfig.experience.nextLevel = Math.floor(character.characterConfig.experience.nextLevel * 1.3);
                    }
                });
                game.characters.souls.current += enemy.characterConfig.souls;
                // TODO: Attribute points cost 5 souls then 10 then 15 and so on. Change game logic to reflect this
                // TODO: Skills cost X souls instead of ^ so we won't need skill points
                var difference = game.characters.souls.current - game.characters.souls.nextLevel;
                if (difference >= 0) {
                    game.characters.souls.current = difference;
                    game.characters.souls.nextLevel += 5;
                    game.characters.souls.skillPoints++;
                }
                game.events.emit('updateSouls', game.characters.souls);
            }

            enemy.destroy();
            if (charConfig.isPlayerControlled) {
                game.characters.characters.remove(enemy);
            } else {
                game.enemies.characters.remove(enemy);
                this._createNewEnemies();
            }
            game.initiative = game.sceneManager.getInitiativeArray([enemy]);
            game.events.emit('updateAttributePointsPanel', game.activeCharacter);
            this.hideRangeLines();
            if (game.activeCharacter.x === enemy.x && game.activeCharacter.y === enemy.y
                && (game.activeCharacter.characterConfig.isPlayerControlled || game.activeCharacter.characterConfig.isMasterControlled)) {
                game.sceneManager.endTurn();
            }
        }
        game.events.emit('showCharacterInitiative', game.initiative);
    };

    this._addItemsFromBodyToInventory = (character) => {
        if (character.characterConfig.inventory.mainHand.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            character.characterConfig.inventory.slots.items.push(lodash
                .cloneDeep(character.characterConfig.inventory.mainHand));
            character.characterConfig.inventory.mainHand = lodash.cloneDeep(InventoryConfig.weapons.defaultEquipment);
        }
        if (character.characterConfig.inventory.offHand.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            character.characterConfig.inventory.slots.items.push(lodash
                .cloneDeep(character.characterConfig.inventory.offHand));
            character.characterConfig.inventory.offHand = lodash.cloneDeep(InventoryConfig.weapons.defaultEquipment);
        }
        if (character.characterConfig.inventory.head.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            character.characterConfig.inventory.slots.items.push(lodash.cloneDeep(character.characterConfig.inventory.head));
            character.characterConfig.inventory.head = lodash.cloneDeep(InventoryConfig.head.defaultEquipment);
        }
        if (character.characterConfig.inventory.body.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            character.characterConfig.inventory.slots.items.push(lodash.cloneDeep(character.characterConfig.inventory.body));
            character.characterConfig.inventory.body = lodash.cloneDeep(InventoryConfig.body.defaultEquipment);
        }
        if (character.characterConfig.inventory.hands.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            character.characterConfig.inventory.slots.items.push(lodash.cloneDeep(character.characterConfig.inventory.hands));
            character.characterConfig.inventory.hands = lodash.cloneDeep(InventoryConfig.hands.defaultEquipment);
        }
        if (character.characterConfig.inventory.feet.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            character.characterConfig.inventory.slots.items.push(lodash.cloneDeep(character.characterConfig.inventory.feet));
            character.characterConfig.inventory.feet = lodash.cloneDeep(InventoryConfig.feet.defaultEquipment);
        }
    };

    this._createNewEnemies = () => {
        if (game.enemies.characters.getChildren().length === 0 && game.scene.key === 'TestLevelScene') {
            game.enemies.total++;
            for (let i = 0; i < game.enemies.total; i++) {
                var positionFound = false,
                    enemy,
                    x,
                    y;
                while (!positionFound) {
                    x = Math.floor(Math.random() * game.activeMap.levelMap[0].length) * 50,
                        y = Math.floor(Math.random() * game.activeMap.levelMap.length) * 50;
                    var tiles = game.activeMap.tiles.getChildren().filter(function (object) {
                        return object.x === x && object.y === y;
                    });
                    if (tiles.length > 0) {
                        positionFound = true;
                    }
                }
                enemy = i % 5 === 0
                    ? game.enemies.addNewRandomVulnerabilitiesCharacter(x, y, EnemyConfig.test)
                    : game.enemies.addNewCharacter(x, y, EnemyConfig.test);
                game.input.setHitArea([enemy]);
                game.sceneManager.bindEnemyEvents(enemy);
            }
            //game.initiative = null;
            game.initiativeIndex = -1;
        }
    };

    this._checkProjectileSuccess = (character, enemy) => {
        // TODO: Check Bresenham's algorithm (https://www.redblobgames.com/grids/line-drawing.html)
        var pointMatrix = this._getPointMatrix(character, enemy);
        var isNotBlocked,
            linePoints,
            pointsFound,
            lines = [],
            allLinePoints = [];
        for (let i = 0; i < pointMatrix.length; i++) {
            pointsFound = 0;
            for (let j = 0; j < pointMatrix[i].length; j++) {
                isNotBlocked = true;
                linePoints = this._supercoverLine(pointMatrix[i][j][0], pointMatrix[i][j][1], pointMatrix[i][j][2], pointMatrix[i][j][3]);
                _.each(linePoints, function (point) {
                    var tile = game.activeMap.levelMap[point.y / 50][point.x / 50];
                    if (Math.floor(tile) !== 0) {
                        isNotBlocked = false;
                    }
                });
                if (isNotBlocked) {
                    pointsFound++;
                    allLinePoints.push(linePoints);
                    lines.push({
                        charX: pointMatrix[i][j][0],
                        charY: pointMatrix[i][j][1],
                        enemyX: pointMatrix[i][j][2],
                        enemyY: pointMatrix[i][j][3]
                    });
                    if (pointsFound >= 2) {
                        allLinePoints.sort(function (a, b) {
                            if (a.length > b.length) {
                                return 1;
                            } else if (a.length < b.length) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });
                        return {
                            isFound: true,
                            lines: lines,
                            linePoints: allLinePoints[0]
                        };
                    }
                }
            }
        }

        return {
            isFound: false,
            lines: lines,
            linePoints: linePoints
        };
    };

    this._supercoverLine = function (characterX, characterY, enemyX, enemyY) {
        var dx = enemyX - characterX,
            dy = enemyY - characterY,
            nx = Math.abs(dx),
            ny = Math.abs(dy),
            signX = dx > 0 ? 1 : -1,
            signY = dy > 0 ? 1 : -1,
            p = {
                x: characterX,
                y: characterY
            },
            points = p.x % 50 === 0 && p.y % 50 === 0 ? [{ x: p.x, y: p.y }] : [];
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
            if (p.x % 10 === 0 || p.y % 10 === 0) {
                if (!points.find(function (point) {
                    return point.x === Math.floor(p.x - p.x % 50) &&
                        point.y === Math.floor(p.y - p.y % 50);
                })) {
                    points.push({
                        x: Math.floor(p.x - p.x % 50),
                        y: Math.floor(p.y - p.y % 50)
                    });
                }
            }
        }
        return points;
    };

    this._getPointMatrix = function (character, enemy) {
        var xyc = [
            [character.x, character.y, enemy.x, enemy.y],
            [character.x, character.y, enemy.x + enemy.width, enemy.y],
            [character.x, character.y, enemy.x, enemy.y + enemy.height],
            [character.x, character.y, enemy.x + enemy.width, enemy.y + enemy.height]
        ],
            xpyc = [
                [character.x + character.width, character.y, enemy.x, enemy.y],
                [character.x + character.width, character.y, enemy.x + enemy.width, enemy.y],
                [character.x + character.width, character.y, enemy.x, enemy.y + enemy.height],
                [character.x + character.width, character.y, enemy.x + enemy.width, enemy.y + enemy.height]
            ],
            xypc = [
                [character.x, character.y + character.height, enemy.x, enemy.y],
                [character.x, character.y + character.height, enemy.x + enemy.width, enemy.y],
                [character.x, character.y + character.height, enemy.x, enemy.y + enemy.height],
                [character.x, character.y + character.height, enemy.x + enemy.width, enemy.y + enemy.height]
            ],
            xpypc = [
                [character.x + character.width, character.y + character.height, enemy.x, enemy.y],
                [character.x + character.width, character.y + character.height, enemy.x + enemy.width, enemy.y],
                [character.x + character.width, character.y + character.height, enemy.x, enemy.y + enemy.height],
                [
                    character.x + character.width, character.y + character.height, enemy.x + enemy.width,
                    enemy.y + enemy.height
                ]
            ];
        var pointMatrix = [xyc, xpyc, xypc, xpypc];
        if (character.x > enemy.x && character.y === enemy.y) {
            pointMatrix = [xyc, xypc, xpyc, xpypc];
        } else if (character.x < enemy.x && character.y === enemy.y) {
            pointMatrix = [xpyc, xpypc, xyc, xypc];
        } else if (character.y > enemy.y && character.x === enemy.x) {
            pointMatrix = [xyc, xpyc, xypc, xpypc];
        } else if (character.y < enemy.y && character.x === enemy.x) {
            pointMatrix = [xypc, xpypc, xyc, xpyc];
        } else if (character.x > enemy.x && character.y > enemy.y) {
            pointMatrix = [xyc, xpyc, xypc, xpypc];
        } else if (character.x < enemy.x && character.y < enemy.y) {
            pointMatrix = [xpypc, xypc, xpyc, xyc];
        } else if (character.x < enemy.x && character.y > enemy.y) {
            pointMatrix = [xpyc, xyc, xpypc, xypc];
        } else if (character.x > enemy.x && character.y < enemy.y) {
            pointMatrix = [xpyc, xyc, xpypc, xypc];
        }
        return pointMatrix;
    };
};