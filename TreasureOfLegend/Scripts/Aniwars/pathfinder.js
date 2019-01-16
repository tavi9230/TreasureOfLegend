export const Pathfinder = {
    findWay: (position, end, levelMap) => {
        var queue = [];
        var map = [];
        for (let i = 0; i < levelMap.length; i++) {
            map[i] = [];
            for (let j = 0; j < levelMap[i].length; j++) {
                map[i][j] = levelMap[i][j];
            }
        }
        map[position[0]][position[1]] = 1;
        // store a path, not just a position
        queue.push([position]);

        while (queue.length > 0) {
            // get the path out of the queue
            var path = queue.shift();
            // ... and then the last position from it
            var pos = path[path.length-1];
            var direction = [
              [pos[0] + 1, pos[1]],
              [pos[0], pos[1] + 1],
              [pos[0] - 1, pos[1]],
              [pos[0], pos[1] - 1]
            ];

            for (var i = 0; i < direction.length; i++) {
                // Perform this check first:
                if (direction[i][0] === end[0] && direction[i][1] === end[1]) {
                    // return the path that led to the find
                    return path.concat([end]);
                }

                if (direction[i][0] < 0 || direction[i][0] >= map[0].length
                    || direction[i][1] < 0 || direction[i][1] >= map[0].length
                    || map[direction[i][0]][direction[i][1]] !== 0) {
                    continue;
                }

                map[direction[i][0]][direction[i][1]] = 1;
                // extend and push the path on the queue
                queue.push(path.concat([direction[i]]));
            }
        }
    }
};