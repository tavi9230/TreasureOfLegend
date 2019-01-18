import {BattleMap} from 'Aniwars/map';
import {Character} from 'Aniwars/character';

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

        this.game.activeCharacter = this.game.characters.characters.getChildren()[0];
        this.game.activeMap.showMovementGrid();
    };

    this.createEnemies = () => {
        //enemy characters
        this.game.enemies = new Character(this.game);
        this.game.enemies.addNewCharacter(1100, 350, 'character');
    };

    this.createCamera = () => {
        //main camera
        this.game.cameras.main.setBounds(0, 0, this.game.activeMap.levelMap.length * 50, this.game.activeMap.levelMap.length * 50 + 100);
        this.game.cameras.main.startFollow(this.game.activeCharacter, true, 0.09, 0.09);
    };

    this.checkManager = () => {
        if (this.game.activeCharacter.characterConfig.isMoving) {
            this.game.events.emit('activeCharacterPositionModified', this.game.activeCharacter);
            this.game.characters.stopActiveCharacter();
        } else if (!this.game.activeCharacter.characterConfig.isMoving &&
            this.game.activeCharacter.characterConfig.path.length > 0) {
            this.game.characters.keepMovingActiveCharacter();
        }
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
};