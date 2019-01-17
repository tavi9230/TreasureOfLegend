import {Pathfinder} from 'Aniwars/pathfinder';

export const Character = function (game, characterGroup) {
    this.characterConfig = {
        life: 10,
        mana: 0,
        movement: 6,
        movementSpent: 0,
        armor: 10,
        velocity: 200,
        posX: 0,
        posY: 0,
        isMoving: false,
        path: [],
        actions: 1,
        actionsSpent: 0,
        minorActions: 0,
        minorActionsSpent: 0
    };
    this.game = game;
    this.map = game.activeMap;
    this.characters = characterGroup;

    this.addNewCharacter = (x, y, spriteName) => {
        var character = game.physics.add.sprite(x, y, spriteName).setOrigin(0, 0);
        character.characterConfig = Object.assign({}, this.characterConfig);
        character.characterConfig.posX = x;
        character.characterConfig.posY = y;
        this.characters.add(character);
    };

    this.moveActiveCharacter = (tile, config) => {
        var enemies = config.enemies;
        var currentCharacter = game.activeCharacter;
        if (!currentCharacter.characterConfig.isMoving &&
            (currentCharacter.x !== tile.x || currentCharacter.y !== tile.y)) {
            var isObstacleInTheWay = false;
            _.each(enemies.characters.getChildren(),
                function(enemy) {
                    if (enemy.x === tile.x && enemy.y === tile.y) {
                        isObstacleInTheWay = true;
                        //return;
                    }
                });
            _.each(game.activeMap.objects.getChildren(),
                function(object) {
                    if (object.x === tile.x && object.y === tile.y) {
                        isObstacleInTheWay = true;
                        //return;
                    }
                });
            if (!isObstacleInTheWay) {
                var pathWay = Pathfinder.findWay(currentCharacter.x / 50, currentCharacter.y / 50, tile.x / 50, tile.y / 50, game.activeMap.levelMap);
                currentCharacter.characterConfig.path = pathWay || [];
                if (pathWay.length > 0) {
                    currentCharacter.characterConfig.path.shift();
                    if (currentCharacter.characterConfig.path.length <= currentCharacter.characterConfig.movement - currentCharacter.characterConfig.movementSpent) {
                        currentCharacter.characterConfig.movementSpent++;
                        currentCharacter.characterConfig.isMoving = true;
                        currentCharacter.characterConfig.posX = currentCharacter.characterConfig.path[0][0] * 50;
                        currentCharacter.characterConfig.posY = currentCharacter.characterConfig.path[0][1] * 50;
                        currentCharacter.characterConfig.path.shift();
                        if (tile.x > currentCharacter.x && tile.y > currentCharacter.y) {
                            currentCharacter.setVelocity(this.characterConfig.velocity, this.characterConfig.velocity);
                        } else if (tile.x < currentCharacter.x && tile.y < currentCharacter.y) {
                            currentCharacter.setVelocity(-1 * this.characterConfig.velocity, -1 * this.characterConfig.velocity);
                        } else if (tile.x < currentCharacter.x && tile.y > currentCharacter.y) {
                            currentCharacter.setVelocity(-1 * this.characterConfig.velocity, this.characterConfig.velocity);
                        } else if (tile.x > currentCharacter.x && tile.y < currentCharacter.y) {
                            currentCharacter.setVelocity(this.characterConfig.velocity, -1 * this.characterConfig.velocity);
                        } else if (tile.x > currentCharacter.x) {
                            currentCharacter.setVelocityX(this.characterConfig.velocity);
                        } else if (tile.x < currentCharacter.x) {
                            currentCharacter.setVelocityX(-1 * this.characterConfig.velocity);
                        } else if (tile.y > currentCharacter.y) {
                            currentCharacter.setVelocityY(this.characterConfig.velocity);
                        } else if (tile.y < currentCharacter.y) {
                            currentCharacter.setVelocityY(-1 * this.characterConfig.velocity);
                        }
                        game.activeMap.hideMovementGrid();
                        game.events.emit('activeCharacterActed', currentCharacter);
                    } else if (currentCharacter.characterConfig.path.length > currentCharacter.characterConfig.movement - currentCharacter.characterConfig.movementSpent) {
                        currentCharacter.characterConfig.path = [];
                    }
                }
            }
        }
    };

    this.stopActiveCharacter = () => {
        var currentCharacter = game.activeCharacter;
        //reduce speed on X
        if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) <= 100 &&
            Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) > 30) {
            currentCharacter.x > currentCharacter.characterConfig.posX
                ? currentCharacter.setVelocityX(-150)
                : currentCharacter.setVelocityX(150);
        } else if (Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) <= 30 &&
            Math.abs(currentCharacter.x - currentCharacter.characterConfig.posX) > 5) {
            currentCharacter.x > currentCharacter.characterConfig.posX
                ? currentCharacter.setVelocityX(-90)
                : currentCharacter.setVelocityX(90);
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
                ? currentCharacter.setVelocityY(-90)
                : currentCharacter.setVelocityY(90);
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
            !game.activeMap.isMovementGridShown) {
            if (currentCharacter.characterConfig.path.length === 0) {
                game.activeMap.showMovementGrid(currentCharacter);
            }
            currentCharacter.characterConfig.isMoving = false;
        }
    };

    this.keepMovingActiveCharacter = () => {
        var currentCharacter = game.activeCharacter;
        if (!currentCharacter.characterConfig.isMoving && currentCharacter.characterConfig.path.length > 0) {
            currentCharacter.characterConfig.isMoving = true;
            currentCharacter.characterConfig.movementSpent++;
            currentCharacter.characterConfig.posX = currentCharacter.characterConfig.path[0][0] * 50;
            currentCharacter.characterConfig.posY = currentCharacter.characterConfig.path[0][1] * 50;
            currentCharacter.characterConfig.path.shift();
            var velocity = 0;
            if (currentCharacter.characterConfig.posX > currentCharacter.x) {
                velocity = this.characterConfig.velocity;
            } else if (currentCharacter.characterConfig.posX < currentCharacter.x) {
                velocity = -1 * this.characterConfig.velocity;
            }
            currentCharacter.setVelocityX(velocity);
            velocity = 0;
            if (currentCharacter.characterConfig.posY > currentCharacter.y) {
                velocity = this.characterConfig.velocity;
            } else if (currentCharacter.characterConfig.posY < currentCharacter.y) {
                velocity = -1 * this.characterConfig.velocity;
            }
            currentCharacter.setVelocityY(velocity);
            game.events.emit('activeCharacterActed', currentCharacter);
        }
    };
};