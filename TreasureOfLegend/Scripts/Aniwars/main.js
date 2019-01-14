import {AssetLoader} from 'Aniwars/assetLoader';

export const AniwarsGame = function () {
    var characterConfig = {
        life: 10,
        speed: 5,
        posX: 0,
        posY: 0
    }

    var BootScene = new Phaser.Class({
        Extends: Phaser.Scene,

        initialize: function BootScene () {
            Phaser.Scene.call(this, { key: 'BootScene' });
        },
 
        preload: function () {
            var assetLoader = new AssetLoader(this);
            assetLoader.loadImages();
            assetLoader.loadSounds();
        },
 
        create: function () {
            this.scene.start('WorldScene');
        }
    });
 
    var WorldScene = new Phaser.Class({
        Extends: Phaser.Scene,
 
        initialize: function WorldScene () {
            Phaser.Scene.call(this, { key: 'WorldScene' });
        },

        preload: function () {
        
        },
        create: function () {
            var hitArea = new Phaser.Geom.Rectangle(0, 0, 50, 50);
            var hitAreaCallback = Phaser.Geom.Rectangle.Contains;
            this.tiles = this.add.group({
                hitArea: hitArea,
                hitAreaCallback: hitAreaCallback,
                gridAlign: {
                    width: 100,
                    cellWidth: 50,
                    cellHeight: 50
                }
            });
            for (let i = 0; i < 1200; i+=50) {
                for (let j = 0; j < 800; j+=50) {
                    this.tiles.create(i, j, 'tile').setOrigin(0,0);
                }
            }
            this.input.setHitArea(this.tiles.getChildren());

            this.characters = this.add.group();
            this.characters.create(50, 50, 'character').setOrigin(0,0);

            this.input.on('gameobjectdown', _.bind(this._moveCharacter, this));

        },
        update: function() {
        },
        _moveCharacter: function(pointer, tile) {
            this.characters.getChildren()[0].x = tile.x;
            this.characters.getChildren()[0].y = tile.y;
        }
    });
 
    var config = {
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
    };

    var game = new Phaser.Game(config);
};