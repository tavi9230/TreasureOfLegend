﻿import { BattleMap } from 'Aniwars/map';
import { Character } from 'Aniwars/character';
import { Enemy } from 'Aniwars/enemy';
import { InventoryConfig } from 'Aniwars/Configurations/inventoryConfig';
import { EnemyConfig } from 'Aniwars/Configurations/enemyConfig';
import { EnumHelper } from 'Aniwars/Helpers/enumHelper';

export const SceneManager = function (game) {
    var game = game;
    game.items = game.add.group();

    this.endTurn = () => {
        var charConfig = game.activeCharacter.characterConfig;
        var shouldChangeTurn = false;
        if (!charConfig.movement.isMoving) {
            // TODO: Refresh movement, energy, etc only on turn counter change
            var initialInitiativeIndex = game.initiativeIndex;
            game.initiativeIndex++;
            if (game.initiativeIndex >= game.initiative.length || initialInitiativeIndex === -1) {
                var shouldRestart = true;
                _.each(game.initiative,
                    function (character) {
                        if (!character.characterConfig.isPlayerControlled) {
                            shouldRestart = false;
                        }
                    });
                if (shouldRestart) {
                    game.initiative = null;
                    game.initiative = this.getInitiativeArray();
                }
                game.initiativeIndex = 0;
                shouldChangeTurn = true;
            }
            var first = game.initiative.shift();
            game.initiative.push(first);
            _.each(game.initiative,
                function (char) {
                    char.clearTint();
                });
            game.events.emit('showCharacterInitiative', game.initiative);
            game.activeCharacter.characterConfig.energy.selectedAction = null;
            game.activeCharacter.characterConfig.energy.actionId = -1;
            game.events.emit('deselectButtons');
            game.events.emit('closeCharacterInfoTab');
            game.activeCharacter = game.initiative[0];
            game.cameras.main.startFollow(game.activeCharacter, true, 0.09, 0.09);
            game.cameras.main.stopFollow();

            if (game.activeCharacter.characterConfig.isPlayerControlled) {
                game.events.emit('toggleActionButtons', true);
                game.activeMap.showMovementGrid();
            } else {
                game.events.emit('toggleActionButtons', false);
                game.activeMap.hideMovementGrid();
            }
            if (shouldChangeTurn) {
                game.events.emit('changeTurnCounter');
                _.each(game.initiative,
                    function (character) {
                        character.characterConfig.movement.spent = 0;
                        character.characterConfig.energy.spent = 0;
                        character.characterConfig.movement.usedDash = false;
                    });
            }
            this.checkObjectReset();
        }
    };

    this.createMap = (map) => {
        game.activeMap = new BattleMap(game, map);
        game.activeMap.generateMap();
        var self = this;
        _.each(game.activeMap.tiles.getChildren(), function (tile) {
            //mouse input on clicking game tiles and hovering over them
            self.bindTileEvents(tile);
        });
        _.each(game.activeMap.objects.getChildren(), function (object) {
            //mouse input on clicking game objects
            self.bindObjectEvents(object);
        });
    };

    this.addHUDSceneEvents = function () {
        var self = this;
        game.hudScene = game.scene.get('HUDScene');
        game.hudScene.scene.bringToTop();
        game.hudScene.events.on('endTurn', function () {
            self.endTurn();
        });
        game.hudScene.events.on('getCharacterStartData', function () {
            game.events.emit('showCharacterInitiative', game.initiative);
        });
        game.hudScene.events.on('highlightCharacter', function (character) {
            game.activeMap.highlightCharacter(character);
        });
        game.hudScene.events.on('dehighlightCharacter', function (character) {
            game.activeMap.dehighlightCharacter(character);
        });
        game.hudScene.events.on('dropItem', function (itemToDrop) {
            game.characters.dropItem(itemToDrop);
        });
        game.hudScene.events.on('replaceItem', function (config) {
            game.characters.replaceItem(config.selectedItem, config.itemToReplace);
        });
        game.hudScene.events.on('getItemFromLootBag', function (config) {
            var item = config.item,
                lootbag = config.lootbag;
            game.characters.addItemFromList(item, lootbag);
        });
        game.hudScene.events.on('addAttributePoint', function (index) {
            game.characters.updateAttributes(index);
        });
        game.hudScene.events.on('boughtSkill', function (skill) {
            game.characters.buySkill(skill);
        });
        game.hudScene.events.on('useDash', function () {
            game.characters.useDash();
        });
        game.hudScene.events.on('spellSelected', function (spell) {
            if (game.activeCharacter.characterConfig.energy.actionId === EnumHelper.actionEnum.attackSpell
                && game.activeCharacter.characterConfig.energy.selectedAction === spell) {
                game.activeCharacter.characterConfig.energy.actionId = -1;
                game.events.emit('removeSelectedActionIcon');
            } else {
                var charConfig = game.activeCharacter.characterConfig;
                charConfig.energy.actionId = EnumHelper.actionEnum.attackSpell;
                charConfig.energy.selectedAction = spell;
                game.events.emit('showSelectedActionIcon', spell.image);
            }
        });
        game.hudScene.events.on('inspectSelected', function () {
            if (game.activeCharacter.characterConfig.energy.actionId === EnumHelper.actionEnum.inspect) {
                game.activeCharacter.characterConfig.energy.actionId = -1;
                game.events.emit('removeSelectedActionIcon');
            } else {
                game.activeCharacter.characterConfig.energy.actionId = EnumHelper.actionEnum.inspect;
                game.events.emit('showSelectedActionIcon', 'inspectButton');
            }
            game.activeCharacter.characterConfig.energy.selectedAction = null;
        });
        game.hudScene.events.on('useMainHand', function () {
            if (game.activeCharacter.characterConfig.energy.actionId === EnumHelper.actionEnum.attackMainHand) {
                game.activeCharacter.characterConfig.energy.actionId = -1;
                game.events.emit('removeSelectedActionIcon');
            } else {
                game.activeCharacter.characterConfig.energy.actionId = EnumHelper.actionEnum.attackMainHand;
                game.events.emit('showSelectedActionIcon', game.activeCharacter.characterConfig.inventory.mainHand.image);
                game.activeCharacter.characterConfig.energy.selectedAction = game.activeCharacter.characterConfig.inventory.mainHand;
            }
        });
        game.hudScene.events.on('useOffHand', function () {
            if (game.activeCharacter.characterConfig.energy.actionId === EnumHelper.actionEnum.attackOffHand) {
                game.activeCharacter.characterConfig.energy.actionId = -1;
                game.events.emit('removeSelectedActionIcon');
            } else {
                if (game.activeCharacter.characterConfig.inventory.offHand.damage) {
                    game.activeCharacter.characterConfig.energy.actionId = EnumHelper.actionEnum.attackOffHand;
                    game.events.emit('showSelectedActionIcon', game.activeCharacter.characterConfig.inventory.offHand.image);
                    game.activeCharacter.characterConfig.energy.selectedAction = game.activeCharacter.characterConfig.inventory.offHand;
                }
            }
        });
    };

    this.createKeys = function () {
        game.keycodes = {
            d: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            alt: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT)
        };
    };

    this.bindTileEvents = (tile) => {
        tile.on('pointerdown', _.bind(this._moveCharacterOnClick, this, tile));
        tile.on('pointerover', _.bind(this._hoverTile, this, tile));
        tile.on('pointerout', _.bind(this._leaveTile, this, tile));
    };

    this.bindObjectEvents = (object) => {
        object.on('pointerdown', _.bind(this._interactWithObject, this, object));
        object.on('pointerover', _.bind(this._hoverObject, this, object));
        object.on('pointerout', _.bind(this._leaveObject, this, object));
    };

    this.bindEnemyEvents = (enemy) => {
        enemy.on('pointerdown', _.bind(this._interactWithEnemy, this, enemy));
        enemy.on('pointerover', _.bind(this._hoverCharacter, this, enemy));
        enemy.on('pointerout', _.bind(this._unhoverCharacter, this, enemy));
    };

    this.bindCharacterEvents = (character) => {
        character.on('pointerover', _.bind(this._hoverCharacter, this, character));
        character.on('pointerout', _.bind(this._unhoverCharacter, this, character));
        character.on('pointerdown', _.bind(this._showCharacterInventory, this, character));
    };

    this.createCharacters = () => {
        //party characters
        var self = this;
        game.characters = new Character(game);
        //game.characters.addNewCharacter(600, 300, 'character1');
        game.characters.addNewCharacter(600, 350, 'character2');
        game.characters.addNewCharacter(600, 400, 'character3');
        //game.characters.addNewCharacter(550, 300, 'character4');

        game.input.setHitArea(game.characters.characters.getChildren());
        _.each(game.characters.characters.getChildren(), function (character) {
            self.bindCharacterEvents(character);
        });
    };

    this.createEnemies = () => {
        var self = this;
        game.enemies = new Enemy(game);
        game.enemies.addNewCharacter(200, 300, EnemyConfig.test);
        game.enemies.total = game.enemies.characters.getChildren().length;
        game.input.setHitArea(game.enemies.characters.getChildren());
        _.each(game.enemies.characters.getChildren(), function (enemy) {
            self.bindEnemyEvents(enemy);
        });
    };

    this.createCamera = () => {
        //main camera
        game.cameras.main.setBounds(0, 0, game.activeMap.levelMap[0].length * 50, game.activeMap.levelMap.length * 50 + 230);
        game.cameras.main.setZoom(1.5);
        if (game.activeCharacter.characterConfig.isPlayerControlled) {
            //game.cameras.main.startFollow(game.activeCharacter, true, 0.09, 0.09);
        }
    };

    this.checkManager = () => {
        if (game.activeCharacter.characterConfig.isPlayerControlled) {
            game.characters.check();
        } else {
            game.enemies.check();
        }
        this._moveCamera();
    };

    this.getInitiativeArray = (deadCharacters) => {
        if (!game.initiative) {
            var preinitiative = [],
                initiative = [];
            _.each(game.characters.characters.getChildren(), function (character) {
                var index = Math.floor(Math.random() * 20) + 1 + character.characterConfig.attributes.dexterity;
                preinitiative.push({
                    index: index,
                    character: character
                });
            });
            if (game.enemies) {
                _.each(game.enemies.characters.getChildren(), function (character) {
                    var index = Math.floor(Math.random() * 20) + 1 + character.characterConfig.attributes.dexterity;
                    preinitiative.push({
                        index: index,
                        character: character
                    });
                });
            }
            preinitiative = preinitiative.sort(function (a, b) {
                if (a.index < b.index) {
                    return 1;
                } else if (a.index > b.index) {
                    return -1;
                }
                return 0;
            });
            _.each(preinitiative, function (item) {
                initiative.push(item.character);
            });
            return initiative;
        } else {
            _.each(deadCharacters, function (character) {
                var index = game.initiative.indexOf(character);
                if (index > -1) {
                    game.initiative.splice(index, 1);
                }
            });
            return game.initiative;
        }
    };

    this.createItems = () => {
        var self = this,
            item = game.physics.add.sprite(700, 200, 'shortBow').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.weapons.shortBow);
        game.items.add(item);

        item = game.physics.add.sprite(700, 250, 'shortBow').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.weapons.shortBow);
        game.items.add(item);

        item = game.physics.add.sprite(700, 300, 'shortSword').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.weapons.shortSword);
        game.items.add(item);

        item = game.physics.add.sprite(700, 350, 'shortSword').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.weapons.shortSword);
        game.items.add(item);

        item = game.physics.add.sprite(700, 400, 'cap').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.head.cap);
        game.items.add(item);

        item = game.physics.add.sprite(700, 450, 'buckler').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.shields.buckler);
        game.items.add(item);

        item = game.physics.add.sprite(700, 500, 'chainMail').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.body.chainMail);
        game.items.add(item);

        item = game.physics.add.sprite(700, 550, 'leatherGloves').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.hands.leatherGloves);
        game.items.add(item);

        item = game.physics.add.sprite(700, 600, 'greaves').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.feet.greaves);
        game.items.add(item);

        game.input.setHitArea(game.items.getChildren());
        _.each(game.items.getChildren(), function (item) {
            //mouse input on clicking game objects
            item.on('pointerdown', _.bind(self._pickUpItem, self, item));
            item.on('pointerover', _.bind(self._hoverItem, self, item));
        });
    };

    this.checkObjectReset = () => {
        var callbackObjects = game.activeMap.objects.getChildren().filter(function (object) {
            return object.objectConfig.callback !== null;
        });
        _.each(callbackObjects, function (object) {
            object.objectConfig.callback();
        });
    };

    // PRIVATE
    // INTERACTION -------------------------------------------------------------------------------------
    this._moveCamera = () => {
        if (game.cursors.left.isDown) {
            game.cameras.main.scrollX -= 10;
        }
        if (game.cursors.right.isDown) {
            game.cameras.main.scrollX += 10;
        }
        if (game.cursors.up.isDown) {
            game.cameras.main.scrollY -= 10;
        }
        if (game.cursors.down.isDown) {
            game.cameras.main.scrollY += 10;
        }
        if (game.keycodes.d.isDown && game.keycodes.alt.isDown) {
            game.debugMode = !game.debugMode;
        }
    };
    this._moveCharacterOnClick = (tile) => {
        var actionId = game.activeCharacter.characterConfig.energy.actionId;
        if (actionId === EnumHelper.actionEnum.inspect) {
            game.activeCharacter.characterConfig.energy.actionId = -1;
            game.activeCharacter.characterConfig.energy.selectedAction = null;
            game.characters.inspect(tile);
        } else {
            game.characters.moveActiveCharacterToTile(tile);
        }
    };
    this._hoverTile = (tile) => {
        game.activeMap.highlightPathToTile(tile);
    };
    this._hoverObject = (object) => {
        game.activeMap.highlightPathToObject(object);
    };
    this._interactWithObject = (object) => {
        var actionId = game.activeCharacter.characterConfig.energy.actionId;
        if (actionId === EnumHelper.actionEnum.inspect) {
            game.activeCharacter.characterConfig.energy.actionId = -1;
            game.activeCharacter.characterConfig.energy.selectedAction = null;
            game.characters.inspect(object);
        } else {
            game.characters.interactWithObject(object);
        }
    };
    this._interactWithEnemy = (enemy, pointer) => {
        // TODO: Move to action manager?
        var actionId = game.activeCharacter.characterConfig.energy.actionId;
        if (pointer.rightButtonDown() !== 0) {
            this._showCharacterInventory(enemy, pointer);
        }
        else if (actionId === EnumHelper.actionEnum.attackMainHand || actionId === EnumHelper.actionEnum.attackSpell || actionId === EnumHelper.actionEnum.attackOffHand) {
            game.characters.interactWithEnemy(enemy);
        } else if (actionId === EnumHelper.actionEnum.inspect) {
            game.activeCharacter.characterConfig.energy.actionId = -1;
            game.activeCharacter.characterConfig.energy.selectedAction = null;
            // TODO: Show enemy description?
        }
    };
    this._hoverCharacter = (character) => {
        game.activeMap.highlightPathToEnemy(character);
        if (((game.activeCharacter.characterConfig.energy.actionId === EnumHelper.actionEnum.attackMainHand &&
            game.activeCharacter.characterConfig.inventory.mainHand.range > 1) ||
            (game.activeCharacter.characterConfig.energy.actionId === EnumHelper.actionEnum.attackSpell &&
                game.activeCharacter.characterConfig.energy.selectedAction.range > 1)) && game.debugMode) {
            game.characters.showRangeLine(game.activeCharacter, character);
        }
    };
    this._hoverItem = (item) => {
        game.activeMap.highlightPathToItem(item);
    };
    this._pickUpItem = (item) => {
        var actionId = game.activeCharacter.characterConfig.energy.actionId;
        if (actionId === EnumHelper.actionEnum.inspect) {
            // TODO: Show item description
        } else {
            game.characters.pickUpItem(item);
        }
    };
    this._leaveTile = () => {
        game.characters.closeInspect();
    };
    this._leaveObject = () => {
        game.characters.closeInspect();
    };
    this._unhoverCharacter = () => {
        game.characters.closeInspect();
        game.characters.hideRangeLine();
    };

    this._showCharacterInventory = (character, pointer) => {
        if (pointer.rightButtonDown() !== 0) {
            game.events.emit('showCharacterInventory', character);
        }
    };
};