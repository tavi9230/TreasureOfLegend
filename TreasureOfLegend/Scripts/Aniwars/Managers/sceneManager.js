import { BattleMap } from 'Aniwars/map';
import { Character } from 'Aniwars/character';
import { Enemy } from 'Aniwars/enemy';
import { InventoryConfig } from 'Aniwars/Configurations/inventoryConfig';
import { EnemyConfig } from 'Aniwars/Configurations/enemyConfig';
import { EnumHelper } from 'Aniwars/Helpers/enumHelper';

export const SceneManager = function (game) {
    this.game = game;
    this.endTurn = () => {
        var charConfig = this.game.activeCharacter.characterConfig;
        var shouldChangeTurn = false;
        if (charConfig.path.length === 0 &&
            !charConfig.movement.isMoving) {
            // TODO: Refresh movement, energy, etc only on turn counter change
            charConfig.movement.spent = 0;
            charConfig.energy.spent = 0;
            charConfig.movement.usedDash = false;
            var initialInitiativeIndex = this.game.initiativeIndex;
            this.game.initiativeIndex++;
            if (this.game.initiativeIndex >= this.game.initiative.length || initialInitiativeIndex === -1) {
                var shouldRestart = true;
                _.each(this.game.initiative, function (character) {
                    if (!character.characterConfig.isPlayerControlled) {
                        shouldRestart = false;
                    }
                });
                if (shouldRestart) {
                    this.game.initiative = null;
                    this.game.initiative = this.getInitiativeArray();
                }
                this.game.initiativeIndex = 0;
                shouldChangeTurn = true;
            }
            var first = this.game.initiative.shift();
            this.game.initiative.push(first);
            _.each(this.game.initiative, function (char) {
                char.clearTint();
            });
            this.game.events.emit('showCharacterInitiative', this.game.initiative);
            this.game.activeCharacter.characterConfig.energy.selectedAction = null;
            this.game.activeCharacter.characterConfig.energy.actionId = -1;
            this.game.events.emit('deselectButtons');
            this.game.events.emit('closeCharacterInfoTab');
            this.game.activeCharacter = this.game.initiative[0];
            this.game.cameras.main.startFollow(this.game.activeCharacter, true, 0.09, 0.09);
            this.game.cameras.main.stopFollow();

            if (this.game.activeCharacter.characterConfig.isPlayerControlled) {
                this.game.events.emit('toggleActionButtons', true);
                this.game.activeMap.showMovementGrid();
            } else {
                this.game.events.emit('toggleActionButtons', false);
                this.game.activeMap.hideMovementGrid();
            }
            if (shouldChangeTurn) {
                this.game.events.emit('changeTurnCounter');
            }
            this.checkObjectReset();
        }
    },
        this.createMap = (map) => {
            this.game.activeMap = new BattleMap(this.game, map);
            this.game.activeMap.generateMap();
            var self = this;
            _.each(this.game.activeMap.tiles.getChildren(), function (tile) {
                //mouse input on clicking game tiles and hovering over them
                self.bindTileEvents(tile);
            });
            _.each(this.game.activeMap.objects.getChildren(), function (object) {
                //mouse input on clicking game objects
                self.bindObjectEvents(object);
            });
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
        this.game.characters = new Character(this.game);
        //this.game.characters.addNewCharacter(600, 300, 'character1');
        this.game.characters.addNewCharacter(600, 350, 'character2');
        this.game.characters.addNewCharacter(600, 400, 'character3');
        //this.game.characters.addNewCharacter(550, 300, 'character4');

        this.game.input.setHitArea(this.game.characters.characters.getChildren());
        _.each(this.game.characters.characters.getChildren(), function (character) {
            self.bindCharacterEvents(character);
        });
    };

    this.createEnemies = () => {
        var self = this;
        this.game.enemies = new Enemy(this.game);
        this.game.enemies.addNewCharacter(800, 450, EnemyConfig.test);
        this.game.enemies.total = this.game.enemies.characters.getChildren().length;
        this.game.input.setHitArea(this.game.enemies.characters.getChildren());
        _.each(this.game.enemies.characters.getChildren(), function (enemy) {
            self.bindEnemyEvents(enemy);
        });
    };

    this.createCamera = () => {
        //main camera
        this.game.cameras.main.setBounds(0, 0, this.game.activeMap.levelMap[0].length * 50, this.game.activeMap.levelMap.length * 50 + 230);
        this.game.cameras.main.setZoom(1.5);
        if (this.game.activeCharacter.characterConfig.isPlayerControlled) {
            //this.game.cameras.main.startFollow(this.game.activeCharacter, true, 0.09, 0.09);
        }
    };

    this.checkManager = () => {
        if (this.game.activeCharacter.characterConfig.isPlayerControlled) {
            this.game.characters.check();
        } else {
            this.game.enemies.check();
        }
    };

    this.getInitiativeArray = (deadCharacters) => {
        if (!this.game.initiative) {
            var preinitiative = [],
                initiative = [];
            _.each(this.game.characters.characters.getChildren(), function (character) {
                var index = Math.floor(Math.random() * 20) + 1 + character.characterConfig.attributes.dexterity;
                preinitiative.push({
                    index: index,
                    character: character
                });
            });
            if (this.game.enemies) {
                _.each(this.game.enemies.characters.getChildren(), function (character) {
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
            var self = this;
            _.each(deadCharacters, function (character) {
                var index = self.game.initiative.indexOf(character);
                if (index > -1) {
                    self.game.initiative.splice(index, 1);
                }
            });
            return self.game.initiative;
        }
    };

    this.createItems = () => {
        var self = this;

        this.game.items = this.game.add.group();
        var item = this.game.physics.add.sprite(700, 200, 'bow').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.bow);
        this.game.items.add(item);

        item = this.game.physics.add.sprite(700, 250, 'bow').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.bow);
        this.game.items.add(item);

        item = this.game.physics.add.sprite(700, 300, 'shortsword').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.shortsword);
        this.game.items.add(item);

        item = this.game.physics.add.sprite(700, 350, 'shortsword').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.shortsword);
        this.game.items.add(item);

        item = this.game.physics.add.sprite(700, 400, 'head').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.head);
        this.game.items.add(item);

        item = this.game.physics.add.sprite(700, 450, 'shield').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.shield);
        this.game.items.add(item);

        item = this.game.physics.add.sprite(700, 500, 'chainmail').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.chainmail);
        this.game.items.add(item);

        item = this.game.physics.add.sprite(700, 550, 'hand').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.hand);
        this.game.items.add(item);

        item = this.game.physics.add.sprite(700, 600, 'feet').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.width = 50;
        item.height = 50;
        item.itemConfig = lodash.cloneDeep(InventoryConfig.feet);
        this.game.items.add(item);

        this.game.input.setHitArea(this.game.items.getChildren());
        _.each(this.game.items.getChildren(), function (item) {
            //mouse input on clicking game objects
            item.on('pointerdown', _.bind(self._pickUpItem, self, item));
            item.on('pointerover', _.bind(self._hoverItem, self, item));
        });
    };

    this.checkObjectReset = () => {
        var callbackObjects = this.game.activeMap.objects.getChildren().filter(function (object) {
            return object.objectConfig.callback !== null;
        });
        _.each(callbackObjects, function (object) {
            object.objectConfig.callback();
        });
    };

    // PRIVATE
    // INTERACTION -------------------------------------------------------------------------------------
    this._moveCharacterOnClick = (tile) => {
        var actionId = this.game.activeCharacter.characterConfig.energy.actionId;
        if (actionId === EnumHelper.actionEnum.inspect) {
            this.game.activeCharacter.characterConfig.energy.actionId = -1;
            this.game.activeCharacter.characterConfig.energy.selectedAction = null;
            this.game.characters.inspect(tile);
        } else {
            this.game.characters.moveActiveCharacterToTile(tile);
        }
    };
    this._hoverTile = (tile) => {
        this.game.activeMap.highlightPathToTile(tile);
    };
    this._hoverObject = (object) => {
        this.game.activeMap.highlightPathToObject(object);
    };
    this._interactWithObject = (object) => {
        var actionId = this.game.activeCharacter.characterConfig.energy.actionId;
        if (actionId === EnumHelper.actionEnum.inspect) {
            this.game.activeCharacter.characterConfig.energy.actionId = -1;
            this.game.activeCharacter.characterConfig.energy.selectedAction = null;
            this.game.characters.inspect(object);
        } else {
            this.game.characters.interactWithObject(object);
        }
    };
    this._interactWithEnemy = (enemy, pointer) => {
        // TODO: Move to action manager?
        var actionId = this.game.activeCharacter.characterConfig.energy.actionId;
        if (pointer.rightButtonDown() !== 0) {
            this._showCharacterInventory(enemy, pointer);
        }
        else if (actionId === EnumHelper.actionEnum.attackMainHand || actionId === EnumHelper.actionEnum.attackSpell) {
            this.game.characters.interactWithEnemy(enemy);
        } else if (actionId === EnumHelper.actionEnum.inspect) {
            this.game.activeCharacter.characterConfig.energy.actionId = -1;
            this.game.activeCharacter.characterConfig.energy.selectedAction = null;
            // TODO: Show enemy description?
        }
    };
    this._hoverCharacter = (character) => {
        this.game.activeMap.highlightPathToEnemy(character);
        if (((this.game.activeCharacter.characterConfig.energy.actionId === EnumHelper.actionEnum.attackMainHand &&
            this.game.activeCharacter.characterConfig.inventory.mainHand.range > 1) ||
            (this.game.activeCharacter.characterConfig.energy.actionId === EnumHelper.actionEnum.attackSpell &&
                this.game.activeCharacter.characterConfig.energy.selectedAction.range > 1)) && this.game.debugMode) {
            this.game.characters.showRangeLine(this.game.activeCharacter, character);
        }
    };
    this._hoverItem = (item) => {
        this.game.activeMap.highlightPathToItem(item);
    };
    this._pickUpItem = (item) => {
        var actionId = this.game.activeCharacter.characterConfig.energy.actionId;
        if (actionId === EnumHelper.actionEnum.inspect) {
            // TODO: Show item description
        } else {
            this.game.characters.pickUpItem(item);
        }
    };
    this._leaveTile = () => {
        this.game.characters.closeInspect();
    };
    this._leaveObject = () => {
        this.game.characters.closeInspect();
    };
    this._unhoverCharacter = () => {
        this.game.characters.closeInspect();
        this.game.characters.hideRangeLine();
    };

    this._showCharacterInventory = (character, pointer) => {
        if (pointer.rightButtonDown() !== 0) {
            this.game.events.emit('showCharacterInventory', character);
        }
    };
};