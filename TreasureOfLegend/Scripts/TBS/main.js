import {AssetLoader} from 'TBS/assetLoader';

export const TBSGame = function () {
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
            this.map = this.make.tilemap({ key: 'map' });

            this.tiles = this.map.addTilesetImage('spritesheet', 'tiles');
        
            this.ground = this.map.createStaticLayer('Ground', this.tiles, 0, 0);
            //var obstacles = this.map.createStaticLayer('Obstacles', this.tiles, 0, 0);
            //obstacles.setCollisionByExclusion([-1]);

            this.player = this.physics.add.sprite(200, 100, 'character');
            this.anims.create({
                key: 'left',
                frames: this.anims.generateFrameNumbers('character', { start: 12, end: 14 }),
                frameRate: 10,
                repeat: -1
            });

            this.anims.create({
                key: 'turn',
                frames: [ { key: 'character', frame: 2 } ],
                frameRate: 20
            });

            this.anims.create({
                key: 'right',
                frames: this.anims.generateFrameNumbers('character', { start: 23, end: 26 }),
                frameRate: 10,
                repeat: -1
            });

            this.physics.world.bounds.width = this.map.widthInPixels;
            this.physics.world.bounds.height = this.map.heightInPixels;

            this.player.setCollideWorldBounds(true);
            this.player.characterConfig = characterConfig;
            this.player.characterConfig.posX = 200;
            this.player.characterConfig.posY = 100;

            this.cursors = this.input.keyboard.createCursorKeys();

            this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            this.cameras.main.startFollow(this.player);
            this.cameras.main.roundPixels = true;

            this.input.on('gameobjectdown', this.clickedMap);
        },
        update:function() {
            this.player.body.setVelocity(0);
 
            // Horizontal movement
            if (this.cursors.left.isDown)
            {
                this.player.body.setVelocityX(-80);
            }
            else if (this.cursors.right.isDown)
            {
                this.player.body.setVelocityX(80);
            }
 
            // Vertical movement
            if (this.cursors.up.isDown)
            {
                this.player.body.setVelocityY(-80);
            }
            else if (this.cursors.down.isDown)
            {
                this.player.body.setVelocityY(80);
            }    
        },
        clickedMap: function(pointer, gameObject) {
            var tileworldX = pointer.worldX - (pointer.worldX % 50);
            var tileworldY = pointer.worldY - (pointer.worldY % 50);
            this.player.characterConfig.posX = tileworldX;
            this.player.characterConfig.posY = tileworldY;
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