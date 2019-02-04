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
        previousDescription: '',
        isActivated: false,
        belongsTo: null,
        turnActivated: 0,
        turnsToReset: 0,
        image: '',
        callback: null
    };
    var hitArea = new Phaser.Geom.Rectangle(0, 0, 50, 50);
    var hitAreaCallback = Phaser.Geom.Rectangle.Contains;
    this.tiles = this.game.add.group({
        hitArea: hitArea,
        hitAreaCallback: hitAreaCallback
    });
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
        this.game.input.setHitArea(this.tiles.getChildren());
        this.game.input.setHitArea(this.objects.getChildren());
    };

    this.showMovementGrid = () => {
        this.hideMovementGrid();
        var character = this.game.activeCharacter;
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
            obj.objectConfig.callback = function() {
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
        var tileNumber = Math.floor(Math.random() * 5) + 1;
        var obj = this.game.add.sprite(x, y, 'tile' + tileNumber).setOrigin(0, 0);
        obj.objectConfig = lodash.cloneDeep(this.objConfig);
        obj.objectConfig.description = 'Stone tile';
        obj.objectConfig.id = EnumHelper.idEnum.tile.id;
        obj.objectConfig.image = 'tile' + tileNumber;
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
            obj = this.game.add.sprite(x, y, 'wallTest').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'wallTest';
        } else if (wallId === EnumHelper.idEnum.wall.type.side) {
            obj = this.game.add.sprite(x, y, 'wallVerticalTest').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'wallVerticalTest';
        } else if (wallId === EnumHelper.idEnum.wall.type.bottomLeft) {
            obj = this.game.add.sprite(x, y, 'wallBottomLeftTest').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'wallBottomLeftTest';
        } else if (wallId === EnumHelper.idEnum.wall.type.bottomRight) {
            obj = this.game.add.sprite(x, y, 'wallBottomRightTest').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'wallBottomRightTest';
        } else if (wallId === EnumHelper.idEnum.wall.type.topLeft) {
            obj = this.game.add.sprite(x, y, 'wallTopLeftTest').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'wallTopLeftTest';
        } else if (wallId === EnumHelper.idEnum.wall.type.topRight) {
            obj = this.game.add.sprite(x, y, 'wallTopRightTest').setOrigin(0, 0);
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'wallTopRightTest';
        }
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
            obj = this.game.add.sprite(x, y, 'castleDoorVertical').setOrigin(0, 0);
            obj.displayWidth = 50;
            obj.displayHeight = 50;
            obj.width = 50;
            obj.height = 50;
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'castleDoorVertical';
        } else if (doorId === EnumHelper.idEnum.door.type.up || doorId === EnumHelper.idEnum.door.type.down) {
            obj = this.game.add.sprite(x, y, 'castleDoor').setOrigin(0, 0.25);
            obj.displayWidth = 50;
            obj.displayHeight = 75;
            obj.width = 50;
            obj.height = 75;
            obj.objectConfig = lodash.cloneDeep(this.objConfig);
            obj.objectConfig.image = 'castleDoor';
        }
        obj.objectConfig.description = 'Wooden door';
        obj.objectConfig.id = doorId;
        obj.objectConfig.isInteractible = true;
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
        var currentCharacter = this.game.activeCharacter;
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