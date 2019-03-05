import { Pathfinder } from 'TreasureOfLegend/Helpers/pathfinder';
import { EnumHelper } from 'TreasureOfLegend/Helpers/enumHelper';
import { CoordHelper } from 'TreasureOfLegend/Helpers/coordHelper';

export const BattleMap = function (game, map) {
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
    this.tileLayer = this.copyMap(map.tiles, []);
    this.objectLayer = this.copyMap(map.objects, []);
    this.defaultMap = this.copyMap(map.tiles, []);
    this.defaultMap = this.copyMap(map.objects, this.defaultMap);
    this.previousMap = this.copyMap(this.defaultMap, []);
    this.levelMap = this.copyMap(this.defaultMap, []);
    this.objConfig = {
        isInteractible: false,
        id: -1,
        description: '',
        previousDescription: '',
        isActivated: false,
        belongsTo: null,
        turnActivated: 0,
        turnsToReset: 0,
        image: '',
        callback: null,
        sound: ''
    };
    var hitArea = new Phaser.Geom.Rectangle(0, 0, 100, 100);
    var hitAreaCallback = Phaser.Geom.Rectangle.Contains;
    this.tiles = this.game.add.group({
        hitArea: hitArea,
        hitAreaCallback: hitAreaCallback
    });
    this.tileHitBox = this.game.add.group();
    this.objects = this.game.add.group({
        hitArea: hitArea,
        hitAreaCallback: hitAreaCallback
    });
    this.deadCharacters = this.game.add.group({
        hitArea: hitArea,
        hitAreaCallback: hitAreaCallback
    });
    this.unreachableTiles = this.game.add.group();

    this.isMovementGridShown = false;

    this.generateMap = () => {
        for (let i = 0, y = 0; i < this.tileLayer.length; i++, y += 50) {
            for (let j = 0, x = 0; j < this.tileLayer[i].length; j++, x += 50) {
                this._addTile(x, y);
            }
        }
        for (let i = 0, y = 0; i < this.objectLayer.length; i++, y += 50) {
            for (let j = 0, x = 0; j < this.objectLayer[i].length; j++, x += 50) {
                if (Math.floor(this.levelMap[i][j]) === Math.floor(EnumHelper.idEnum.wall.id)) {
                    this._addWall(x, y, this.levelMap[i][j]);
                } else if (Math.floor(this.levelMap[i][j]) === Math.floor(EnumHelper.idEnum.door.id)) {
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
        this.game.input.setHitArea(this.tiles.getChildren());
        this.game.input.setHitArea(this.objects.getChildren());
    };

    this.showMovementGrid = () => {
        this.hideMovementGrid();
        var character = this.game.activeCharacter,
            self = this;
        this.isMovementGridShown = true;
        var moveableTiles = this.tiles.getChildren().filter(function (tile) {
            var carthesianTile = CoordHelper.IsometricToCartesian(tile.x, tile.y),
                carthesianCharacter = CoordHelper.IsometricToCartesian(character.characterConfig.posX, character.characterConfig.posY);
            return (character.characterConfig.movement.max - character.characterConfig.movement.spent) * 50 >=
                Math.abs(carthesianTile.x - carthesianCharacter.x) &&
                (character.characterConfig.movement.max - character.characterConfig.movement.spent) * 50 >=
                Math.abs(carthesianTile.y - carthesianCharacter.y);
        });
        _.each(moveableTiles, (tile) => {
            var auxMap = this.addEnemiesToMap(this.game.enemies),
                carthesianTile = CoordHelper.IsometricToCartesian(tile.x, tile.y),
                carthesianCharacter = CoordHelper.IsometricToCartesian(character.x, character.y),
                pathWay = Pathfinder.findWay(carthesianCharacter.x / 50, carthesianCharacter.y / 50, carthesianTile.x / 50, carthesianTile.y / 50, auxMap);
            if (pathWay.length > 0) {
                pathWay.shift();
                if (pathWay.length <= (character.characterConfig.movement.max - character.characterConfig.movement.spent)
                    && auxMap[carthesianTile.y / 50][carthesianTile.x / 50] === EnumHelper.idEnum.tile.id
                    && (carthesianCharacter.x !== carthesianTile.x || carthesianCharacter.y !== carthesianTile.y) && !self._isPartyMemberOnTile(tile)) {
                    // TODO: Don't highlight if another character or enemy is on the tile
                    tile.setTint(0x25ba11);
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
            tile.clearTint();
        });
    };

    this.addEnemiesToMap = (enemies) => {
        var auxMap = [];
        auxMap = this.game.activeMap.copyMap(this.game.activeMap.levelMap, auxMap);
        if (this.game.enemies) {
            _.each(enemies.characters.getChildren(), function (enemy) {
                var carthesianEnemy = CoordHelper.IsometricToCartesian(enemy.x, enemy.y);
                auxMap[carthesianEnemy.y / 50][carthesianEnemy.x * 2 / 50] = 1;
            });
        }
        return auxMap;
    };

    this._isPartyMemberOnTile = (tile) => {
        var isFound = false;
        _.each(this.game.characters.characters.getChildren(), function (character) {
            var carthesianTile = CoordHelper.IsometricToCartesian(tile.x, tile.y),
                carthesianCharacter = CoordHelper.IsometricToCartesian(character.x, character.y);
            if (carthesianCharacter.x === carthesianTile.x && carthesianCharacter.y === carthesianTile.y) {
                isFound = true;
            }
        });
        return isFound;
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
        var tile = _.find(this.tiles.getChildren(), function (tile) {
            return tile.x === character.x && tile.y === character.y;
        });
        if (tile) {
            tile.setTint(0x990899);
        }
    };

    this.dehighlightCharacter = (character) => {
        var tile = _.find(this.tiles.getChildren(), function (tile) {
            return tile.x === character.x && tile.y === character.y;
        });
        if (tile) {
            tile.clearTint();
        }
    };

    this.createReactivatingObject = (config) => {
        var objectToCreate = config.object,
            obj = this.game.add.sprite(objectToCreate.x, objectToCreate.y, config.image).setOrigin(0, 0),
            self = this;
        obj.objectConfig = lodash.cloneDeep(this.objConfig);
        obj.objectConfig.description = config.description;
        obj.objectConfig.previousDescription = objectToCreate.objectConfig.description;
        obj.objectConfig.image = objectToCreate.objectConfig.image;
        obj.displayWidth = config.displayWidth || 50;
        obj.displayHeight = config.displayHeight || 50;
        obj.width = config.width || 50;
        obj.height = config.height || 50;
        obj.objectConfig.id = objectToCreate.objectConfig.id;
        obj.objectConfig.isInteractible = config.isInteractible;
        if (config.turnsToReset !== 0) {
            obj.objectConfig.turnActivated = this.game.hudScene.getTurn();
            obj.objectConfig.turnsToReset = Math.floor(Math.random() * config.turnsToReset) + 1;
            var previousObject = obj;
            obj.objectConfig.callback = function () {
                var currentTurn = self.game.hudScene.getTurn();
                if (currentTurn - this.turnActivated >= this.turnsToReset) {
                    self.createReactivatingObject({
                        object: previousObject,
                        image: this.image,
                        description: this.previousDescription,
                        displayWidth: 100,
                        displayHeight: 100,
                        width: 100,
                        height: 100,
                        isInteractible: true,
                        turnsToReset: 0
                    });
                }
            };
        }
        this.game.input.setHitArea([obj]);
        this.game.sceneManager.bindObjectEvents(obj);
        this.objects.add(obj);
        objectToCreate.destroy();
    };

    // Private ----------------------------------------------------------------------
    this._addTile = (x, y, isUnreachable) => {
        var tileNumber = Math.floor(Math.random() * 2) + 1,
            isometricPoint = CoordHelper.CartesianToIsometric(x, y);
        var obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneTile' + tileNumber).setOrigin(0, 0);
        obj.objectConfig = lodash.cloneDeep(this.objConfig);
        obj.objectConfig.description = 'Tile';
        obj.objectConfig.sound = 'walk_stone';
        obj.objectConfig.id = EnumHelper.idEnum.tile.id;
        obj.objectConfig.image = 'stoneTile' + tileNumber;
        //obj.height = 100;
        //obj.width = 100;
        obj.displayWidth = 100;
        obj.displayHeight = obj.displayWidth * obj.height / obj.width;//58;
        if (!isUnreachable) {
            this.tiles.add(obj);
        } else {
            this.unreachableTiles.add(obj);
        }
    };

    this._addWall = (x, y, wallId) => {
        var obj,
            isometricPoint = CoordHelper.CartesianToIsometric(x, y);
        //if (wallId !== EnumHelper.idEnum.wall.type.stoneWallE &&
        //    wallId !== EnumHelper.idEnum.wall.type.stoneWallS &&
        //    wallId !== EnumHelper.idEnum.wall.type.stoneWallCornerS &&
        //    wallId !== EnumHelper.idEnum.wall.type.stoneWallCornerE &&
        //    wallId !== EnumHelper.idEnum.wall.type.stoneWallCornerW) {
        //    this._addTile(x, y);
        //}
        if (wallId === EnumHelper.idEnum.wall.type.stoneWallE) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallE').setOrigin(0, 0);//.setOrigin(0, 0.25);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallE';
        } else if (wallId === EnumHelper.idEnum.wall.type.stoneWallN) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallN').setOrigin(0, 0);//.setOrigin(0, 0.25);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallN';
        } else if (wallId === EnumHelper.idEnum.wall.type.stoneWallS) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallS').setOrigin(0, 0);//.setOrigin(0, 0.25);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallS';
        } else if (wallId === EnumHelper.idEnum.wall.type.stoneWallW) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallW').setOrigin(0, 0);//.setOrigin(0, 0.25);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallW';
        } else if (wallId === EnumHelper.idEnum.wall.type.stoneWallCornerE) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallCornerE').setOrigin(0, 0);//.setOrigin(0, 0.36);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallCornerE';
        } else if (wallId === EnumHelper.idEnum.wall.type.stoneWallCornerN) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallCornerN').setOrigin(0, 0);//.setOrigin(0, 0.25);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallCornerN';
        } else if (wallId === EnumHelper.idEnum.wall.type.stoneWallCornerS) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallCornerS').setOrigin(0, 0);//.setOrigin(0, 0.25);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallCornerS';
        } else if (wallId === EnumHelper.idEnum.wall.type.stoneWallCornerW) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallCornerW').setOrigin(0, 0);//.setOrigin(0, 0.36);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallCornerW';
        }
        obj.displayWidth = 100;
        obj.displayHeight = obj.displayWidth * obj.height / obj.width;
        //obj.width = 100;
        //obj.height = 200;
        obj.objectConfig.description = 'Wall';
        obj.objectConfig.id = EnumHelper.idEnum.wall.id;
        obj.setDepth(1);
        this.objects.add(obj);
    };

    this._addDoor = (x, y, i, j, doorId) => {
        var obj,
            isometricPoint = CoordHelper.CartesianToIsometric(x, y);
        this._addTile(x, y);
        if (doorId === EnumHelper.idEnum.door.type.stoneWallDoorClosedE) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallDoorClosedE').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallDoorClosedE';
        } else if (doorId === EnumHelper.idEnum.door.type.stoneWallDoorClosedN) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallDoorClosedN').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallDoorClosedN';
        } else if (doorId === EnumHelper.idEnum.door.type.stoneWallDoorClosedS) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallDoorClosedS').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallDoorClosedS';
        } else if (doorId === EnumHelper.idEnum.door.type.stoneWallDoorClosedW) {
            this._addTile(x, y);
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallDoorClosedW').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallDoorClosedW';
        } else if (doorId === EnumHelper.idEnum.door.type.stoneWallDoorOpenE) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallDoorOpenE').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallDoorOpenE';
        } else if (doorId === EnumHelper.idEnum.door.type.stoneWallDoorOpenN) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallDoorOpenN').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallDoorOpenN';
        } else if (doorId === EnumHelper.idEnum.door.type.stoneWallDoorOpenS) {
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallDoorOpenS').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallDoorOpenS';
        } else if (doorId === EnumHelper.idEnum.door.type.stoneWallDoorOpenW) {
            this._addTile(x, y);
            obj = this.game.add.sprite(isometricPoint.x, isometricPoint.y, 'stoneWallDoorOpenW').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'stoneWallDoorOpenW';
        }
        obj.displayWidth = 100;
        obj.displayHeight = 200;
        obj.width = 100;
        obj.height = 200;
        obj.objectConfig.description = 'Door';
        obj.objectConfig.id = doorId;
        obj.objectConfig.isInteractible = true;
        obj.objectConfig.sound = 'open_door';
        obj.setDepth(1);
        this.objects.add(obj);
    };

    this._addWell = (x, y, i, j, wellId) => {
        var obj;
        if (wellId === EnumHelper.idEnum.well.type.health) {
            obj = this.game.add.sprite(x, y, 'healthWell').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.description = 'Restore Health';
            obj.objectConfig.image = 'healthWell';
        } else if (wellId === EnumHelper.idEnum.well.type.mana) {
            obj = this.game.add.sprite(x, y, 'manaWell').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.description = 'Restore Mana';
            obj.objectConfig.image = 'manaWell';
        } else if (wellId === EnumHelper.idEnum.well.type.movement) {
            obj = this.game.add.sprite(x, y, 'movementWell').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.description = 'Restore Movement';
            obj.objectConfig.image = 'movementWell';
        } else if (wellId === EnumHelper.idEnum.well.type.energy) {
            obj = this.game.add.sprite(x, y, 'energyWell').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.description = 'Restore Energy';
            obj.objectConfig.image = 'energyWell';
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
        var auxMap = this.addEnemiesToMap(this.game.enemies),
            isometricCharacter = CoordHelper.IsometricToCartesian(character.x, character.y),
            isometricTile = CoordHelper.IsometricToCartesian(tile.x, tile.y);
        var pathWay = Pathfinder.findWay(isometricCharacter.x / 50, isometricCharacter.y / 50, isometricTile.x / 50, isometricTile.y / 50, auxMap);
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
        var currentCharacter = this.game.activeCharacter;
        if (currentCharacter.characterConfig.isPlayerControlled || currentCharacter.characterConfig.isMasterControlled) {
            var obj = {
                isTile: tile ? true : false,
                value: tile ? tile : object
            };
            var self = this;
            // If character is not moving
            if (currentCharacter.characterConfig.path.length === 0 &&
                currentCharacter.x === currentCharacter.characterConfig.posX &&
                currentCharacter.y === currentCharacter.characterConfig.posY &&
                (tile && !this._isPartyMemberOnTile(tile))) {
                this.showMovementGrid();
                var pathWay = obj.isTile
                    ? this._getPathToTile(currentCharacter, obj.value)
                    : this._getPathToObject(currentCharacter, obj.value);
                if (pathWay.length > 0 && pathWay.length <= (currentCharacter.characterConfig.movement.max - currentCharacter.characterConfig.movement.spent)) {
                    var highlightedPath = [];
                    _.each(pathWay, function (path) {
                        var filteredPathWay = self.tiles.getChildren().filter(function (tile) {
                            var cartesianTile = CoordHelper.IsometricToCartesian(tile.x, tile.y);
                            return cartesianTile.x === path[0] * 50 &&
                                cartesianTile.y === path[1] * 50 &&
                                self.levelMap[cartesianTile.y / 50][cartesianTile.x / 50] === EnumHelper.idEnum.tile.id;
                        });
                        if (filteredPathWay.length > 0) {
                            _.each(filteredPathWay, function (tile) {
                                highlightedPath.push(tile);
                            });
                        }
                    });
                    _.each(highlightedPath, function (tile) {
                        tile.setTint(0x167509);
                    });
                }
            }
        }
        if (tile) {
            tile.setTint(0xff0000);
        }
    };
};