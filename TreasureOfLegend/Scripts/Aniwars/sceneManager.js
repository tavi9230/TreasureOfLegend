import {BattleMap} from 'Aniwars/map';
import {Character} from 'Aniwars/character';
import {Enemy} from 'Aniwars/enemy';
import {InventoryConfig} from 'Aniwars/inventoryConfig';

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

    this.createCharacters = () => {
        //party characters
        this.game.characters = new Character(this.game);
        this.game.characters.addNewCharacter(600, 350, 'character');
        this.game.characters.addNewCharacter(600, 400, 'character');
        this.game.characters.addNewCharacter(600, 450, 'character');
        this.game.characters.addNewCharacter(600, 500, 'character');

        this.game.activeCharacter = this.game.characters.characters.getChildren()[0];
        this.game.activeMap.showMovementGrid();
    };

    this.createEnemies = () => {
        //enemy characters
        var self = this;
        this.game.enemies = new Enemy(this.game);
        this.game.enemies.addNewCharacter(1100, 350, 'character');
        this.game.input.setHitArea(this.game.enemies.characters.getChildren());
        _.each(this.game.enemies.characters.getChildren(), function(enemy) {
            //mouse input on clicking game objects
            enemy.on('pointerdown', _.bind(self._interactWithEnemy, self, enemy));
            enemy.on('pointerover', _.bind(self._hoverEnemy, self, enemy));
        });
    };

    this.createCamera = () => {
        //main camera
        this.game.cameras.main.setBounds(0, -100, this.game.activeMap.levelMap[0].length * 50, this.game.activeMap.levelMap.length * 50 + 100);
        this.game.cameras.main.startFollow(this.game.activeCharacter, true, 0.09, 0.09);
    };

    this.checkManager = () => {
        if (this.game.activeCharacter.characterConfig.isPlayerControlled) {
            this.game.characters.check();
        } else {
            this.game.enemies.check();
        }
    };

    this.getInitiativeArray = () => {
        var initiative = this.game.characters.characters.getChildren();
        initiative = initiative.concat(this.game.enemies.characters.getChildren());
        return initiative.sort(function(a, b) {
            if (a.characterConfig.dexterity < b.characterConfig.dexterity) {
                return -1;
            } else if (a.characterConfig.dexterity > b.characterConfig.dexterity) {
                return 1;
            }
            return 0;
        });
    };

    this.createItems = () => {
        var self = this;

        this.game.items = this.game.add.group();
        var item = this.game.physics.add.sprite(550, 350, 'bow').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.itemConfig = InventoryConfig.bow;
        this.game.items.add(item);
        item = this.game.physics.add.sprite(650, 350, 'shortsword').setOrigin(0, 0);
        item.displayHeight = 50;
        item.displayWidth = 50;
        item.itemConfig = InventoryConfig.shortsword;
        this.game.items.add(item);

        this.game.input.setHitArea(this.game.items.getChildren());
        _.each(this.game.items.getChildren(), function(item) {
            //mouse input on clicking game objects
            item.on('pointerdown', _.bind(self._pickUpItem, self, item));
            item.on('pointerover', _.bind(self._hoverItem, self, item));
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