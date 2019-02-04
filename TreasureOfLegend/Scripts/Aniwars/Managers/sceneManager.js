import {BattleMap} from 'Aniwars/map';
import {Character} from 'Aniwars/character';
import {Enemy} from 'Aniwars/enemy';
import {InventoryConfig} from 'Aniwars/Configurations/inventoryConfig';

export const SceneManager = function (game) {
    this.game = game;
    this.createMap = () => {
        this.game.activeMap = new BattleMap(this.game);
        this.game.activeMap.generateMap();
        var self = this;
        _.each(this.game.activeMap.tiles.getChildren(),
            function(tile) {
                //mouse input on clicking game tiles and hovering over them
                tile.on('pointerdown', _.bind(self._moveCharacterOnClick, self, tile));
                tile.on('pointerover', _.bind(self._hoverTile, self, tile));
            });
        _.each(this.game.activeMap.objects.getChildren(),
            function(object) {
                //mouse input on clicking game objects
                object.on('pointerdown', _.bind(self._interactWithObject, self, object));
                object.on('pointerover', _.bind(self._hoverObject, self, object));
            });
    };

    this.bindObjectEvents = (object) => {
        object.on('pointerdown', _.bind(this._interactWithObject, this, object));
        object.on('pointerover', _.bind(this._hoverObject, this, object));
    };

    this.createCharacters = () => {
        //party characters
        this.game.characters = new Character(this.game);
        this.game.characters.addNewCharacter(600, 300, 'character1');
        this.game.characters.addNewCharacter(600, 350, 'character2');
        this.game.characters.addNewCharacter(600, 400, 'character3');
        this.game.characters.addNewCharacter(550, 300, 'character4');

        //this.game.activeMap.showMovementGrid();
    };

    this.createEnemies = () => {
        //enemy characters
        var self = this;
        this.game.enemies = new Enemy(this.game);
        this.game.enemies.addNewCharacter(1000, 450, 'character');
        //this.game.enemies.addNewCharacter(950, 450, 'character');
        //this.game.enemies.addNewCharacter(900, 450, 'character');
        this.game.input.setHitArea(this.game.enemies.characters.getChildren());
        _.each(this.game.enemies.characters.getChildren(), function(enemy) {
            //mouse input on clicking game objects
            enemy.on('pointerdown', _.bind(self._interactWithEnemy, self, enemy));
            enemy.on('pointerover', _.bind(self._hoverEnemy, self, enemy));
        });
    };

    this.createCamera = () => {
        //main camera
        this.game.cameras.main.setBounds(0, -100, this.game.activeMap.levelMap[0].length * 50, this.game.activeMap.levelMap.length * 50 + 200);
        this.game.cameras.main.setZoom(1.25);
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
            _.each(this.game.characters.characters.getChildren(), function(character) {
                var index = Math.floor(Math.random() * 20) + 1 + character.characterConfig.attributes.dexterity;
                preinitiative.push({
                    index: index,
                    character: character
                });
            });
            if (this.game.enemies) {
                _.each(this.game.enemies.characters.getChildren(), function(character) {
                    var index = Math.floor(Math.random() * 20) + 1 + character.characterConfig.attributes.dexterity;
                    preinitiative.push({
                        index: index,
                        character: character
                    });
                });
            }
            preinitiative = preinitiative.sort(function(a, b) {
                if (a.index < b.index) {
                    return 1;
                } else if (a.index > b.index) {
                    return -1;
                }
                return 0;
            });
            _.each(preinitiative,
                function(item) {
                    initiative.push(item.character);
                });
            return initiative;
        } else {
            var self = this;
            _.each(deadCharacters, function(character) {
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
        _.each(this.game.items.getChildren(), function(item) {
            //mouse input on clicking game objects
            item.on('pointerdown', _.bind(self._pickUpItem, self, item));
            item.on('pointerover', _.bind(self._hoverItem, self, item));
        });
    };

    this.checkObjectReset = () => {
        var callbackObjects = this.game.activeMap.objects.getChildren().filter(function(object) {
            return object.objectConfig.callback !== null;
        });
        _.each(callbackObjects, function(object) {
            object.objectConfig.callback();
        });
    };

    // PRIVATE
    // INTERACTION -------------------------------------------------------------------------------------
    this._moveCharacterOnClick = (tile) => {
        this.game.characters.moveActiveCharacterToTile(tile);
    };
    this._hoverTile = (tile) => {
        this._showDescription(tile);
        this.game.activeMap.highlightPathToTile(tile);
    };
    this._hoverObject = (object) => {
        this._showDescription(object);
        this.game.activeMap.highlightPathToObject(object);
    };
    this._interactWithObject = (object) => {
        this.game.characters.interactWithObject(object);
    };
    this._showDescription = (object) => {
        this.game.events.emit('showObjectDescription', object);
    };
    this._interactWithEnemy = (enemy) => {
        this.game.characters.interactWithEnemy(enemy);
    };
    this._hoverEnemy = (enemy) => {
        this.game.activeMap.highlightPathToEnemy(enemy);
    };
    this._hoverItem = (item) => {
        this.game.activeMap.highlightPathToItem(item);
    };
    this._pickUpItem = (item) => {
        this.game.characters.pickUpItem(item);
    };
};