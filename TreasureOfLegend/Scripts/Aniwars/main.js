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
            var self = this;
            _.each(this.activeMap.tiles.getChildren(), function(tile) {
                tile.on('pointerdown', _.bind(self._moveCharacterOnClick, self, tile));
                tile.on('pointerover', _.bind(self._highlightPathToThis, self, tile));
            });

            //party characters
            this.characters = new Character(this, this.add.group());
            this.characters.addNewCharacter(600, 350, 'character');
            
            this.activeCharacter = this.characters.characters.getChildren()[0];
            this.activeMap.showMovementGrid();

            //enemy characters
            this.enemies = new Character(this, this.add.group());
            this.enemies.addNewCharacter(1100, 350, 'character');

            //mouse input on clicking game objects and hovering over them
            //this.input.on('gameobjectdown', _.bind(this._moveCharacterOnClick, this));
            //this.input.on('pointerover', _.bind(this._highlightPathToThis, this));

            //text with current character current location
            this.locationText = this.add.text(10, 10, 'X: 0, Y: 0', { fill: '#0f0' });

            //main camera
            this.cameras.main.setBounds(0, 0, this.activeMap.levelMap.length * 50, this.activeMap.levelMap.length * 50 + 100);
            this.cameras.main.startFollow(this.activeCharacter, true, 0.09, 0.09);

            //create player hud
            //var rect = new Phaser.Geom.Rectangle(0, 700, 1200, 800);
            //this.hud = this.add.graphics({ fillStyle: { color: 0x0000ff } });
            //this.hud.fillRectShape(rect);
            //graphics.setInteractive(rect, event);
        },
        update() {
            this._checkManager();
        },
        _checkManager() {
            this.locationText.setText('X: '+ Math.floor(this.activeCharacter.x / 50) + ', Y: ' + Math.floor(this.activeCharacter.y / 50));
            this.locationText.setX(this.cameras.main.scrollX + 10);
            this.locationText.setY(this.cameras.main.scrollY + 10);
            //this.hud.setX(this.cameras.main.scrollX);
            //this.hud.setY(this.cameras.main.scrollY + 700);
            if (this.activeCharacter.characterConfig.isMoving) {
                this.characters.stopActiveCharacter();
            } else if (!this.activeCharacter.characterConfig.isMoving && this.activeCharacter.characterConfig.path.length > 0) {
                this.characters.keepMovingActiveCharacter();
            }
        },
        _moveCharacterOnClick(tile) {
            this.characters.moveActiveCharacter(tile, { enemies: this.enemies});
        },
        _highlightPathToThis(tile) {
            this.activeMap.highlightPathToThis(tile);
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