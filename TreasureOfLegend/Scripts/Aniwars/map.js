﻿import {Pathfinder} from 'Aniwars/pathfinder';
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
        isActivated: false,
        isAngled: false
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
                var tileNumber = Math.floor(Math.random() * 5) + 1;
                var obj;
                if (this.levelMap[i][j] === EnumHelper.idEnum.tile) {
                    obj = game.add.sprite(x, y, 'tile' + tileNumber).setOrigin(0, 0);
                    obj.objectConfig = Object.assign({}, this.objConfig);
                    obj.objectConfig.description = 'Stone tile';
                    obj.objectConfig.id = EnumHelper.idEnum.tile;
                    this.tiles.add(obj);
                } else if (this.levelMap[i][j] === EnumHelper.idEnum.wall) {
                    obj = game.add.sprite(x, y, 'wallTile').setOrigin(0, 0);
                    obj.objectConfig = Object.assign({}, this.objConfig);
                    obj.objectConfig.description = 'Stone wall';
                    obj.objectConfig.id = EnumHelper.idEnum.wall;
                    this.objects.add(obj);
                } else if (this.levelMap[i][j] === EnumHelper.idEnum.door) {
                    obj = game.add.sprite(x, y, 'tile' + tileNumber).setOrigin(0, 0);
                    obj.objectConfig = Object.assign({}, this.objConfig);
                    obj.objectConfig.description = 'Stone tile';
                    obj.objectConfig.id = EnumHelper.idEnum.tile;
                    this.tiles.add(obj);
                    if (j - 1 > 0) {
                        //if door is horizontal
                        if (this.levelMap[i][j - 1] === EnumHelper.idEnum.wall) {
                            obj = game.add.sprite(x + 50, y, 'doorTile').setOrigin(0, 0);
                            obj.objectConfig = Object.assign({}, this.objConfig);
                            obj.objectConfig.isAngled = true;
                            obj.setAngle(90);
                        } else {
                            obj = game.add.sprite(x, y, 'doorTile').setOrigin(0, 0);
                            obj.objectConfig = Object.assign({}, this.objConfig);
                        }
                    } else {
                        obj = game.add.sprite(x, y, 'doorTile').setOrigin(0, 0);
                        obj.objectConfig = Object.assign({}, this.objConfig);
                    }
                    obj.objectConfig.description = 'Wooden door';
                    obj.objectConfig.id = EnumHelper.idEnum.door;
                    obj.objectConfig.isInteractible = true;
                    this.objects.add(obj);
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
        _.each(this.tiles.getChildren(),
            (tile) => {
                if ((character.characterConfig.movement - character.characterConfig.movementSpent) * 50 >= Math.abs(tile.x - character.characterConfig.posX) &&
                    character.characterConfig.movement * 50 >= Math.abs(tile.y - character.characterConfig.posY)) {
                    var pathWay = Pathfinder.findWay(character.x / 50, character.y / 50, tile.x / 50, tile.y / 50, this.levelMap);
                    if (pathWay.length > 0) {
                        pathWay.shift();
                        if (pathWay.length <= (character.characterConfig.movement - character.characterConfig.movementSpent) && this.levelMap[tile.y / 50][tile.x / 50] === EnumHelper.idEnum.tile) {
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
                                if (tile.x === pathWay[i][0] * 50 && tile.y === pathWay[i][1] * 50 && self.levelMap[tile.y / 50][tile.x / 50] === EnumHelper.idEnum.tile) {
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
    // Private ----------------------------------------------------------------------
};