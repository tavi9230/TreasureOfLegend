var PF = require('pathfinding');
import {EnumHelper} from 'Aniwars/Helpers/enumHelper';

var _cloneMap = (levelMap) => {
    var map = [];
    for (let i = 0; i < levelMap.length; i++) {
        map[i] = [];
        for (let j = 0; j < levelMap[i].length; j++) {
            map[i][j] = levelMap[i][j] > 0 ? 1 : levelMap[i][j] < 0 ? 1 : 0;
        }
    }
    return map;
};

export const Pathfinder = {
    findWay: (startX, startY, endX, endY, levelMap) => {
        var map = _cloneMap(levelMap);
        var grid = new PF.Grid(map);
        var finder = new PF.BreadthFirstFinder({
            allowDiagonal: true,
            bidirectional: true,
            dontCrossCorners: true
        });
        return finder.findPath(startX, startY, endX, endY, grid);
    },
    getPathFromAToB: (source, destination, levelMap) => {
        var map = _cloneMap(levelMap),
            posX = destination.x,
            posY = destination.y,
            objConfig = destination.objectConfig;
        if (objConfig && objConfig.isActivated) {
            if (objConfig.id === EnumHelper.idEnum.door.type.right || objConfig.id === EnumHelper.idEnum.door.type.left) {
                posY = destination.y + 50;
            } else if (objConfig.id === EnumHelper.idEnum.door.type.down || objConfig.id === EnumHelper.idEnum.door.type.up) {
                posX = destination.x + 50;
            }
        }
        // Make object a moveable tile to see if we can get to it
        map[destination.y / 50][posX / 50] = 0;
        var paths = [],
            auxPosY,
            auxPosX;
        paths.push(Pathfinder.findWay(source.x / 50, source.y / 50, posX / 50, posY / 50, map));
        if (destination.height > 50 && destination.width > 50 && destination.height % 50 === 0 && destination.width % 50 === 0) {
            auxPosY = posY;
            auxPosX = posX;

            posY += destination.height / 2;
            if (posY <= map.length * 50) {
                map[posY / 50][posX / 50] = 0;
                paths.push(Pathfinder.findWay(source.x / 50, source.y / 50, posX / 50, posY / 50, map));
                posY = auxPosY;
            }

            posX += destination.width / 2;
            if (posX <= map[0].length * 50) {
                map[posY / 50][posX / 50] = 0;
                paths.push(Pathfinder.findWay(source.x / 50, source.y / 50, posX / 50, posY / 50, map));
                posX = auxPosX;
            }

            posX += destination.width / 2;
            posY += destination.height / 2;
            if (posX <= map[0].length * 50 && posY <= map.length * 50){
                map[posY / 50][posX / 50] = 0;
                paths.push(Pathfinder.findWay(source.x / 50, source.y / 50, posX / 50, posY / 50, map));
                posX = auxPosX;
                posY = auxPosY;
            }
        } else if (destination.height > 50 && destination.height % 50 === 0) {
            auxPosY = posY;
            posY += destination.height / 2;
            if (posY <= map.length * 50) {
                map[posY / 50][posX / 50] = 0;
                paths.push(Pathfinder.findWay(source.x / 50, source.y / 50, posX / 50, posY / 50, map));
            }
            posY = auxPosY;
            posY -= destination.height / 2;
            if (posY >= 0) {
                map[posY / 50][posX / 50] = 0;
                paths.push(Pathfinder.findWay(source.x / 50, source.y / 50, posX / 50, posY / 50, map));
            }
        } else if (destination.width > 50 && destination.width % 50 === 0) {
            auxPosX = posX;
            posX += destination.width / 2;
            if (posX <= map[0].length * 50) {
                map[posY / 50][posX / 50] = 0;
                paths.push(Pathfinder.findWay(source.x / 50, source.y / 50, posX / 50, posY / 50, map));
            }
            posX = auxPosX;
            posX -= destination.width / 2;
            if (posX >= 0) {
                map[posY / 50][posX / 50] = 0;
                paths.push(Pathfinder.findWay(source.x / 50, source.y / 50, posX / 50, posY / 50, map));
            }
        }
        return paths.sort(function(a, b) {
            if (a.length < b.length) {
                return -1;
            } else if (a.length > b.length) {
                return 1;
            } else {
                return 0;
            }
        }).filter(function(val) {
            return val.length > 0;
        })[0];
    }
};