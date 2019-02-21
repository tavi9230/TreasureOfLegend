import { Pathfinder } from 'Aniwars/Helpers/pathfinder';
import { EnumHelper } from 'Aniwars/Helpers/enumHelper';
import { ActionManager } from 'Aniwars/Managers/actionManager';
import { InventoryConfig } from 'Aniwars/Configurations/inventoryConfig';
import { StatusIconConfig } from 'Aniwars/Configurations/statusIconConfig';

export const Enemy = function (scene) {
    var game = scene,
        actionManager = new ActionManager(game);

    this.characterConfig = {
        life: {
            max: 5,
            current: 5
        },
        mana: {
            max: 0,
            spent: 0
        },
        movement: {
            max: 6,
            spent: 0,
            isMoving: false
        },
        armor: 0,
        velocity: 200,
        posX: 0,
        posY: 0,
        path: [],
        energy: {
            max: 3,
            spent: 0,
            actionId: -1,
            selectedAction: null,
            inProgress: null
        },
        inventory: {
            mainHand: lodash.cloneDeep(InventoryConfig.weapons.defaultEquipment),
            offHand: lodash.cloneDeep(InventoryConfig.weapons.defaultEquipment),
            head: lodash.cloneDeep(InventoryConfig.head.defaultEquipment),
            body: lodash.cloneDeep(InventoryConfig.body.defaultEquipment),
            feet: lodash.cloneDeep(InventoryConfig.feet.defaultEquipment),
            hands: lodash.cloneDeep(InventoryConfig.hands.defaultEquipment),
            slots: {
                max: 2,
                items: [lodash.cloneDeep(InventoryConfig.weapons.shortBow), lodash.cloneDeep(InventoryConfig.weapons.shortSword)]
            },
            money: 0,
            spells: []
        },
        attributes: {
            strength: 0,
            dexterity: 0,
            intelligence: 0
        },
        image: '',
        isPlayerControlled: false,
        isMasterControlled: false,
        traits: [EnumHelper.traitEnum.standard],
        statuses: [],
        resistances: [EnumHelper.damageTypeEnum.fire],
        vulnerabilities: [EnumHelper.damageTypeEnum.slashing],
        invulnerabilities: [EnumHelper.damageTypeEnum.bludgeoning],
        experience: 800,
        souls: 5,
        level: 1
    };
    this.map = game.activeMap;
    this.characters = game.add.group();

    this.addNewCharacter = (x, y, config, isMasterControlled = false) => {
        var character = game.physics.add.sprite(x, y, config.image).setOrigin(-0.25, 0.5);
        character.height = 50;
        character.width = 50;
        character.characterConfig = lodash.cloneDeep(this.characterConfig);
        var charConfig = character.characterConfig;
        charConfig.isMasterControlled = isMasterControlled;
        charConfig.posX = x;
        charConfig.posY = y;
        charConfig.height = config.height;
        charConfig.width = config.width;
        charConfig.image = config.image;
        charConfig.lineOfSight = config.lineOfSight;
        charConfig.level = config.level;
        charConfig.attributes.strength = Math.floor(Math.random() * config.attributes.strength) * (Math.floor(Math.random() * 2) === 1 ? 1 : -1);
        charConfig.attributes.dexterity = Math.floor(Math.random() * config.attributes.dexterity) * (Math.floor(Math.random() * 2) === 1 ? 1 : -1);
        charConfig.attributes.intelligence = Math.floor(Math.random() * config.attributes.intelligence) * (Math.floor(Math.random() * 2) === 1 ? 1 : -1);
        charConfig.movement.max = config.movement;
        charConfig.energy.max = config.energy;
        var manaDice = config.mana.split('d'),
            mana = parseInt(manaDice[0]) * (Math.floor(Math.random() * parseInt(manaDice[1])) + 1);
        charConfig.mana.max = mana;
        var lifeDice = config.life.split('d'),
            life = parseInt(lifeDice[0]) * (Math.floor(Math.random() * parseInt(lifeDice[1])) + 1);
        charConfig.life.max = life;
        charConfig.life.current = life;
        charConfig.traits = config.traits;
        charConfig.experience = config.experience;
        charConfig.souls = config.souls;
        charConfig.inventory.mainHand = config.inventory.mainHand();
        charConfig.inventory.mainHand.isEquipped = true;
        charConfig.inventory.offHand = config.inventory.offHand();
        charConfig.inventory.offHand.isEquipped = true;
        charConfig.inventory.head = config.inventory.head();
        charConfig.inventory.head.isEquipped = true;
        charConfig.inventory.body = config.inventory.body();
        charConfig.inventory.body.isEquipped = true;
        charConfig.inventory.hands = config.inventory.hands();
        charConfig.inventory.hands.isEquipped = true;
        charConfig.inventory.feet = config.inventory.feet();
        charConfig.inventory.feet.isEquipped = true;
        charConfig.inventory.slots.max = config.inventory.slots.max;
        charConfig.inventory.money = config.inventory.getMoney();
        if (config.inventory.slots.items.length > 0) {
            charConfig.inventory.slots.items = config.inventory.slots.items;
        } else {
            charConfig.inventory.slots.items = [];
            var item = config.getRandomInventoryItem();
            if (item.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                charConfig.inventory.slots.items.push(item);
            }
        }
        charConfig.inventory.spells = config.inventory.spells(config.inventory.spellsToGet);
        charConfig.armor = charConfig.inventory.head.armor +
            charConfig.inventory.body.armor +
            charConfig.inventory.hands.armor +
            charConfig.inventory.feet.armor +
            (charConfig.inventory.offHand.armor
                ? charConfig.inventory.offHand.armor
                : 0) + charConfig.attributes.dexterity;

        charConfig.resistances = config.resistances;
        charConfig.vulnerabilities = config.vulnerabilities;
        charConfig.invulnerabilities = config.invulnerabilities;
        return character;
    };

    this.addNewRandomVulnerabilitiesCharacter = (x, y, config) => {
        var character = this.addNewCharacter(x, y, config);
        character.characterConfig.resistances = config.getRandomResistances(1);
        character.characterConfig.vulnerabilities = config.getRandomResistances(1);
        character.characterConfig.invulnerabilities = config.getRandomResistances(1);
        return character;
    };

    this.moveActiveCharacterToPosition = (x, y) => {
        var currentCharacter = game.activeCharacter,
            charConfig = currentCharacter.characterConfig;
        if (!charConfig.movement.isMoving && (currentCharacter.x !== x || currentCharacter.y !== y)) {
            // Move if tile is unoccupied
            if (!this._isTileOccupied(x, y)) {
                charConfig.movement.spent++;
                StatusIconConfig.showMovementIcon(game, currentCharacter, 1);
                charConfig.movement.isMoving = true;
                var tile = game.activeMap.tiles.getChildren().find(function (tile) {
                    return tile.x === x && tile.y === y;
                });
                if (tile) {
                    var walkSound = game.sound.add(tile.objectConfig.sound, { volume: 0.5 });
                    walkSound.play();
                }
                game.cameras.main.startFollow(currentCharacter, true, 0.09, 0.09);
                var onCompleteHandler = function () {
                    game.tweens.killAll();
                    if (walkSound) {
                        walkSound.destroy();
                    }
                    setTimeout(function () {
                        game.cameras.main.stopFollow();
                        charConfig.movement.isMoving = false;
                        game.events.emit('showCharacterInitiative', game.initiative);
                    }, 5);
                };
                game.tweens.add({
                    targets: currentCharacter,
                    x: x,
                    y: y,
                    ease: 'Power1',
                    duration: 500,
                    onComplete: onCompleteHandler
                });
                return true;
            }
        }
        return false;
    };

    this.getPathsToEnemies = (seenCharacters) => {
        var currentCharacter = game.activeCharacter,
            paths = [],
            path,
            auxMap = game.activeMap.addEnemiesToMap(game.characters);
        if (seenCharacters && seenCharacters.length > 0) {
            path = this._getPathToEnemy(auxMap, currentCharacter, seenCharacters[0].character);
            if (path.length > 0) {
                paths.push({ path: path, enemy: seenCharacters[0].character });
            }
        } else {
            var randX, randY, tile, isFound = false;
            while (!isFound) {
                randY = Math.floor(Math.random() * game.activeMap.levelMap.length) * 50;
                randX = Math.floor(Math.random() * game.activeMap.levelMap[0].length) * 50;
                tile = game.activeMap.tiles.getChildren().find(function (tile) {
                    return tile.x === randX && tile.y === randY;
                });
                if (tile && !this._isTileOccupied(tile.x, tile.y)) {
                    isFound = true;
                    path = this._getPathToTile(auxMap, currentCharacter, tile);
                    if (path.length > 0) {
                        paths.push({ path: path, enemy: tile });
                    }
                }
            }
        }
        paths.sort(function (a, b) {
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
        var currentCharacter = game.activeCharacter;
        var paths = [];
        var auxMap = game.activeMap.addEnemiesToMap(game.characters);
        _.each(game.activeMap.objects.getChildren(), function (object) {
            if (Math.floor(object.objectConfig.id) === Math.floor(EnumHelper.idEnum.door.id)) {
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
        paths.sort(function (a, b) {
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
        return actionManager.interactWithEnemy(enemy);
    };

    this.interactWithObject = (object) => {
        if (object) {
            var realCoords = game.activeMap.getObjRealCoords(object);
            object.x = realCoords.x;
            object.y = realCoords.y;
            actionManager.interactWithObject(object);
        }
    };

    this.check = () => {
        this._doActions(game.activeCharacter);
    };

    // Private -----------------------------------------------------------------------------------------------------
    this._isTileOccupied = (posX, posY) => {
        var isObstacleInTheWay = game.characters.characters.getChildren().filter(function (character) {
            return character.x === posX && character.y === posY;
        });
        if (isObstacleInTheWay.length > 0) {
            return true;
        }
        isObstacleInTheWay = game.enemies.characters.getChildren().filter(function (enemy) {
            return enemy.x === posX && enemy.y === posY;
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

    this._checkLineOfSight = function (currentCharacter) {
        var seenCharacters = [];
        _.each(game.characters.characters.getChildren(), function (character) {
            var lineOfSight = actionManager.checkLineOfSight(currentCharacter, character);
            if (lineOfSight.hasBeenSeen) {
                seenCharacters.push({ character: character, distance: lineOfSight.distance });
            }
        });
        seenCharacters.sort(function (a, b) {
            if (a.distance > b.distance) {
                return -1;
            } else if (a.distance < b.distance) {
                return 1;
            } else {
                return 0;
            }
        });
        return seenCharacters;
    };

    this._getPathToEnemy = function (map, character, enemy) {
        map[enemy.y / 50][enemy.x / 50] = 0;
        var path = Pathfinder.findWay(character.x / 50,
            character.y / 50,
            enemy.x / 50,
            enemy.y / 50,
            map);
        if (path.length > 0) {
            path.shift();
            if (path.length > 0) {
                return path;
            }
        }
        return [];
    };

    this._getPathToTile = function(map, character, tile) {
        _.each(game.activeMap.objects.getChildren(), function(object) {
            if (Math.floor(object.objectConfig.id) === 2) {
                map[object.y / 50][object.x / 50] = 0;
            }
        });
        var path = Pathfinder.findWay(character.x / 50,
            character.y / 50,
            tile.x / 50,
            tile.y / 50,
            map);
        if (path.length > 0) {
            path.shift();
            if (path.length > 0) {
                return path;
            }
        }
        return [];
    };

    this._getPathToObject = function (object) {
        var currentCharacter = game.activeCharacter,
            auxMap = game.activeMap.addEnemiesToMap(game.characters),
            path,
            objX = object.x,
            objY = object.y;
        if (object.height > 50) {
            if (currentCharacter.y > object.y) {
                objY += (object.height - 50);
            }
        }
        if (object.width > 50) {
            if (currentCharacter.x > object.x) {
                objX += (object.width - 50);
            }
        }
        auxMap[objY / 50][objX / 50] = 0;
        // TODO: try to use Pathfinder.getPathFromAToB since in TestLevelScene the mana well cannot be reached when enemy.x > well.x
        path = Pathfinder.getPathFromAToB(
            {
                x: currentCharacter.x,
                y: currentCharacter.y
            },
            {
                x: objX,
                y: objY,
                height: object.height,
                width: object.width
            },
            auxMap);
        if (path.length > 0) {
            path.shift();
            if (path.length > 0) {
                return path;
            }
        }
        return [];
    };

    // TODO: Split this into multiple methods
    // TODO: If you get out of the enemy's line of sight they should "hunt" you for 1 or more number of turns and then resume a random path or predetermined one
    this._doActions = (currentCharacter) => {
        var charConfig = currentCharacter.characterConfig;

        //If enemy is not moving
        if (!charConfig.movement.isMoving) {
            // who can enemy see
            var seenCharacters = this._checkLineOfSight(currentCharacter),
                // get enemy spells
                spells = charConfig.inventory.spells.filter(function (spell) {
                    return spell.isSpell;
                }),
                selectedAction = null,
                hasAttacked = false,
                hasInteracted = false,
                hasMoved = false;

            // ATTACK ----------------------------------------------------------------------------------------------------------------------------------------
            // TODO: Have a variable that keeps track of what the enemy wanted to do and do that here instead of these ifs?
            var attack = this._tryAttack(currentCharacter, seenCharacters, spells);
            hasAttacked = attack.hasAttacked;
            if (hasAttacked) {
                selectedAction = attack.selectedAction;
            }

            // INTERACTION ----------------------------------------------------------------------------------------------------------------------------------------
            hasInteracted = this._tryInterract(currentCharacter);

            //TODO: Remember previous action so that you can calculate the range? Right now it attacks from a distance and when it can't attack because of energy
            // it will move towards player
            if (!selectedAction) {
                selectedAction = {
                    range: -1
                };
            }

            // MOVEMENT ----------------------------------------------------------------------------------------------------------------------------------------
            hasMoved = this._tryMove(currentCharacter, seenCharacters, selectedAction, spells);

            if (!hasAttacked && !hasInteracted && !hasMoved) {
                game.events.emit('endEnemyTurn');
            }
        }
    };

    // ------------------------------------------------------------------------ ATTACK ------------------------------------------------------------------------
    this._tryAttack = function (currentCharacter, seenCharacters, spells) {
        var charConfig = currentCharacter.characterConfig,
            pathToWell,
            attack;
        // If enemy has energy & saw character
        if (charConfig.energy.max - charConfig.energy.spent > 1 && seenCharacters.length > 0) {
            // get path to closest
            var closestEnemy = game.enemies.getPathsToEnemies(seenCharacters);
            closestEnemy[0].path.pop();
            charConfig.path = closestEnemy[0].path;
            // if enemy has spells
            if (charConfig.traits.indexOf(EnumHelper.traitEnum.magic) !== -1) {
                if (spells.length > 0) {
                    // get random spell
                    var useSpell = spells[Math.floor(Math.random() * spells.length)];
                    // if enemy has enough mana
                    if (charConfig.mana.max - charConfig.mana.spent >= useSpell.cost) {
                        // if enemy is close enough to attack, attack
                        if (closestEnemy.length > 0 && closestEnemy[0].path.length <= useSpell.range) {
                            charConfig.energy.actionId = EnumHelper.actionEnum.attackSpell;
                            charConfig.energy.selectedAction = useSpell;
                            var hasAttacked = this.interactWithEnemy(closestEnemy[0].enemy);
                            return {
                                hasAttacked: hasAttacked,
                                selectedAction: charConfig.energy.selectedAction
                            };
                        }
                        // else move to enemy?
                    }
                    // check if we have a mana well
                    else {
                        pathToWell = this._getPathToWell(EnumHelper.idEnum.well.type.mana);
                        charConfig.path = pathToWell;
                        // if well is further than enemy
                        if (pathToWell.length > closestEnemy[0].path.length) {
                            // get path to enemy and attack
                            charConfig.path = closestEnemy[0].path;
                            attack = this._attackWithMainHand(currentCharacter, closestEnemy[0].enemy);
                            return {
                                hasAttacked: attack.hasAttacked,
                                selectedAction: attack.selectedAction
                            };
                        }
                        // if no mana well, try to attack with weapon
                        else {
                            attack = this._attackWithMainHand(currentCharacter, closestEnemy[0].enemy);
                            return {
                                hasAttacked: attack.hasAttacked,
                                selectedAction: attack.selectedAction
                            };
                        }
                    }
                }
            }
            // if no spells, try to attack with weapon
            else if (closestEnemy.length > 0 && closestEnemy[0].path.length <= charConfig.inventory.mainHand.range) {
                attack = this._attackWithMainHand(currentCharacter, closestEnemy[0].enemy);
                return {
                    hasAttacked: attack.hasAttacked,
                    selectedAction: attack.selectedAction
                };
            }
        }
        return {
            hasAttacked: false,
            selectedAction: null
        };
    };

    this._attackWithMainHand = function (currentCharacter, closestEnemy) {
        var charConfig = currentCharacter.characterConfig;
        this._dropOffhandWeapon(currentCharacter);
        charConfig.energy.actionId = EnumHelper.actionEnum.attackMainHand;
        charConfig.energy.selectedAction = charConfig.inventory.mainHand;
        var hasAttacked = this.interactWithEnemy(closestEnemy);
        return {
            hasAttacked: hasAttacked,
            selectedAction: charConfig.energy.selectedAction
        };
    };

    this._dropOffhandWeapon = function (currentCharacter) {
        var charConfig = currentCharacter.characterConfig;
        if (charConfig.inventory.mainHand.hold === 2 && charConfig.inventory.offHand.armor) {
            // TODO: Drop offhand if it is an armor (or put in inventory if you can?) and then attack
            var item = charConfig.inventory.offHand,
                itemImage = game.physics.add.sprite(currentCharacter.x, currentCharacter.y, item.image).setOrigin(0, 0);
            itemImage.displayWidth = 50;
            itemImage.displayHeight = 50;
            itemImage.width = 50;
            itemImage.height = 50;
            game.input.setHitArea([itemImage]);
            itemImage.on('pointerdown', _.bind(game.sceneManager._pickUpItem, this, itemImage));
            itemImage.on('pointerover', _.bind(game.sceneManager._hoverItem, this, itemImage));
            itemImage.itemConfig = lodash.cloneDeep(item);
            game.items.add(itemImage);
            charConfig.inventory.offHand = lodash.cloneDeep(InventoryConfig.weapons.defaultEquipment);
            currentCharacter.setDepth(1);
        }
    };

    // ------------------------------------------------------------------------ INTERACT ------------------------------------------------------------------------
    this._tryInterract = function (currentCharacter) {
        var charConfig = currentCharacter.characterConfig,
            hasInteracted = this._tryOpenDoor(currentCharacter);
        // if enemy has energy left and has trait magic, try to drink from mana well if near one
        if (charConfig.traits.indexOf(EnumHelper.traitEnum.magic) !== -1) {
            hasInteracted = this._tryInteractWithWell(currentCharacter);
        }
        return hasInteracted;
    };

    this._tryOpenDoor = function (currentCharacter) {
        var charConfig = currentCharacter.characterConfig;
        // if enemy has energy left, try to open a door if near one
        if (charConfig.energy.max - charConfig.energy.spent > 0) {
            var closestDoor = game.enemies.getPathsToClosestDoor();
            if (closestDoor.length > 0) {
                if (closestDoor[0].path.length === 1) {
                    this.interactWithObject(closestDoor[0].object);
                    return true;
                }
            }
        }
        return false;
    };

    this._tryInteractWithWell = function (currentCharacter) {
        var charConfig = currentCharacter.characterConfig,
            wellObject,
            pathToWell,
            well;
        if (charConfig.energy.max - charConfig.energy.spent !== charConfig.energy.max) {
            wellObject = this._getPathToWell(EnumHelper.idEnum.well.type.mana, true);
            well = wellObject.well;
            pathToWell = wellObject.path;
            if (pathToWell.length > 0 && pathToWell.length <= 1) {
                this.interactWithObject(well);
                if (pathToWell.length === charConfig.path.length) {
                    var isSamePath = true;
                    for (let i = 0; i < pathToWell.length; i++) {
                        if (pathToWell[i][0] !== charConfig.path[i][0] ||
                            pathToWell[i][1] !== charConfig.path[i][1]) {
                            isSamePath = false;
                        }
                    }
                    if (isSamePath) {
                        charConfig.path = [];
                    }
                }
                if (well.objectConfig.description !== 'Empty well') {
                    return true;
                }
            }
        }
        return false;
    };

    // ------------------------------------------------------------------------ MOVEMENT ------------------------------------------------------------------------
    this._tryMove = function (currentCharacter, seenCharacters, selectedAction, spells) {
        var charConfig = currentCharacter.characterConfig,
            hasMoved = false;
        // If enemy has movement left. Maybe move until doing an action or moving when trying to go to cover?
        if (charConfig.movement.max - charConfig.movement.spent > 0) {
            // only move if the range of the attack is lower than the path to the enemy
            // TODO: check why charConfig.path varies with +/- 1
            if (charConfig.path.length >= selectedAction.range) {
                // If no path and no seen characters
                if (charConfig.path.length === 0 && seenCharacters.length <= 0) {
                    // if has spells and not max mana
                    if (spells.length > 0 && charConfig.mana.max - charConfig.mana.spent !== charConfig.mana.max) {
                        // if MAGIC trait, try to get mana from well
                        if (charConfig.traits.indexOf(EnumHelper.traitEnum.magic) !== -1) {
                            hasMoved = this._tryMoveToWell(currentCharacter);
                        }
                    }
                    // if no well found or not interested in getting mana, get random path or get path to a character that has been seen
                    if (!hasMoved) {
                        hasMoved = this._tryMoveToSeenEnemyOrRandom(currentCharacter, seenCharacters, selectedAction);
                    }
                }
                // if enemy has path but has not seen any character, move along the path
                else if (charConfig.path.length > 0 && seenCharacters.length <= 0) {
                    hasMoved = this._tryMoveOnAvailablePath(currentCharacter);
                }
                else {
                    hasMoved = this._tryMoveToSeenEnemyOrRandom(currentCharacter, seenCharacters, selectedAction);
                    if (!hasMoved) {
                        hasMoved = this._tryMoveToDoor(currentCharacter);
                    }
                }
            } else {
                // If no more movement, remove path if enemy has seen character, in case characters move
                if (seenCharacters.length > 0) {
                    charConfig.path = [];
                }
            }
        }
        return hasMoved;
    };

    this._tryMoveToWell = function (currentCharacter) {
        var charConfig = currentCharacter.characterConfig,
            pathToWell = this._getPathToWell(EnumHelper.idEnum.well.type.mana);
        if (pathToWell.length > 0) {
            charConfig.path = pathToWell;
            if (currentCharacter.x === charConfig.path[0][0] * 50 && currentCharacter.y === charConfig.path[0][1] * 50) {
                charConfig.path.shift();
            }
            if (charConfig.path.length > 0) {
                charConfig.posX = charConfig.path[0][0] * 50;
                charConfig.posY = charConfig.path[0][1] * 50;
                charConfig.path.shift();
                return game.enemies.moveActiveCharacterToPosition(charConfig.posX, charConfig.posY);
            }
        }
        return false;
    };

    this._tryMoveToSeenEnemyOrRandom = function (currentCharacter, seenCharacters, selectedAction) {
        // get random path or path to a seen character
        var charConfig = currentCharacter.characterConfig,
            paths = game.enemies.getPathsToEnemies(seenCharacters);
        // if no character it will move randomly, if character has been seen it won't move if range is bigger than path
        if (paths.length > 0 && paths[0].path.length > 0 &&
            ((seenCharacters.length > 0 && paths[0].path.length > selectedAction.range) || seenCharacters.length === 0)) {
            // Get the path to the closest seen character
            charConfig.path = paths[0].path;
            if (currentCharacter.x === charConfig.path[0][0] * 50 && currentCharacter.y === charConfig.path[0][1] * 50) {
                charConfig.path.shift();
            }
            if (charConfig.path.length > 0) {
                charConfig.posX = charConfig.path[0][0] * 50;
                charConfig.posY = charConfig.path[0][1] * 50;
                charConfig.path.shift();
                // And move
                // TODO: If tile is occupied by enemy, stay in place if range is good enough
                return game.enemies.moveActiveCharacterToPosition(charConfig.posX, charConfig.posY);
            }
        }
        return false;
    };

    this._tryMoveOnAvailablePath = function (currentCharacter) {
        // Move on the path
        var charConfig = currentCharacter.characterConfig;
        if (currentCharacter.x === charConfig.path[0][0] * 50 && currentCharacter.y === charConfig.path[0][1] * 50) {
            charConfig.path.shift();
        }
        if (charConfig.path.length > 0) {
            charConfig.posX = charConfig.path[0][0] * 50;
            charConfig.posY = charConfig.path[0][1] * 50;
            charConfig.path.shift();
            return game.enemies.moveActiveCharacterToPosition(charConfig.posX, charConfig.posY);
        }
        return false;
    };

    this._tryMoveToDoor = function (currentCharacter) {
        // If no path is found to a character it might mean we are stuck in a room
        var charConfig = currentCharacter.characterConfig,
            paths = game.enemies.getPathsToClosestDoor();
        if (paths.length > 0 && paths[0].path.length > 0) {
            charConfig.path = paths[0].path;
            if (currentCharacter.x === charConfig.path[0][0] * 50 && currentCharacter.y === charConfig.path[0][1] * 50) {
                charConfig.path.shift();
            }
            if (charConfig.path.length > 0) {
                charConfig.posX = charConfig.path[0][0] * 50;
                charConfig.posY = charConfig.path[0][1] * 50;
                charConfig.path.shift();
                return game.enemies.moveActiveCharacterToPosition(charConfig.posX, charConfig.posY);
            }
        }
        return false;
    };

    this._getPathToWell = function (wellType, shouldGetWell) {
        var well = game.activeMap.objects.getChildren().find(function (object) {
            return object.objectConfig.id === wellType;
        });
        // if we have a mana well
        if (well) {
            // get path to well
            return shouldGetWell
                ? {
                    path: this._getPathToObject(well),
                    well: well
                }
                : this._getPathToObject(well);
        }
        return shouldGetWell
            ? {
                path: [],
                well: well
            }
            : [];
    };
};