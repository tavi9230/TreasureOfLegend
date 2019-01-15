import {AssetLoader} from 'Aniwars/assetLoader';

export const AniwarsGame = function () {
    var characterConfig = {
        life: 10,
        movement: 5,
        velocity: 150,
        posX: 0,
        posY: 0
    }

    var enemyConfig = {
        life: 10,
        movement: 5,
        velocity: 150,
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
            this.cursors = this.input.keyboard.createCursorKeys();
            var hitArea = new Phaser.Geom.Rectangle(0, 0, 50, 50);
            var hitAreaCallback = Phaser.Geom.Rectangle.Contains;
            this.tiles = this.add.group({
                hitArea: hitArea,
                hitAreaCallback: hitAreaCallback
            });
            for (let i = 0; i < 1200; i+=50) {
                for (let j = 0; j < 800; j+=50) {
                    this.tiles.create(i, j, 'tile').setOrigin(0,0);
                }
            }
            this.input.setHitArea(this.tiles.getChildren());

            //party characters
            this.characters = this.add.group();
            var character = this.physics.add.sprite(0, 350, 'character').setOrigin(0,0);
            character.characterConfig = characterConfig;
            character.characterConfig.posX = 0;
            character.characterConfig.posY = 350;
            this.characters.add(character);
            this.activeCharacter = character;
            this._showMovementGrid(this.activeCharacter);

            //enemy characters
            this.enemies = this.add.group();
            var enemy = this.physics.add.sprite(1150, 350, 'character').setOrigin(0,0);
            enemy.characterConfig = characterConfig;
            enemy.characterConfig.posX = 0;
            enemy.characterConfig.posY = 350;
            this.enemies.add(enemy);
            this.input.on('gameobjectdown', _.bind(this._moveCharacter, this));

            //----------------------------------------------------------------------------- DEBUG STUFF
            this.speedTextButton = this.add.text(10, 10, 'Velocity: 70', { fill: '#0f0' });
            //-----------------------------------------------------------------------------
        },
        update: function() {
            this._checkManager();
            //----------------------------------------------------------------------------- DEBUG STUFF
            var currentCharacter = this.activeCharacter;
            if (this.cursors.up.isDown) {
                currentCharacter.characterConfig.velocity += 1;
                this.speedTextButton.setText('Velocity: ' + currentCharacter.characterConfig.velocity);
            }
            if (this.cursors.down.isDown) {
                currentCharacter.characterConfig.velocity -= 1;
                this.speedTextButton.setText('Velocity: ' + currentCharacter.characterConfig.velocity);
            }
            //-----------------------------------------------------------------------------
        },
        _moveCharacter: function(pointer, tile) {
            var currentCharacter = this.activeCharacter;
            var isObstacleInTheWay = false;
            _.each(this.enemies.getChildren(), function(enemy) {
                if (enemy.x === tile.x && enemy.y === tile.y) {
                    isObstacleInTheWay = true;
                    return;
                }
            });
            if (currentCharacter.characterConfig.movement * 50 >= Math.abs(tile.x - currentCharacter.characterConfig.posX) &&
                currentCharacter.characterConfig.movement * 50 >= Math.abs(tile.y - currentCharacter.characterConfig.posY)
                && !isObstacleInTheWay) {
                currentCharacter.characterConfig.posX = tile.x;
                currentCharacter.characterConfig.posY = tile.y;
                var velocity = 0;
                if (tile.x > currentCharacter.x) {
                    velocity = characterConfig.velocity;
                } else if (tile.x < currentCharacter.x) {
                    velocity = -1 * characterConfig.velocity;
                }
                currentCharacter.setVelocityX(velocity);
                velocity = 0;
                if (tile.y > currentCharacter.y) {
                    velocity = characterConfig.velocity;
                } else if (tile.y < currentCharacter.y) {
                    velocity = -1 * characterConfig.velocity;
                }
                currentCharacter.setVelocityY(velocity);
                this._hideMovementGrid();
            }
        },
        _stopCharacter() {
            var currentCharacter = this.activeCharacter;
            if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) <= 100 && Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) > 30) {
                currentCharacter.x > currentCharacter.characterConfig.posX
                ? currentCharacter.setVelocityX(-100)
                : currentCharacter.setVelocityX(100);
            } else if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) <= 30 && Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) > 5) {
                currentCharacter.x > currentCharacter.characterConfig.posX
                ? currentCharacter.setVelocityX(-80)
                : currentCharacter.setVelocityX(80);
            } else if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) <= 5 && Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) > 1) {
                currentCharacter.x > currentCharacter.characterConfig.posX
                ? currentCharacter.setVelocityX(-25)
                : currentCharacter.setVelocityX(25);
            } else if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) < 1) {
                currentCharacter.setVelocityX(0);
                currentCharacter.x = currentCharacter.characterConfig.posX;
            }
            
            if (Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) <= 100 && Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) > 30) {
                currentCharacter.y > currentCharacter.characterConfig.posY
                ? currentCharacter.setVelocityY(-100)
                : currentCharacter.setVelocityY(100);
            } else if (Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) <= 30 && Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) > 10) {
                currentCharacter.y > currentCharacter.characterConfig.posY
                ? currentCharacter.setVelocityY(-80)
                : currentCharacter.setVelocityY(80);
            } else if (Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) <= 10 && Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) > 1) {
                currentCharacter.y > currentCharacter.characterConfig.posY
                ? currentCharacter.setVelocityY(-25)
                : currentCharacter.setVelocityY(25);
            } else if (Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) < 1) {
                currentCharacter.setVelocityY(0);
                currentCharacter.y = currentCharacter.characterConfig.posY;
            }

            if (currentCharacter.x === currentCharacter.characterConfig.posX 
                && currentCharacter.y === currentCharacter.characterConfig.posY
                && !this.isMovementGridShown) {
                this._showMovementGrid(currentCharacter);
            }
        },
        _showMovementGrid(character) {
            this.isMovementGridShown = true;
            _.each(this.tiles.getChildren(), (tile) => {
                if (character.characterConfig.movement * 50 >= Math.abs(tile.x - character.characterConfig.posX) 
                    && character.characterConfig.movement * 50 >= Math.abs(tile.y - character.characterConfig.posY) ) {
                    tile.setTint(0x990899);
                }
            });
        },
        _hideMovementGrid() {
            this.isMovementGridShown = false;
            _.each(this.tiles.getChildren(), (tile) => {
                tile.setTint(0xffffff);
            });
        },
        _checkManager: function() {
            this._stopCharacter();
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