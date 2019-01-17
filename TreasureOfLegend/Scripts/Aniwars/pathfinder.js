var PF = require('pathfinding');
export const Pathfinder = {
    findWay: (startX, startY, endX, endY, levelMap) => {
        var map = [];
        for (let i = 0; i < levelMap.length; i++) {
            map[i] = [];
            for (let j = 0; j < levelMap[i].length; j++) {
                map[i][j] = levelMap[i][j] > 0 ? 1 : 0;
            }
        }
        var grid = new PF.Grid(map);
        var finder = new PF.BreadthFirstFinder({
            allowDiagonal: true,
            bidirectional: true,
            dontCrossCorners: true
        });
        return finder.findPath(startX, startY, endX, endY, grid);
    }
};