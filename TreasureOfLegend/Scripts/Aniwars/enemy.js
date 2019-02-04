import {Pathfinder} from 'Aniwars/Helpers/pathfinder';
import {EnumHelper} from 'Aniwars/Helpers/enumHelper';
import {ActionManager} from 'Aniwars/Managers/actionManager';
import {InventoryConfig} from 'Aniwars/Configurations/inventoryConfig';

export const Enemy = function(game) {
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
        charConfig.inventory.offHand = config.inventory.offHand();
        charConfig.inventory.head = config.inventory.head();
        charConfig.inventory.body = config.inventory.body();
        charConfig.inventory.hands = config.inventory.hands();
        charConfig.inventory.feet = config.inventory.feet();
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
            charConfig = currentCharacter.characterConfig;
        if (!charConfig.movement.isMoving && (currentCharacter.x !== x || currentCharacter.y !== y)) {
            // Move if tile is unoccupied
            if (!this._isTileOccupied(x, y)) {
                charConfig.movement.spent++;
                charConfig.movement.isMoving = true;
                if (x > currentCharacter.x && y > currentCharacter.y) {
                    currentCharacter.setVelocity(charConfig.velocity,
                        charConfig.velocity);
                } else if (x < currentCharacter.x && y < currentCharacter.y) {
                    currentCharacter.setVelocity(-1 * charConfig.velocity,
                        -1 * charConfig.velocity);
                } else if (x < currentCharacter.x && y > currentCharacter.y) {
                    currentCharacter.setVelocity(-1 * charConfig.velocity,
                        charConfig.velocity);
                } else if (x > currentCharacter.x && y < currentCharacter.y) {
                    currentCharacter.setVelocity(charConfig.velocity,
                        -1 * charConfig.velocity);
                } else if (x > currentCharacter.x) {
                    currentCharacter.setVelocityX(charConfig.velocity);
                } else if (x < currentCharacter.x) {
                    currentCharacter.setVelocityX(-1 * charConfig.velocity);
                } else if (y > currentCharacter.y) {
                    currentCharacter.setVelocityY(charConfig.velocity);
                } else if (y < currentCharacter.y) {
                    currentCharacter.setVelocityY(-1 * charConfig.velocity);
                }
            }
        }
    };

    this.stopActiveCharacter = () => {
        var currentCharacter = this.game.activeCharacter,
            charConfig = currentCharacter.characterConfig;
        //reduce speed on X
        this._reduceSpeedX(currentCharacter);

        //reduce speed on Y
        this._reduceSpeedY(currentCharacter);

        if (currentCharacter.x === charConfig.posX &&
            currentCharacter.y === charConfig.posY ) {
            charConfig.movement.isMoving = false;
            charConfig.path.shift();
        }
    };

    this.getPathsToEnemies = () => {
        var currentCharacter = this.game.activeCharacter;
        var paths = [];
        var auxMap = this.game.activeMap.addEnemiesToMap(this.game.characters);
        _.each(this.game.characters.characters.getChildren(), function(character) {
            auxMap[character.y / 50][character.x / 50] = 0;
            var path = Pathfinder.findWay(currentCharacter.x / 50,
                currentCharacter.y / 50,
                character.x / 50,
                character.y / 50,
                auxMap);
            if (path.length > 0) {
                path.shift();
                if (path.length > 0) {
                    paths.push({ path: path, enemy: character });
                }
            }
        });
        paths.sort(function(a, b) {
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
        _.each(this.game.activeMap.objects.getChildren(), function(object) {
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
        paths.sort(function(a, b) {
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

    this._isTileOccupied = (posX, posY) => {
        var isObstacleInTheWay = this.game.characters.characters.getChildren().filter(function(character) {
            return character.x === posX && character.y === posY;
        });
        if (isObstacleInTheWay.length > 0) {
            return true;
        }
        isObstacleInTheWay = this.game.enemies.characters.getChildren().filter(function(enemy) {
            return enemy.x === posX && enemy.y === posY;
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

    this._doStandardActions = (currentCharacter) => {
        var charConfig = currentCharacter.characterConfig,
            enemies = this.game.enemies;
        // If enemy has movement left
        if (charConfig.movement.max - charConfig.movement.spent > 0) {
            if (charConfig.movement.isMoving) {
                enemies.stopActiveCharacter();
            }
            // If it does not have a path
            if (charConfig.path.length === 0) {
                var paths = enemies.getPathsToEnemies();
                if (paths.length > 0 && paths[0].path.length > 0) {
                    // Get the path to the closest character
                    charConfig.path = paths[0].path;
                    charConfig.posX = charConfig.path[0][0] * 50;
                    charConfig.posY = charConfig.path[0][1] * 50;
                    // And move
                    enemies.moveActiveCharacterToPosition(charConfig.posX, charConfig.posY);
                } else {
                    // If no path is found to a character it might mean we are stuck in a room
                    paths = enemies.getPathsToClosestDoor();
                    if (paths.length > 0 && paths[0].path.length > 0) {
                        charConfig.path = paths[0].path;
                        charConfig.posX = charConfig.path[0][0] * 50;
                        charConfig.posY = charConfig.path[0][1] * 50;
                        enemies.moveActiveCharacterToPosition(charConfig.posX, charConfig.posY);
                    }
                }
            } else {
                // Move on the path
                var path = charConfig.path;
                charConfig.posX = charConfig.path[0][0] * 50;
                charConfig.posY = charConfig.path[0][1] * 50;
                enemies.moveActiveCharacterToPosition(path[0][0] * 50, path[0][1] * 50);
            }
        } else {
            // If no more movement, remove path in case player characters move
            charConfig.path = [];
            if (charConfig.movement.isMoving) {
                enemies.stopActiveCharacter();
            }
        }

        if (!charConfig.movement.isMoving) {
            var hasAttacked = false,
                hasInteracted = false;
            // If enemy cannot move, try attacking
            if (charConfig.energy.max - charConfig.energy.spent > 1) {
                var closestEnemy = enemies.getPathsToEnemies();
                if (closestEnemy.length > 0) {
                    if (closestEnemy[0].path.length === charConfig.inventory.mainHand.range) {
                        enemies.interactWithEnemy(closestEnemy[0].enemy);
                        hasAttacked = true;
                    }
                }
            }
            // or opening a door
            if (charConfig.energy.max - charConfig.energy.spent > 0) {
                var closestDoor = enemies.getPathsToClosestDoor();
                if (closestDoor.length > 0) {
                    if (closestDoor[0].path.length === 1) {
                        enemies.interactWithObject(closestDoor[0].object);
                        hasInteracted = true;
                    }
                }
            }

            // If no action has been done it might mean we are out of movement and not near an enemy or object
            if (!hasAttacked && !hasInteracted) {
                charConfig.energy.spent++;
                charConfig.movement.spent++;
            }
        }

        if (charConfig.movement.max - charConfig.movement.spent <= 0 &&
            !charConfig.movement.isMoving && charConfig.path.length <= 0 &&
            charConfig.energy.max - charConfig.energy.spent <= 0) {
            this.game.events.emit('endEnemyTurn');
        }
    };
};