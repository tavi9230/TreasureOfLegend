import {AssetLoader} from 'TBS/assetLoader';

export const TBSGame = function () {
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
            var map = this.make.tilemap({ key: 'map' });

            var tiles = map.addTilesetImage('spritesheet', 'tiles');
        
            var stone = map.createStaticLayer('Ground', tiles, 0, 0);
            //var obstacles = map.createStaticLayer('Obstacles', tiles, 0, 0);
            //obstacles.setCollisionByExclusion([-1]);

            this.player = this.physics.add.sprite(200, 100, 'player');
            this.anims.create({
                key: 'left',
                frames: this.anims.generateFrameNumbers('player', { start: 12, end: 14 }),
                frameRate: 10,
                repeat: -1
            });

            this.anims.create({
                key: 'turn',
                frames: [ { key: 'player', frame: 2 } ],
                frameRate: 20
            });

            this.anims.create({
                key: 'right',
                frames: this.anims.generateFrameNumbers('player', { start: 23, end: 26 }),
                frameRate: 10,
                repeat: -1
            });

            this.physics.world.bounds.width = map.widthInPixels;
            this.physics.world.bounds.height = map.heightInPixels;
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
                gravity: { y: 500 },
                debug: false
            }
        },
        scene: [
            BootScene,
            WorldScene
        ]
    };

    var game = new Phaser.Game(config);
};