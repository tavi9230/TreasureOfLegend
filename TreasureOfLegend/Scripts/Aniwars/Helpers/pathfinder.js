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
        map[destination.y / 50][posX / 50] = 0;
        return Pathfinder.findWay(source.x / 50, source.y / 50, posX / 50, posY / 50, map);
    }
};