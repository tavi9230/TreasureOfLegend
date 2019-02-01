import {Pathfinder} from 'Aniwars/Helpers/pathfinder';
import {MapConfig} from 'Aniwars/Configurations/mapConfig';
import {EnumHelper} from 'Aniwars/Helpers/enumHelper';

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
        isActivated: false,
        belongsTo: null
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
    this.deadCharacters = game.add.group({
        hitArea: hitArea,
        hitAreaCallback: hitAreaCallback
    });
    this.unreachableTiles = game.add.group();

    this.isMovementGridShown = false;

    this.generateMap = () => {
        for (let i = 0, y = 0; i < this.levelMap.length; i++, y += 50) {
            for (let j = 0, x = 0; j < this.levelMap[i].length; j++, x += 50) {
                if (Math.floor(this.levelMap[i][j]) === Math.floor(EnumHelper.idEnum.tile.id)) {
                    this._addTile(x, y);
                } else if (Math.floor(this.levelMap[i][j]) === Math.floor(EnumHelper.idEnum.wall.id)) {
                    this._addWall(x, y, this.levelMap[i][j]);
                } else if (Math.floor(this.levelMap[i][j]) === Math.floor(EnumHelper.idEnum.door.id)) {
                    this._addTile(x, y);
                    this._addDoor(x, y, i, j, this.levelMap[i][j]);
                } else if (Math.floor(this.levelMap[i][j]) === Math.floor(EnumHelper.idEnum.well.id)) {
                    this._addTile(x, y, true);
                    this._addTile(x + 50, y, true);
                    this._addTile(x, y + 50, true);
                    this._addTile(x + 50, y + 50, true);
                    this._addWell(x, y, i, j, this.levelMap[i][j]);
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
        var moveableTiles = this.tiles.getChildren().filter(function(tile) {
            return (character.characterConfig.movement.max - character.characterConfig.movement.spent) * 50 >=
                Math.abs(tile.x - character.characterConfig.posX) &&
                (character.characterConfig.movement.max - character.characterConfig.movement.spent) * 50 >=
                Math.abs(tile.y - character.characterConfig.posY);
        });
        _.each(moveableTiles, (tile) => {
            var auxMap = this.addEnemiesToMap(this.game.enemies);
            var pathWay = Pathfinder.findWay(character.x / 50, character.y / 50, tile.x / 50, tile.y / 50, auxMap);
            if (pathWay.length > 0) {
                pathWay.shift();
                if (pathWay.length <= (character.characterConfig.movement.max - character.characterConfig.movement.spent)
                    && auxMap[tile.y / 50][tile.x / 50] === EnumHelper.idEnum.tile.id
                    && (character.x !== tile.x || character.y !== tile.y)) {
                    // TODO: Don't highlight if another character or enemy is on the tile
                    tile.setTint(0x990899);
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
        if (object.objectConfig.id === EnumHelper.idEnum.door.type.right || object.objectConfig.id === EnumHelper.idEnum.door.type.left) {
            objY = object.objectConfig.isActivated ? object.y + 50 : object.y;
        } else if (object.objectConfig.id === EnumHelper.idEnum.door.type.down || object.objectConfig.id === EnumHelper.idEnum.door.type.up) {
            objX = object.objectConfig.isActivated ? object.x + 50 : object.x;
        }
        return {
            x: objX,
            y: objY
        };
    };

    this.highlightCharacter = (character) => {
        var tile = _.find(this.tiles.getChildren(), function(tile) {
            return tile.x === character.x && tile.y === character.y;
        });
        if (tile) {
            tile.setTint(0xcccc00);
        }
    };

    this.dehighlightCharacter = (character) => {
        var tile = _.find(this.tiles.getChildren(), function(tile) {
            return tile.x === character.x && tile.y === character.y;
        });
        if (tile) {
            tile.setTint(0xFFFFFF);
        }
    };

    // Private ----------------------------------------------------------------------
    this._addTile = (x, y, isUnreachable) => {
        var tileNumber = Math.floor(Math.random() * 5) + 1;
        var obj = game.add.sprite(x, y, 'tile' + tileNumber).setOrigin(0, 0);
        obj.objectConfig = lodash.cloneDeep(this.objConfig);
        obj.objectConfig.description = 'Stone tile';
        obj.objectConfig.id = EnumHelper.idEnum.tile.id;
        obj.height = 50;
        obj.width = 50;
        if (!isUnreachable) {
            this.tiles.add(obj);
        } else {
            this.unreachableTiles.add(obj);
        }
    };

    this._addWall = (x, y, wallId) => {
        var obj;
        if (wallId === EnumHelper.idEnum.wall.type.top) {
            obj = game.add.sprite(x, y, 'wallTest').setOrigin(0, 0);
        } else if (wallId === EnumHelper.idEnum.wall.type.side) {
            obj = game.add.sprite(x, y, 'wallVerticalTest').setOrigin(0, 0);
        } else if (wallId === EnumHelper.idEnum.wall.type.bottomLeft) {
            obj = game.add.sprite(x, y, 'wallBottomLeftTest').setOrigin(0, 0);
        } else if (wallId === EnumHelper.idEnum.wall.type.bottomRight) {
            obj = game.add.sprite(x, y, 'wallBottomRightTest').setOrigin(0, 0);
        } else if (wallId === EnumHelper.idEnum.wall.type.topLeft) {
            obj = game.add.sprite(x, y, 'wallTopLeftTest').setOrigin(0, 0);
        } else if (wallId === EnumHelper.idEnum.wall.type.topRight) {
            obj = game.add.sprite(x, y, 'wallTopRightTest').setOrigin(0, 0);
        }
        obj.objectConfig = lodash.cloneDeep(this.objConfig);
        obj.displayWidth = 50;
        obj.displayHeight = 50;
        obj.width = 50;
        obj.height = 50;
        if (wallId === EnumHelper.idEnum.wall.type.top
            || wallId === EnumHelper.idEnum.wall.type.bottomLeft
            || wallId === EnumHelper.idEnum.wall.type.bottomRight) {
            obj.displayWidth = 50;
            obj.displayHeight = 100;
            obj.width = 50;
            obj.height = 100;
        }
        obj.objectConfig.description = 'Stone wall';
        obj.objectConfig.id = EnumHelper.idEnum.wall.id;
        this.objects.add(obj);
    };

    this._addDoor = (x, y, i, j, doorId) => {
        var obj;
         if (doorId === EnumHelper.idEnum.door.type.right || doorId === EnumHelper.idEnum.door.type.left) {
             obj = game.add.sprite(x, y, 'castleDoorVertical').setOrigin(0, 0);
             obj.displayWidth = 50;
             obj.displayHeight = 50;
             obj.width = 50;
             obj.height = 50;
        } else if (doorId === EnumHelper.idEnum.door.type.up || doorId === EnumHelper.idEnum.door.type.down) {
            obj = game.add.sprite(x, y, 'castleDoor').setOrigin(0, 0.25);
            obj.displayWidth = 50;
            obj.displayHeight = 75;
            obj.width = 50;
            obj.height = 75;
        }
        obj.objectConfig = lodash.cloneDeep(this.objConfig);
        obj.objectConfig.description = 'Wooden door';
        obj.objectConfig.id = doorId;
        obj.objectConfig.isInteractible = true;
        this.objects.add(obj);
    };

    this._addWell = (x, y, i, j, wellId) => {
        var obj;
        if (wellId === EnumHelper.idEnum.well.type.health) {
            obj = game.add.sprite(x, y, 'healthWell').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.description = 'Restore Health';
        } else if (wellId === EnumHelper.idEnum.well.type.mana) {
            obj = game.add.sprite(x, y, 'manaWell').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.description = 'Restore Mana';
        } else if (wellId === EnumHelper.idEnum.well.type.movement) {
            obj = game.add.sprite(x, y, 'movementWell').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.description = 'Restore Movement';
        } else if (wellId === EnumHelper.idEnum.well.type.energy) {
            obj = game.add.sprite(x, y, 'energyWell').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.description = 'Restore Energy';
        }
        obj.displayWidth = 100;
        obj.displayHeight = 100;
        obj.width = 100;
        obj.height = 100;
        obj.objectConfig.id = wellId;
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
        if (pathWay) {
            pathWay.shift();
            pathWay.pop();
        }
        return pathWay || [];
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
                if (pathWay.length > 0 && pathWay.length <= (currentCharacter.characterConfig.movement.max - currentCharacter.characterConfig.movement.spent)) {
                    var highlightedPath = [];
                    _.each(pathWay, function(path) {
                        var filteredPathWay = self.tiles.getChildren().filter(function(tile) {
                            return tile.x === path[0] * 50 &&
                                tile.y === path[1] * 50 &&
                                self.levelMap[tile.y / 50][tile.x / 50] === EnumHelper.idEnum.tile.id;
                        });
                        if (filteredPathWay.length > 0) {
                            _.each(filteredPathWay, function(tile) {
                                highlightedPath.push(tile);
                            });
                        }
                    });
                    _.each(highlightedPath, function(tile) {
                        tile.setTint(0x4693eb);
                    });
                }
            }
        }
    };
};