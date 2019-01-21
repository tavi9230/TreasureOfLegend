var PF = require('pathfinding');
import {EnumHelper} from 'Aniwars/enumHelper';

var _cloneMap = (levelMap) => {
    var map = [];
    for (let i = 0; i < levelMap.length; i++) {
        map[i] = [];
        for (let j = 0; j < levelMap[i].length; j++) {
            map[i][j] = levelMap[i][j] > 0 ? 1 : 0;
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
        var map = _cloneMap(levelMap);
        var posX = destination.x;
        var posY = destination.y;
        if (destination.objectConfig && destination.objectConfig.isActivated) {
            if (destination.objectConfig.id === EnumHelper.idEnum.door.right || destination.objectConfig.id === EnumHelper.idEnum.door.left) {
                posY = destination.y + 50;
            } else if (destination.objectConfig.id === EnumHelper.idEnum.door.down || destination.objectConfig.id === EnumHelper.idEnum.door.up) {
                posX = destination.x + 50;
            }
        }
        map[destination.y / 50][posX / 50] = 0;
        return Pathfinder.findWay(source.x / 50, source.y / 50, posX / 50, posY / 50, map);
    }
};