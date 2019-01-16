import {AssetLoader} from 'Aniwars/assetLoader';
import {BattleMap} from 'Aniwars/map';
import {Character} from 'Aniwars/character';

export const AniwarsGame = function () { 
    var BootScene = new Phaser.Class({
        Extends: Phaser.Scene,

        initialize: function BootScene () {
            Phaser.Scene.call(this, { key: 'BootScene' });
        },
 
        preload() {
            var assetLoader = new AssetLoader(this);
            assetLoader.loadImages();
            assetLoader.loadSounds();
        },
 
        create() {
            this.scene.start('WorldScene');
        }
    });
 
    var WorldScene = new Phaser.Class({
        Extends: Phaser.Scene,
 
        initialize: function WorldScene () {
            Phaser.Scene.call(this, { key: 'WorldScene' });
        },

        preload() {
        
        },
        create() {
            this.activeMap = new BattleMap(this);
            this.activeMap.generateMap();

            //party characters
            this.characters = new Character(this, this.add.group());
            this.characters.addNewCharacter(600, 350, 'character');
            
            this.activeCharacter = this.characters.characters.getChildren()[0];
            this.activeMap.showMovementGrid();

            //enemy characters
            this.enemies = new Character(this, this.add.group());
            this.enemies.addNewCharacter(1100, 350, 'character');
            this.input.on('gameobjectdown', _.bind(this._moveCharacterOnClick, this));
            this.input.on('pointerover', _.bind(this._highlightPathToThis, this));

            this.locationText = this.add.text(10, 10, 'X: 0, Y: 0', { fill: '#0f0' });
        },
        update() {
            this._checkManager();
        },
        _moveCharacterOnClick(pointer, tile) {
            this.characters.moveActiveCharacter(tile, { enemies: this.enemies});
        },
        _checkManager() {
            this.locationText.setText('X: '+ Math.floor(this.activeCharacter.x / 50) + ', Y: ' + Math.floor(this.activeCharacter.y / 50));
            if (this.activeCharacter.characterConfig.isMoving) {
                this.characters.stopActiveCharacter();
            } else if (!this.activeCharacter.characterConfig.isMoving && this.activeCharacter.characterConfig.path.length > 0) {
                this.characters.keepMovingActiveCharacter();
            }
        },
        
        _highlightPathToThis(pointer, tiles) {
            this.activeMap.highlightPathToThis(tiles[0]);
        }
    });

    this.game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: 'content',
        width: 1200,
        height: 800,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }
            }
        },
        scene: [
            BootScene,
            WorldScene
        ]
    });
};