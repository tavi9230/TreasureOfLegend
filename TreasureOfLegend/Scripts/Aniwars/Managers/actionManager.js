import { EnumHelper } from 'Aniwars/Helpers/enumHelper';
import { Pathfinder } from 'Aniwars/Helpers/pathfinder';
import { InventoryConfig } from 'Aniwars/Configurations/inventoryConfig';
import { EnergyConfig } from 'Aniwars/Configurations/energyConfig';
import { EnemyConfig } from 'Aniwars/Configurations/enemyConfig';
import { StatusIconConfig } from 'Aniwars/Configurations/statusIconConfig';

export const ActionManager = function (game) {
    var game = game,
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
                this._checkDefaultAction(character, enemy);
            } else if (charConfig.energy.actionId === EnumHelper.actionEnum.attackSpell) {
                this._checkSpellAttack(character, enemy);
            }
        }
    };

    // OBJECT INTERACTION -------------------------------------------------------------------------------------------------------------------
    this._interactWithDoor = (object) => {
        // TODO: Don't close door when another character is in it's position
        var charConfig = game.activeCharacter.characterConfig,
            x = object.x / 50,
            y = object.y / 50;
        charConfig.energy.spent += EnergyConfig.door.cost;
        StatusIconConfig.showEnergyIcon(game, game.activeCharacter, EnergyConfig.door.cost);
        game.events.emit('showCharacterInitiative', game.initiative);
        game.activeMap.levelMap = game.activeMap.copyMap(game.activeMap.levelMap, game.activeMap.previousMap);
        //door animations would be nice
        if (!object.objectConfig.isActivated) {
            game.activeMap.levelMap[y][x] = 0;
            if (object.objectConfig.id === EnumHelper.idEnum.door.type.up || object.objectConfig.id === EnumHelper.idEnum.door.type.down) {
                object.setX(object.x - 50);
            } else if (object.objectConfig.id === EnumHelper.idEnum.door.type.right || object.objectConfig.id === EnumHelper.idEnum.door.type.left) {
                object.setY(object.y - 50);
            }
        } else {
            game.activeMap.levelMap[y][x] = object.objectConfig.id;
        }
        var doorSound = game.sound.add('open_door', { volume: 0.5 });
        doorSound.play();
        object.objectConfig.isActivated = !object.objectConfig.isActivated;
        if (charConfig.isPlayerControlled) {
            game.activeMap.showMovementGrid();
        }
    };

    this._interactWithLootbag = (object) => {
        var lootbagOpenSound = game.sound.add('lootbag_open', { volume: 0.5 });
        lootbagOpenSound.play();
        game.events.emit('showDeadCharacterInventory', object);
    };

    this._interactWithWell = (object) => {
        var currentTurn = game.hudScene.getTurn();
        if (currentTurn - object.objectConfig.turnActivated >= object.objectConfig.turnsToReset) {
            object.objectConfig.turnActivated = 0;
            object.objectConfig.turnsToReset = 0;
            var activeCharacter = game.activeCharacter;
            if (object.objectConfig.id === EnumHelper.idEnum.well.type.health) {
                StatusIconConfig.showManaIcon(game, activeCharacter, -(activeCharacter.characterConfig.life.max - activeCharacter.characterConfig.life.spent));
                activeCharacter.characterConfig.life.current = activeCharacter.characterConfig.life.max;
            } else if (object.objectConfig.id === EnumHelper.idEnum.well.type.mana) {
                StatusIconConfig.showManaIcon(game, activeCharacter, -activeCharacter.characterConfig.mana.spent);
                activeCharacter.characterConfig.mana.spent = 0;
            } else if (object.objectConfig.id === EnumHelper.idEnum.well.type.movement) {
                StatusIconConfig.showMovementIcon(game, activeCharacter, -activeCharacter.characterConfig.movement.spent);
                activeCharacter.characterConfig.movement.spent = 0;
                game.activeMap.showMovementGrid();
            } else if (object.objectConfig.id === EnumHelper.idEnum.well.type.energy) {
                StatusIconConfig.showEnergyIcon(game, activeCharacter, -activeCharacter.characterConfig.energy.spent);
                activeCharacter.characterConfig.energy.spent = 0;
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
    };

    //ENEMY INTERACTION --------------------------------------------------------------------------------------------------------------------
    this._attackWithMainHand = (character, enemy) => {
        var self = this,
            charConfig = character.characterConfig,
            enemyCharConfig = enemy.characterConfig,
            attackAttribute = EnumHelper.attributeEnum.strength === charConfig.inventory.mainHand.attribute
                ? charConfig.attributes.strength
                : charConfig.attributes.dexterity,
            d20 = Math.floor(Math.random() * 20) + 1 + attackAttribute,
            hitSound;
        if (d20 <= enemyCharConfig.armor) {
            if (enemyCharConfig.armor - enemyCharConfig.naturalArmor > 0) {
                if (this._removeArmorPointsFromEquippedInventory(enemy, 1)) {
                    StatusIconConfig.showArmorIcon(game, enemy, 1);
                    if (charConfig.inventory.mainHand.sound) {
                        hitSound = game.sound.add(charConfig.inventory.mainHand.sound.hittingArmor, { volume: 0.5 });
                        hitSound.play();
                    }
                }
            } else if (enemyCharConfig.naturalArmor > 0) {
                enemyCharConfig.naturalArmor--;
                StatusIconConfig.showArmorIcon(game, enemy, 1);
                if (charConfig.inventory.mainHand.sound) {
                    hitSound = game.sound.add(charConfig.inventory.mainHand.sound.hittingFlesh, { volume: 0.5 });
                    hitSound.play();
                }
            }
        } else {
            _.each(charConfig.inventory.mainHand.damage, function (damage) {
                var attackDamage = Math.floor(Math.random() * damage.value) + 1 + Math.floor(attackAttribute / 2);
                if (enemyCharConfig.invulnerabilities.indexOf(damage.type) === -1) {
                    if (enemyCharConfig.resistances.indexOf(damage.type) !== -1) {
                        enemyCharConfig.life.current -= Math.ceil(attackDamage / 2);
                        StatusIconConfig.showLifeIcon(game, enemy, Math.ceil(attackDamage / 2));
                        if (charConfig.inventory.mainHand.sound) {
                            hitSound = game.sound.add(charConfig.inventory.mainHand.sound.hittingFlesh, { volume: 0.5 });
                            hitSound.play();
                        }
                    } else if (enemyCharConfig.vulnerabilities.indexOf(damage.type) !== -1) {
                        enemyCharConfig.life.current -= (attackDamage * 2);
                        StatusIconConfig.showLifeIcon(game, enemy, attackDamage * 2);
                        if (charConfig.inventory.mainHand.sound) {
                            hitSound = game.sound.add(charConfig.inventory.mainHand.sound.hittingFlesh, { volume: 0.5 });
                            hitSound.play();
                        }
                    } else {
                        enemyCharConfig.life.current -= attackDamage;
                        StatusIconConfig.showLifeIcon(game, enemy, attackDamage);
                        if (charConfig.inventory.mainHand.sound) {
                            hitSound = game.sound.add(charConfig.inventory.mainHand.sound.hittingFlesh, { volume: 0.5 });
                            hitSound.play();
                        }
                    }
                }
                if (enemyCharConfig.armor - enemyCharConfig.naturalArmor > 0) {
                    if (self._removeArmorPointsFromEquippedInventory(enemy, Math.ceil(attackDamage / 2))) {
                        StatusIconConfig.showArmorIcon(game, enemy, Math.ceil(attackDamage / 2));
                        if (charConfig.inventory.mainHand.sound) {
                            game.sound.add(charConfig.inventory.mainHand.sound.hittingArmor, { volume: 0.5 });
                            game.sound.play(charConfig.inventory.mainHand.sound.hittingArmor, { name: charConfig.inventory.mainHand.sound.hittingArmor });
                        }
                    }
                } else if (enemyCharConfig.naturalArmor > 0) {
                    enemyCharConfig.naturalArmor -= Math.ceil(attackDamage / 2);
                    StatusIconConfig.showArmorIcon(game, enemy, Math.ceil(attackDamage / 2));
                    if (enemyCharConfig.naturalArmor < 0) {
                        enemyCharConfig.naturalArmor = 0;
                    }
                    if (charConfig.inventory.mainHand.sound) {
                        hitSound = game.sound.add(charConfig.inventory.mainHand.sound.hittingFlesh, { volume: 0.5 });
                        hitSound.play();
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
        StatusIconConfig.showEnergyIcon(game, character, EnergyConfig.attackMainHand.cost);

        charConfig.energy.actionId = -1;
        charConfig.energy.selectedAction = null;
        game.events.emit('removeSelectedActionIcon');

        this._checkInitiative(enemy);
    };

    this._attackWithSpell = (character, enemy) => {
        var self = this,
            charConfig = character.characterConfig,
            enemyCharConfig = enemy.characterConfig,
            d20 = Math.floor(Math.random() * 20) + 1 + charConfig.attributes.intelligence,
            hitSound;
        if (d20 <= enemyCharConfig.armor) {
            if (enemyCharConfig.armor - enemyCharConfig.naturalArmor > 0) {
                if (this._removeArmorPointsFromEquippedInventory(enemy, 1)) {
                    StatusIconConfig.showArmorIcon(game, enemy, 1);
                }
                if (charConfig.energy.selectedAction.sound) {
                    hitSound = game.sound.add(charConfig.energy.selectedAction.sound.hittingArmor, { volume: 0.5 });
                    hitSound.play();
                }
            } else if (enemyCharConfig.naturalArmor > 0) {
                enemyCharConfig.naturalArmor--;
                StatusIconConfig.showArmorIcon(game, enemy, 1);
                if (charConfig.energy.selectedAction.sound) {
                    hitSound = game.sound.add(charConfig.energy.selectedAction.sound.hittingFlesh, { volume: 0.5 });
                    hitSound.play();
                }
            }
        } else {
            _.each(charConfig.energy.selectedAction.damage, function (damage) {
                var attackDamage = Math.floor(Math.random() * damage.value * Math.ceil(charConfig.energy.selectedAction.level / 2)) + 1 + Math.floor(charConfig.attributes.intelligence / 2);
                if (enemyCharConfig.invulnerabilities.indexOf(damage.type) === -1) {
                    if (enemyCharConfig.resistances.indexOf(damage.type) !== -1) {
                        enemyCharConfig.life.current -= Math.ceil(attackDamage / 2);
                        StatusIconConfig.showLifeIcon(game, enemy, Math.ceil(attackDamage / 2));
                        if (charConfig.energy.selectedAction.sound) {
                            hitSound = game.sound.add(charConfig.energy.selectedAction.sound.hittingFlesh, { volume: 0.5 });
                            hitSound.play();
                        }
                    } else if (enemyCharConfig.vulnerabilities.indexOf(damage.type) !== -1) {
                        enemyCharConfig.life.current -= (attackDamage * 2);
                        StatusIconConfig.showLifeIcon(game, enemy, attackDamage * 2);
                        if (charConfig.energy.selectedAction.sound) {
                            hitSound = game.sound.add(charConfig.energy.selectedAction.sound.hittingFlesh, { volume: 0.5 });
                            hitSound.play();
                        }
                    } else {
                        enemyCharConfig.life.current -= attackDamage;
                        StatusIconConfig.showLifeIcon(game, enemy, attackDamage);
                        if (charConfig.energy.selectedAction.sound) {
                            hitSound = game.sound.add(charConfig.energy.selectedAction.sound.hittingFlesh, { volume: 0.5 });
                            hitSound.play();
                        }
                    }
                }
                if (enemyCharConfig.armor - enemyCharConfig.naturalArmor > 0) {
                    if (self._removeArmorPointsFromEquippedInventory(enemy, Math.ceil(attackDamage / 2))) {
                        StatusIconConfig.showArmorIcon(game, enemy, Math.ceil(attackDamage / 2));
                        if (charConfig.energy.selectedAction.sound) {
                            hitSound = game.sound.add(charConfig.energy.selectedAction.sound.hittingArmor, { volume: 0.5 });
                            hitSound.play();
                        }
                    }
                } else if (enemyCharConfig.naturalArmor > 0) {
                    enemyCharConfig.naturalArmor -= Math.ceil(attackDamage / 2);
                    StatusIconConfig.showArmorIcon(game, enemy, Math.ceil(attackDamage / 2));
                    if (enemyCharConfig.naturalArmor < 0) {
                        enemyCharConfig.naturalArmor = 0;
                    }
                    if (charConfig.energy.selectedAction.sound) {
                        hitSound = game.sound.add(charConfig.energy.selectedAction.sound.hittingFlesh, { volume: 0.5 });
                        hitSound.play();
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
        StatusIconConfig.showManaIcon(game, character, charConfig.energy.selectedAction.cost);
        StatusIconConfig.showEnergyIcon(game, character, EnergyConfig.attackSpell.cost);

        charConfig.energy.actionId = -1;
        charConfig.energy.selectedAction = null;
        game.events.emit('removeSelectedActionIcon');

        this._checkInitiative(enemy);
    };

    this.showRangeLines = function (character, enemy) {
        var projectileLines = this._checkProjectileSuccess(character, enemy),
            charConfig = character.characterConfig;
        this.hideRangeLines();
        rangeLines = game.add.group();
        if (projectileLines.isFound && Math.abs(character.x - enemy.x) <= 50 * charConfig.energy.selectedAction.range &&
            Math.abs(character.y - enemy.y) <= 50 * charConfig.energy.selectedAction.range &&
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

    // PRIVATE -------------------------------------------------------------------------------------------------------------------------------
    this._checkProjectileSuccess = (character, enemy) => {
        // TODO: Check Bresenham's algorithm (https://www.redblobgames.com/grids/line-drawing.html)
        // TODO: Check if character.x > enemy.x or y and rearrange the pointMatrix accordingly
        var pointMatrix = [
            [
                [character.x, character.y, enemy.x, enemy.y],
                [character.x, character.y, enemy.x + enemy.width, enemy.y],
                [character.x, character.y, enemy.x, enemy.y + enemy.height],
                [character.x, character.y, enemy.x + enemy.width, enemy.y + enemy.height]
            ],
            [
                [character.x + character.width, character.y, enemy.x, enemy.y],
                [character.x + character.width, character.y, enemy.x + enemy.width, enemy.y],
                [character.x + character.width, character.y, enemy.x, enemy.y + enemy.height],
                [character.x + character.width, character.y, enemy.x + enemy.width, enemy.y + enemy.height]
            ],
            [
                [character.x, character.y + character.height, enemy.x, enemy.y],
                [character.x, character.y + character.height, enemy.x + enemy.width, enemy.y],
                [character.x, character.y + character.height, enemy.x, enemy.y + enemy.height],
                [character.x, character.y + character.height, enemy.x + enemy.width, enemy.y + enemy.height]
            ],
            [
                [character.x + character.width, character.y + character.height, enemy.x, enemy.y],
                [character.x + character.width, character.y + character.height, enemy.x + enemy.width, enemy.y],
                [character.x + character.width, character.y + character.height, enemy.x, enemy.y + enemy.height],
                [character.x + character.width, character.y + character.height, enemy.x + enemy.width, enemy.y + enemy.height]
            ]
        ];
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
                    if (Math.floor(game.activeMap.levelMap[point.y / 50][point.x / 50]) !== 0) {
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
                        allLinePoints.sort(function(a, b) {
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
            path = Pathfinder.getPathFromAToB(character, enemy, game.activeMap.levelMap);
            if (charConfig.isPlayerControlled && path) {
                game.characters.moveActiveCharacterNearObject(null, path[path.length - 2][0], path[path.length - 2][1]);
            }
        }
    };

    this._checkInitiative = (enemy) => {
        var charConfig = enemy.characterConfig,
            lootbag;
        if (charConfig.life.current <= 0) {
            this._addItemsFromBodyToInventory(enemy);
            if (charConfig.inventory.slots.items.length > 0) {
                lootbag = game.add.image(enemy.x, enemy.y, 'lootbag').setOrigin(0, 0);
                lootbag.displayWidth = 50;
                lootbag.displayHeight = 50;
                lootbag.objectConfig = lodash.cloneDeep(game.activeMap.objConfig);
                lootbag.objectConfig.belongsTo = enemy;
                lootbag.objectConfig.id = EnumHelper.idEnum.lootbag.id;
                lootbag.objectConfig.isInteractible = true;
                game.activeMap.deadCharacters.add(lootbag);
                // TODO: Check if this is overridden with each killed enemy
                game.input.setHitArea(game.activeMap.deadCharacters.getChildren());
                lootbag.on('pointerdown', function () {
                    if (game.activeCharacter.characterConfig.isPlayerControlled) {
                        game.characters.interactWithObject(lootbag);
                    }
                });
            }
            if (!charConfig.isPlayerControlled) {
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
        }
        game.events.emit('showCharacterInitiative', game.initiative);
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
                    var rangeLines = this._checkProjectileSuccess(character, enemy);
                    if (rangeLines.isFound) {
                        var arrow = game.physics.add.sprite(character.x + 25, character.y + 25, 'arrow'),
                            enemyCenter = game.physics.add.sprite(enemy.x + 25, enemy.y + 25, 'arrow');
                        enemyCenter.displayWidth = 1;
                        enemyCenter.displayHeight = 1;
                        enemyCenter.visible = false;
                        arrow.displayWidth = 50;
                        arrow.displayHeight = 25;
                        var angle = game.physics.moveToObject(arrow, enemyCenter, 100);
                        arrow.setRotation(angle + 180 / 57.2958);
                        game.physics.add.overlap(arrow, enemyCenter, function () {
                            arrow.destroy();
                            enemyCenter.destroy();
                        });
                        this._attackWithMainHand(character, enemy);
                    }
                } else {
                    this._attackWithMainHand(character, enemy);
                }
            }
        }
        // Otherwise move near the object and try again
        //else {
        //    this._tryMovingCharacter(character, enemy);
        //}
    };

    this._checkSpellAttack = (character, enemy) => {
        // TODO: Check if offhand is empty?
        var charConfig = character.characterConfig;
        if (charConfig.mana.max - charConfig.mana.spent >= 0) {
            if (Math.abs(character.x - enemy.x) <= 50 * charConfig.energy.selectedAction.range &&
                Math.abs(character.y - enemy.y) <= 50 * charConfig.energy.selectedAction.range &&
                (Math.abs(character.x - enemy.x) > 0 || Math.abs(character.y - enemy.y) > 0)
                && charConfig.energy.max - EnergyConfig.attackSpell.cost >= charConfig.energy.spent) {
                if (charConfig.energy.selectedAction.range > 1) {
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
                        this._attackWithSpell(character, enemy);
                    }
                } else {
                    this._attackWithSpell(character, enemy);
                }
            }
            //else {
            //    this._tryMovingCharacter(character, enemy);
            //}
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
};