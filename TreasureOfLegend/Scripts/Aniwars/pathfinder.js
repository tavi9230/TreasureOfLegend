var PF = require('pathfinding');

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
        if (destination.objectConfig.isAngled) {
            posX = destination.x - (destination.objectConfig.isActivated ? 25 : 50);
        }
        map[destination.y / 50][posX / 50] = 0;
        return Pathfinder.findWay(source.x / 50, source.y / 50, posX / 50, destination.y / 50, map);
    }
};