import { Pathfinder } from 'Aniwars/Helpers/pathfinder';
import { EnumHelper } from 'Aniwars/Helpers/enumHelper';
import { ActionManager } from 'Aniwars/Managers/actionManager';
import { InventoryConfig } from 'Aniwars/Configurations/inventoryConfig';
import { StatusIconConfig } from 'Aniwars/Configurations/statusIconConfig';

export const Enemy = function (game) {
    var actionManager = new ActionManager(game);

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
        naturalArmor: 2,
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
            mainHand: lodash.cloneDeep(InventoryConfig.defaultMainHand),
            offHand: lodash.cloneDeep(InventoryConfig.defaultMainHand),
            head: lodash.cloneDeep(InventoryConfig.defaultHead),
            body: lodash.cloneDeep(InventoryConfig.defaultBody),
            feet: lodash.cloneDeep(InventoryConfig.defaultFeet),
            hands: lodash.cloneDeep(InventoryConfig.defaultHands),
            slots: {
                max: 2,
                items: [lodash.cloneDeep(InventoryConfig.bow), lodash.cloneDeep(InventoryConfig.shortsword)]
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
        traits: [EnumHelper.traitEnum.standard],
        statuses: [],
        resistances: [EnumHelper.damageTypeEnum.fire],
        vulnerabilities: [EnumHelper.damageTypeEnum.slashing],
        invulnerabilities: [EnumHelper.damageTypeEnum.bludgeoning],
        experience: 800,
        souls: 5,
        level: 1
    };
    this.game = game;
    this.map = this.game.activeMap;
    this.characters = this.game.add.group();

    this.addNewCharacter = (x, y, config) => {
        var character = this.game.physics.add.sprite(x, y, config.image).setOrigin(0, 0);
        character.characterConfig = lodash.cloneDeep(this.characterConfig);
        var charConfig = character.characterConfig;
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
        charConfig.naturalArmor = config.naturalArmor;
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
        if (config.inventory.spells.length > 0) {
            charConfig.inventory.spells = config.inventory.spells;
        }
        charConfig.armor = charConfig.inventory.head.armor +
            charConfig.inventory.body.armor +
            charConfig.inventory.hands.armor +
            charConfig.inventory.feet.armor +
            (charConfig.inventory.offHand.armor
                ? charConfig.inventory.offHand.armor
                : 0) + charConfig.naturalArmor;

        charConfig.resistances = config.resistances;
        charConfig.vulnerabilities = config.vulnerabilities;
        charConfig.invulnerabilities = config.invulnerabilities;
        this.characters.add(character);
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
        var currentCharacter = this.game.activeCharacter,
            charConfig = currentCharacter.characterConfig,
            self = this;
        if (!charConfig.movement.isMoving && (currentCharacter.x !== x || currentCharacter.y !== y)) {
            // Move if tile is unoccupied
            if (!this._isTileOccupied(x, y)) {
                charConfig.movement.spent++;
                StatusIconConfig.showMovementIcon(this.game, currentCharacter, 1);
                charConfig.movement.isMoving = true;
                var tile = this.game.activeMap.tiles.getChildren().find(function (tile) {
                    return tile.x === x && tile.y === y;
                });
                if (tile) {
                    var walkSound = game.sound.add(tile.objectConfig.sound, { volume: 0.5 });
                    walkSound.play();
                }
                this.game.cameras.main.startFollow(currentCharacter, true, 0.09, 0.09);
                var onCompleteHandler = function () {
                    game.tweens.killAll();
                    walkSound.destroy();
                    setTimeout(function () {
                        self.game.cameras.main.stopFollow();
                        charConfig.movement.isMoving = false;
                        self.game.events.emit('showCharacterInitiative', game.initiative);
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
        var self = this,
            currentCharacter = this.game.activeCharacter,
            paths = [],
            auxMap = this.game.activeMap.addEnemiesToMap(this.game.characters);
        if (seenCharacters && seenCharacters.length > 0) {
            var path = self._getPathToEnemy(auxMap, currentCharacter, seenCharacters[0].character);
            if (path) {
                paths.push({ path: path, enemy: seenCharacters[0].character });
            }
        } else {
            //This gets the closest enemy
            //_.each(this.game.characters.characters.getChildren(), function (character) {
            //    var path = self._getPathToEnemy(auxMap, currentCharacter, character);
            //    if (path) {
            //        paths.push({ path: path, enemy: character });
            //    }
            //});
            var randX, randY, tile, isFound = false;
            while (!isFound) {
                randY = Math.floor(Math.random() * this.game.activeMap.levelMap.length) * 50;
                randX = Math.floor(Math.random() * this.game.activeMap.levelMap[0].length) * 50;
                tile = this.game.activeMap.tiles.getChildren().find(function (tile) {
                    return tile.x === randX && tile.y === randY;
                });
                if (tile) {
                    isFound = true;
                }
            }

            var path = self._getPathToEnemy(auxMap, currentCharacter, tile);
            if (path) {
                paths.push({ path: path, enemy: tile });
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
        var currentCharacter = this.game.activeCharacter;
        var paths = [];
        var auxMap = this.game.activeMap.addEnemiesToMap(this.game.characters);
        _.each(this.game.activeMap.objects.getChildren(), function (object) {
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
        actionManager.interactWithEnemy(enemy);
    };

    this.interactWithObject = (object) => {
        var realCoords = this.game.activeMap.getObjRealCoords(object);
        object.x = realCoords.x;
        object.y = realCoords.y;
        actionManager.interactWithObject(object);
    };

    this.check = () => {
        if (this.game.activeCharacter.characterConfig.traits.indexOf(EnumHelper.traitEnum.standard) !== -1) {
            this._doStandardActions(this.game.activeCharacter);
        }
    };

    // Private -----------------------------------------------------------------------------------------------------
    this._isTileOccupied = (posX, posY) => {
        var isObstacleInTheWay = this.game.characters.characters.getChildren().filter(function (character) {
            return character.x === posX && character.y === posY;
        });
        if (isObstacleInTheWay.length > 0) {
            return true;
        }
        isObstacleInTheWay = this.game.enemies.characters.getChildren().filter(function (enemy) {
            return enemy.x === posX && enemy.y === posY;
        });
        if (isObstacleInTheWay.length > 0) {
            return true;
        }
        isObstacleInTheWay = this.game.activeMap.objects.getChildren().filter(function (object) {
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
        _.each(this.game.characters.characters.getChildren(), function (character) {
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
        return null;
    };

    // TODO: Split this into multiple methods
    // TODO: If you get out of the enemy's line of sight they should "hunt" you for 1 or more number of turns and then resume a random path or predetermined one
    this._doStandardActions = (currentCharacter) => {
        var charConfig = currentCharacter.characterConfig,
            enemies = this.game.enemies;

        if (!charConfig.movement.isMoving) {
            var hasAttacked = false,
                hasInteracted = false,
                hasMoved = false,
                seenCharacters = this._checkLineOfSight(currentCharacter);
            // If enemy cannot move, try attacking
            if (charConfig.energy.max - charConfig.energy.spent > 1 && seenCharacters.length > 0) {
                var closestEnemy = enemies.getPathsToEnemies(seenCharacters);
                closestEnemy[0].path.pop();
                if (closestEnemy.length > 0 && closestEnemy[0].path.length <= charConfig.inventory.mainHand.range) {
                    if (charConfig.inventory.mainHand.hold === 2 && charConfig.inventory.offHand.armor) {
                        // TODO: Drop offhand if it is an armor (or put in inventory if you can?) and then attack
                        var item = charConfig.inventory.offHand,
                            itemImage = this.game.physics.add.sprite(currentCharacter.x, currentCharacter.y, item.image).setOrigin(0, 0);
                        itemImage.displayWidth = 50;
                        itemImage.displayHeight = 50;
                        itemImage.width = 50;
                        itemImage.height = 50;
                        this.game.input.setHitArea([itemImage]);
                        itemImage.on('pointerdown', _.bind(this.game.sceneManager._pickUpItem, self, itemImage));
                        itemImage.on('pointerover', _.bind(this.game.sceneManager._hoverItem, self, itemImage));
                        itemImage.itemConfig = lodash.cloneDeep(item);
                        this.game.items.add(itemImage);
                        charConfig.inventory.offHand = lodash.cloneDeep(InventoryConfig.defaultMainHand);
                        currentCharacter.setDepth(1);
                    }
                    charConfig.energy.actionId = EnumHelper.actionEnum.attackMainHand;
                    this.interactWithEnemy(closestEnemy[0].enemy);
                    hasAttacked = true;
                }
            }
            // or opening a door
            if (charConfig.energy.max - charConfig.energy.spent > 0) {
                var closestDoor = enemies.getPathsToClosestDoor();
                if (closestDoor.length > 0) {
                    if (closestDoor[0].path.length === 1) {
                        this.interactWithObject(closestDoor[0].object);
                        hasInteracted = true;
                    }
                }
            }

            // If enemy has movement left. Maybe move until doing an action or moving when trying to go to cover?
            if (charConfig.movement.max - charConfig.movement.spent > 0) {
                // If it does not have a path
                if (charConfig.path.length > 0 && seenCharacters.length <= 0) {
                    // Move on the path
                    var path = lodash.cloneDeep(charConfig.path);
                    charConfig.posX = charConfig.path[0][0] * 50;
                    charConfig.posY = charConfig.path[0][1] * 50;
                    charConfig.path.shift();
                    hasMoved = enemies.moveActiveCharacterToPosition(path[0][0] * 50, path[0][1] * 50);
                } else {
                    var paths = enemies.getPathsToEnemies(seenCharacters);
                    if (paths.length > 0 && paths[0].path.length > 0) {
                        // Get the path to the closest seen character
                        if (paths[0].path.length > charConfig.inventory.mainHand.range) {
                            charConfig.path = paths[0].path;
                            charConfig.posX = charConfig.path[0][0] * 50;
                            charConfig.posY = charConfig.path[0][1] * 50;
                            charConfig.path.shift();
                            // And move
                            hasMoved = enemies.moveActiveCharacterToPosition(charConfig.posX, charConfig.posY);
                        }
                    } else {
                        // If no path is found to a character it might mean we are stuck in a room
                        paths = enemies.getPathsToClosestDoor();
                        if (paths.length > 0 && paths[0].path.length > 0) {
                            charConfig.path = paths[0].path;
                            charConfig.posX = charConfig.path[0][0] * 50;
                            charConfig.posY = charConfig.path[0][1] * 50;
                            charConfig.path.shift();
                            hasMoved = enemies.moveActiveCharacterToPosition(charConfig.posX, charConfig.posY);
                        }
                    }
                }
            } else {
                // If no more movement, remove path in case player characters move
                if (seenCharacters.length > 0) {
                    charConfig.path = [];
                }
            }
        }

        if (!hasAttacked && !hasInteracted && !hasMoved) {
            this.game.events.emit('endEnemyTurn');
        }
    };
};