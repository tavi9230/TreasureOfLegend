import {AssetLoader} from 'Aniwars/assetLoader';

export const AniwarsGame = function () {
    var levelMap = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
    var characterConfig = {
        life: 10,
        movement: 6,
        velocity: 200,
        posX: 0,
        posY: 0,
        isMoving: false,
        path: []
    }

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
            this.cursors = this.input.keyboard.createCursorKeys();
            var hitArea = new Phaser.Geom.Rectangle(0, 0, 50, 50);
            var hitAreaCallback = Phaser.Geom.Rectangle.Contains;
            this.tiles = this.add.group({
                hitArea: hitArea,
                hitAreaCallback: hitAreaCallback
            });
            this.objects = this.add.group({
                hitArea: hitArea,
                hitAreaCallback: hitAreaCallback
            });
            for (let i = 0, y = 0; i < levelMap.length; i++, y+=50) {
                for (let j = 0, x = 0; j < levelMap[i].length; j++, x+=50) {
                    if (levelMap[i][j] === 0) {
                        this.tiles.create(x, y, 'tile').setOrigin(0,0);
                    } else if (levelMap[i][j] === 1) {
                        this.objects.create(x, y, 'wallTile').setOrigin(0,0);
                    } else if (levelMap[i][j] === 2) {
                        this.tiles.create(x, y, 'tile').setOrigin(0,0);
                        this.objects.create(x, y, 'doorTile').setOrigin(0,0);
                    }
                }
            }
            this.input.setHitArea(this.tiles.getChildren());

            //party characters
            this.characters = this.add.group();
            var character = this.physics.add.sprite(50, 350, 'character').setOrigin(0,0);
            character.characterConfig = Object.assign({}, characterConfig);
            character.characterConfig.posX = 50;
            character.characterConfig.posY = 350;
            this.characters.add(character);
            this.activeCharacter = character;
            this._showMovementGrid(this.activeCharacter);

            //enemy characters
            this.enemies = this.add.group();
            var enemy = this.physics.add.sprite(1100, 350, 'character').setOrigin(0,0);
            enemy.characterConfig = Object.assign({}, characterConfig);
            enemy.characterConfig.posX = 1100;
            enemy.characterConfig.posY = 350;
            this.enemies.add(enemy);
            this.input.on('gameobjectdown', _.bind(this._moveCharacterOnClick, this));
            this.input.on('pointerover', _.bind(this._highlightPathToThis, this));

            //----------------------------------------------------------------------------- DEBUG STUFF
            this.speedTextButton = this.add.text(10, 10, 'Velocity: 70', { fill: '#0f0' });
            //-----------------------------------------------------------------------------
        },
        update() {
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
        _moveCharacterOnClick(pointer, tile) {
            this._moveCharacter(tile);
        },
        _moveCharacter(tile) {
            var currentCharacter = this.activeCharacter;
            if (!currentCharacter.characterConfig.isMoving && (currentCharacter.x !== tile.x || currentCharacter.y !== tile.y)){
                var isObstacleInTheWay = false;
                _.each(this.enemies.getChildren(), function(enemy) {
                    if (enemy.x === tile.x && enemy.y === tile.y) {
                        isObstacleInTheWay = true;
                        return;
                    }
                });
                _.each(this.objects.getChildren(), function(object) {
                    if (object.x === tile.x && object.y === tile.y) {
                        isObstacleInTheWay = true;
                        return;
                    }
                });
                var pathWay = this._findWay([currentCharacter.y / 50, currentCharacter.x / 50], [tile.y / 50, tile.x / 50]);
                currentCharacter.characterConfig.path = pathWay;
                currentCharacter.characterConfig.path.shift();
                if (currentCharacter.characterConfig.path.length <= currentCharacter.characterConfig.movement && !isObstacleInTheWay) { 
                    currentCharacter.characterConfig.isMoving = true;
                    currentCharacter.characterConfig.posX = currentCharacter.characterConfig.path[0][1] * 50;
                    currentCharacter.characterConfig.posY = currentCharacter.characterConfig.path[0][0] * 50;
                    currentCharacter.characterConfig.path.shift();
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
                } else if (currentCharacter.characterConfig.path.length > currentCharacter.characterConfig.movement) {
                    currentCharacter.characterConfig.path = [];
                }
            }
        },
        _stopCharacter() {
            var currentCharacter = this.activeCharacter;
            //reduce speed on X
            if (currentCharacter.characterConfig.isMoving) {
                if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) <= 100 &&
                    Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) > 30) {
                    currentCharacter.x > currentCharacter.characterConfig.posX
                        ? currentCharacter.setVelocityX(-150)
                        : currentCharacter.setVelocityX(150);
                } else if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) <= 30 &&
                    Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) > 5) {
                    currentCharacter.x > currentCharacter.characterConfig.posX
                        ? currentCharacter.setVelocityX(-120)
                        : currentCharacter.setVelocityX(120);
                } else if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) <= 5 &&
                    Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) > 1) {
                    currentCharacter.x > currentCharacter.characterConfig.posX
                        ? currentCharacter.setVelocityX(-45)
                        : currentCharacter.setVelocityX(45);
                } else if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) < 1) {
                    currentCharacter.setVelocityX(0);
                    currentCharacter.x = currentCharacter.characterConfig.posX;
                }

                //reduce speed on Y
                if (Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) <= 100 &&
                    Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) > 30) {
                    currentCharacter.y > currentCharacter.characterConfig.posY
                        ? currentCharacter.setVelocityY(-150)
                        : currentCharacter.setVelocityY(150);
                } else if (Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) <= 30 &&
                    Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) > 10) {
                    currentCharacter.y > currentCharacter.characterConfig.posY
                        ? currentCharacter.setVelocityY(-120)
                        : currentCharacter.setVelocityY(120);
                } else if (Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) <= 10 &&
                    Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) > 1) {
                    currentCharacter.y > currentCharacter.characterConfig.posY
                        ? currentCharacter.setVelocityY(-45)
                        : currentCharacter.setVelocityY(45);
                } else if (Math.abs(currentCharacter.y - currentCharacter.characterConfig.posY) < 1) {
                    currentCharacter.setVelocityY(0);
                    currentCharacter.y = currentCharacter.characterConfig.posY;
                }

                //show grid if stopped
                if (currentCharacter.x === currentCharacter.characterConfig.posX &&
                    currentCharacter.y === currentCharacter.characterConfig.posY &&
                    !this.isMovementGridShown) {
                    if (currentCharacter.characterConfig.path.length === 0) {
                        this._showMovementGrid(currentCharacter);
                    }
                    currentCharacter.characterConfig.isMoving = false;
                }
            } else if (!currentCharacter.characterConfig.isMoving && currentCharacter.characterConfig.path.length > 0) {
                currentCharacter.characterConfig.isMoving = true;
                currentCharacter.characterConfig.posX = currentCharacter.characterConfig.path[0][1] * 50;
                currentCharacter.characterConfig.posY = currentCharacter.characterConfig.path[0][0] * 50;
                currentCharacter.characterConfig.path.shift();
                var velocity = 0;
                if (currentCharacter.characterConfig.posX > currentCharacter.x) {
                    velocity = characterConfig.velocity;
                } else if (currentCharacter.characterConfig.posX < currentCharacter.x) {
                    velocity = -1 * characterConfig.velocity;
                }
                currentCharacter.setVelocityX(velocity);
                velocity = 0;
                if (currentCharacter.characterConfig.posY > currentCharacter.y) {
                    velocity = characterConfig.velocity;
                } else if (currentCharacter.characterConfig.posY < currentCharacter.y) {
                    velocity = -1 * characterConfig.velocity;
                }
                currentCharacter.setVelocityY(velocity);
            }
        },
        _showMovementGrid(character) {
            this.isMovementGridShown = true;
            _.each(this.tiles.getChildren(), (tile) => {
                if (character.characterConfig.movement * 50 >= Math.abs(tile.x - character.characterConfig.posX) 
                    && character.characterConfig.movement * 50 >= Math.abs(tile.y - character.characterConfig.posY) ) {
                    var pathWay = this._findWay([character.y / 50, character.x / 50], [tile.y / 50, tile.x / 50]);
                    if (pathWay) {
                        pathWay.shift();
                        if (pathWay.length <= character.characterConfig.movement) {
                            tile.setTint(0x990899);
                        }
                    }
                }
            });
        },
        _hideMovementGrid() {
            this.isMovementGridShown = false;
            _.each(this.tiles.getChildren(), (tile) => {
                tile.setTint(0xffffff);
            });
        },
        _checkManager() {
            this._stopCharacter();
        },
        _findWay (position, end) {
            var queue = [];
            var map = [];
            for (let i = 0; i < levelMap.length; i++) {
                map[i] = [];
                for (let j = 0; j < levelMap[i].length; j++) {
                    map[i][j] = levelMap[i][j];
                }
            }

            map[position[0]][position[1]] = 1;
            queue.push([position]); // store a path, not just a position

            while (queue.length > 0) {
                var path = queue.shift(); // get the path out of the queue
                var pos = path[path.length-1]; // ... and then the last position from it
                var direction = [
                  [pos[0] + 1, pos[1]],
                  [pos[0], pos[1] + 1],
                  [pos[0] - 1, pos[1]],
                  [pos[0], pos[1] - 1]
                ];

                for (var i = 0; i < direction.length; i++) {
                    // Perform this check first:
                    if (direction[i][0] === end[0] && direction[i][1] === end[1]) {
                        // return the path that led to the find
                        return path.concat([end]); 
                    }
      
                    if (direction[i][0] < 0 || direction[i][0] >= map[0].length 
                        || direction[i][1] < 0 || direction[i][1] >= map[0].length 
                        || map[direction[i][0]][direction[i][1]] !== 0) { 
                        continue;
                    }

                    map[direction[i][0]][direction[i][1]] = 1;
                    // extend and push the path on the queue
                    queue.push(path.concat([direction[i]])); 
                }
            }
        },
        _highlightPathToThis(pointer, tiles) {
            var tile = tiles[0];
            var currentCharacter = this.activeCharacter;
            if (currentCharacter.characterConfig.path.length === 0 
                && currentCharacter.x === currentCharacter.characterConfig.posX
                && currentCharacter.y === currentCharacter.characterConfig.posY) {
                this._showMovementGrid(currentCharacter);
                var pathWay = this._findWay([currentCharacter.y / 50, currentCharacter.x / 50], [tile.y / 50, tile.x / 50]);
                if (pathWay) {
                    pathWay.shift();
                    if (pathWay.length <= currentCharacter.characterConfig.movement)
                        _.each(this.tiles.getChildren(), function(tile) {
                            for (let i = 0; i < pathWay.length; i++) {
                                if (tile.x === pathWay[i][1] * 50 && tile.y === pathWay[i][0] * 50) {
                                    tile.setTint(0x4693eb);
                                }
                            }
                        });
                }
            }
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