export const CoordHelper = {
    CartesianToIsometric: (x, y) => {
        var tempPt = {};
        tempPt.x = x - y;
        tempPt.y = (x + y) / 2;
        return (tempPt);
    },
    IsometricToCartesian: (x, y) => {
        var tempPt = {};
        tempPt.x = (2 * y + x) / 2;
        tempPt.y = (2 * y - x) / 2;
        return (tempPt);
    }
};