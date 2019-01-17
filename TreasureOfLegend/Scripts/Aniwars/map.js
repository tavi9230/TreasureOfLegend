import {Pathfinder} from 'Aniwars/pathfinder';
import {MapConfig} from 'Aniwars/Maps/mapConfig';

export const BattleMap = function (game) {
    this.game = game;
    this.levelMap = MapConfig.level0;
    var hitArea = new Phaser.Geom.Rectangle(0, 0, 50, 50);
    var hitAreaCallback = Phaser.Geom.Rectangle.Contains;
    this.tiles = game.add.group({
        hitArea: hitArea,
        hitAreaCallback: hitAreaCallback
    });
    this.objects = game.add.group({
        hitArea: hitArea,
        hitAreaCallback: hitAreaCallback
    });

    this.isMovementGridShown = false;

    this.generateMap = () => {
        for (let i = 0, y = 0; i < this.levelMap.length; i++, y += 50) {
            for (let j = 0, x = 0; j < this.levelMap[i].length; j++, x += 50) {
                var tileNumber = Math.floor(Math.random() * 5) + 1;
                if (this.levelMap[i][j] === MapConfig.mapEnum.tile) {
                    this.tiles.create(x, y, 'tile' + tileNumber).setOrigin(0, 0);
                } else if (this.levelMap[i][j] === MapConfig.mapEnum.wall) {
                    this.objects.create(x, y, 'wallTile').setOrigin(0, 0);
                } else if (this.levelMap[i][j] === MapConfig.mapEnum.door) {
                    this.tiles.create(x, y, 'tile' + tileNumber).setOrigin(0, 0);
                    this.objects.create(x, y, 'doorTile').setOrigin(0, 0);
                }
            }
        }
        game.input.setHitArea(this.tiles.getChildren());
    };

    this.showMovementGrid = () => {
        var character = game.activeCharacter;
        this.isMovementGridShown = true;
        _.each(this.tiles.getChildren(),
            (tile) => {
                if ((character.characterConfig.movement - character.characterConfig.movementSpent) * 50 >= Math.abs(tile.x - character.characterConfig.posX) &&
                    character.characterConfig.movement * 50 >= Math.abs(tile.y - character.characterConfig.posY)) {
                    var pathWay = Pathfinder.findWay(character.x / 50, character.y / 50, tile.x / 50, tile.y / 50, this.levelMap);
                    if (pathWay.length > 0) {
                        pathWay.shift();
                        if (pathWay.length <= (character.characterConfig.movement - character.characterConfig.movementSpent) && this.levelMap[tile.y / 50][tile.x / 50] === MapConfig.mapEnum.tile) {
                            tile.setTint(0x990899);
                        }
                    }
                }
            });
    };

    this.highlightPathToThis = (tile) => {
        var self = this;
        var currentCharacter = game.activeCharacter;
        if (currentCharacter.characterConfig.path.length === 0 &&
            currentCharacter.x === currentCharacter.characterConfig.posX &&
            currentCharacter.y === currentCharacter.characterConfig.posY) {
            this.showMovementGrid();
            var pathWay = Pathfinder.findWay(currentCharacter.x / 50, currentCharacter.y / 50, tile.x / 50, tile.y / 50, this.levelMap);
            if (pathWay.length > 0) {
                pathWay.shift();
                if (pathWay.length <= (currentCharacter.characterConfig.movement - currentCharacter.characterConfig.movementSpent))
                    _.each(this.tiles.getChildren(),
                        function(tile) {
                            for (let i = 0; i < pathWay.length; i++) {
                                if (tile.x === pathWay[i][0] * 50 && tile.y === pathWay[i][1] * 50 && self.levelMap[tile.y / 50][tile.x / 50] === MapConfig.mapEnum.tile) {
                                    tile.setTint(0x4693eb);
                                }
                            }
                        });
            }
        }
    };

    this.hideMovementGrid = () => {
        this.isMovementGridShown = false;
        _.each(this.tiles.getChildren(),
            (tile) => {
                tile.setTint(0xffffff);
            });
    };
};