import {Pathfinder} from 'Aniwars/pathfinder';
import {MapConfig} from 'Aniwars/Maps/mapConfig';
import {EnumHelper} from 'Aniwars/enumHelper';

export const BattleMap = function (game) {
    this.game = game;
    this.copyMap = (sourceMap, destinationMap) => {
        for (let i = 0; i < sourceMap.length; i++) {
            if (!destinationMap[i]) {
                destinationMap[i] = [];
            }
            for (let j = 0; j < sourceMap[i].length; j++) {
                destinationMap[i][j] = sourceMap[i][j];
            }
        }
        return destinationMap;
    };
    this.defaultMap = this.copyMap(MapConfig.level0, []);
    this.previousMap = this.copyMap(this.defaultMap, []);
    this.levelMap = this.copyMap(this.defaultMap, []);
    this.objConfig = {
        isInteractible: false,
        id: -1,
        description: '',
        isActivated: false
    };
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
                if (this.levelMap[i][j] === EnumHelper.idEnum.tile) {
                    this._addTile(x, y);
                } else if (this.levelMap[i][j] === EnumHelper.idEnum.wall) {
                    this._addWall(x, y);
                } else if (this.levelMap[i][j] === EnumHelper.idEnum.door.up || this.levelMap[i][j] === EnumHelper.idEnum.door.right ||
                    this.levelMap[i][j] === EnumHelper.idEnum.door.down || this.levelMap[i][j] === EnumHelper.idEnum.door.left) {
                    this._addTile(x, y);
                    this._addDoor(x, y, i, j, this.levelMap[i][j]);
                }
            }
        }
        game.input.setHitArea(this.tiles.getChildren());
        game.input.setHitArea(this.objects.getChildren());
    };

    this.showMovementGrid = () => {
        this.hideMovementGrid();
        var character = game.activeCharacter;
        this.isMovementGridShown = true;
        _.each(this.tiles.getChildren(), (tile) => {
            if ((character.characterConfig.movement.max - character.characterConfig.movement.spent) * 50 >= Math.abs(tile.x - character.characterConfig.posX) &&
                (character.characterConfig.movement.max - character.characterConfig.movement.spent) * 50 >= Math.abs(tile.y - character.characterConfig.posY)) {
                var auxMap = this.addEnemiesToMap(this.game.enemies);
                var pathWay = Pathfinder.findWay(character.x / 50, character.y / 50, tile.x / 50, tile.y / 50, auxMap);
                if (pathWay.length > 0) {
                    pathWay.shift();
                    if (pathWay.length <= (character.characterConfig.movement.max - character.characterConfig.movement.spent)
                        && auxMap[tile.y / 50][tile.x / 50] === EnumHelper.idEnum.tile
                        && (character.x !== tile.x || character.y !== tile.y)) {
                        tile.setTint(0x990899);
                    }
                }
            }
        });
    };

    this.highlightPathToTile = (tile) => {
        this._highlightPath(tile);
    };

    this.highlightPathToObject = (object) => {
        this._highlightPath(null, object);
    };

    this.highlightPathToEnemy = (enemy) => {
        this._highlightPath(null, enemy);
    };

    this.highlightPathToItem = (item) => {
        this._highlightPath(null, item);
    };

    this.hideMovementGrid = () => {
        this.isMovementGridShown = false;
        _.each(this.tiles.getChildren(), (tile) => {
            tile.setTint(0xffffff);
        });
    };

    this.addEnemiesToMap = (enemies) => {
        var auxMap = [];
        auxMap = this.game.activeMap.copyMap(this.game.activeMap.levelMap, auxMap);
        if (this.game.enemies) {
            _.each(enemies.characters.getChildren(), function(enemy) {
                auxMap[enemy.y / 50][enemy.x / 50] = 1;
            });
        }
        return auxMap;
    };

    this.getObjRealCoords = (object) => {
        var objX = object.x;
        var objY = object.y;
        if (object.objectConfig.id === EnumHelper.idEnum.door.right || object.objectConfig.id === EnumHelper.idEnum.door.left) {
            objY = object.objectConfig.isActivated ? object.y + 50 : object.y;
        } else if (object.objectConfig.id === EnumHelper.idEnum.door.down || object.objectConfig.id === EnumHelper.idEnum.door.up) {
            objX = object.objectConfig.isActivated ? object.x + 50 : object.x;
        }
        return {
            x: objX,
            y: objY
        };
    };

    // Private ----------------------------------------------------------------------
    this._addTile = (x, y) => {
        var tileNumber = Math.floor(Math.random() * 5) + 1;
        var obj = game.add.sprite(x, y, 'tile' + tileNumber).setOrigin(0, 0);
        obj.objectConfig = Object.assign({}, this.objConfig);
        obj.objectConfig.description = 'Stone tile';
        obj.objectConfig.id = EnumHelper.idEnum.tile;
        this.tiles.add(obj);
    };

    this._addWall = (x, y) => {
        var obj = game.add.sprite(x, y, 'wallTile').setOrigin(0, 0);
        obj.objectConfig = Object.assign({}, this.objConfig);
        obj.displayWidth = 50;
        obj.displayHeight = 50;
        //obj.width = 50;
        //obj.height = 50;
        obj.objectConfig.description = 'Stone wall';
        obj.objectConfig.id = EnumHelper.idEnum.wall;
        this.objects.add(obj);
    };

    this._addDoor = (x, y, i, j, doorId) => {
        var obj;
        if (doorId === EnumHelper.idEnum.door.up) {
            obj = game.add.sprite(x, y, 'doorUp').setOrigin(0, 0);
        } else if (doorId === EnumHelper.idEnum.door.right) {
            obj = game.add.sprite(x, y, 'doorRight').setOrigin(0, 0);
        } else if (doorId === EnumHelper.idEnum.door.down) {
            obj = game.add.sprite(x, y, 'doorDown').setOrigin(0, 0);
        } else if (doorId === EnumHelper.idEnum.door.left) {
            obj = game.add.sprite(x, y, 'doorLeft').setOrigin(0, 0);
        }
        obj.objectConfig = Object.assign({}, this.objConfig);
        obj.objectConfig.description = 'Wooden door';
        obj.objectConfig.id = doorId;
        obj.objectConfig.isInteractible = true;
        this.objects.add(obj);
    };

    this._getPathToTile = (character, tile) => {
        var auxMap = this.addEnemiesToMap(this.game.enemies);
        var pathWay = Pathfinder.findWay(character.x / 50, character.y / 50, tile.x / 50, tile.y / 50, auxMap);
        if (pathWay.length > 0) {
            pathWay.shift();
        }
        return pathWay;
    };

    this._getPathToObject = (character, object) => {
        var auxMap = this.addEnemiesToMap(this.game.enemies);
        var pathWay = Pathfinder.getPathFromAToB(character, object, auxMap);
        if (pathWay.length > 0) {
            pathWay.shift();
            pathWay.pop();
        }
        return pathWay;
    };

    this._highlightPath = (tile, object) => {
        var currentCharacter = game.activeCharacter;
        if (currentCharacter.characterConfig.isPlayerControlled) {
            var obj = {
                isTile: tile ? true : false,
                value: tile ? tile : object
            };
            var self = this;
            // If character is not moving
            if (currentCharacter.characterConfig.path.length === 0 &&
                currentCharacter.x === currentCharacter.characterConfig.posX &&
                currentCharacter.y === currentCharacter.characterConfig.posY) {
                this.showMovementGrid();
                var pathWay = obj.isTile
                    ? this._getPathToTile(currentCharacter, obj.value)
                    : this._getPathToObject(currentCharacter, obj.value);
                if (pathWay.length > 0 && pathWay.length <= (currentCharacter.characterConfig.movement.max - currentCharacter.characterConfig.movement.spent))
                    _.each(this.tiles.getChildren(), function(tile) {
                        for (let i = 0; i < pathWay.length; i++) {
                            if (tile.x === pathWay[i][0] * 50 &&
                                tile.y === pathWay[i][1] * 50 &&
                                self.levelMap[tile.y / 50][tile.x / 50] === EnumHelper.idEnum.tile) {
                                tile.setTint(0x4693eb);
                            }
                        }
                    });
            }
        }
    };
};