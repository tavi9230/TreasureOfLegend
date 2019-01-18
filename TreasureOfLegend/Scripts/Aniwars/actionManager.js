import {EnumHelper} from 'Aniwars/enumHelper';

export const ActionManager = function (game) {
    this.game = game;

    this.interactWithObject = (object) => {
        if (object.objectConfig.id === EnumHelper.idEnum.door) {
            this._interactWithDoor(object);
        }
    };

    this._interactWithDoor = (object) => {
        var character = game.activeCharacter;
        character.characterConfig.minorActionsSpent++;
        game.events.emit('activeCharacterActed', character);
        var x = object.x / 50;
        var y = object.y / 50;
        if (object.objectConfig.isAngled) {
            x = object.objectConfig.isActivated
                ? (object.x + 25) / 50
                : (object.x - 50) / 50;
        }
        game.activeMap.levelMap = game.activeMap.copyMap(game.activeMap.levelMap, game.activeMap.previousMap);
        //door animations would be nice
        if (!object.objectConfig.isActivated) {
            game.activeMap.levelMap[y][x] = 0;
            if (y - 1 > 0 &&
                game.activeMap.levelMap[y - 1][x] !== EnumHelper.idEnum.tile &&
                game.activeMap.levelMap[y - 1][x] !== EnumHelper.idEnum.door) {
                object.setAngle(-90);
            } else if (x - 1 > 0 &&
                game.activeMap.levelMap[y][x - 1] !== EnumHelper.idEnum.tile &&
                game.activeMap.levelMap[y][x - 1] !== EnumHelper.idEnum.door) {
                object.setAngle(0);
                object.setX(object.x - 75);
            }
        } else {
            game.activeMap.levelMap[y][x] = 2;
            if (y - 1 > 0 &&
                game.activeMap.levelMap[y - 1][x] !== EnumHelper.idEnum.tile &&
                game.activeMap.levelMap[y - 1][x] !== EnumHelper.idEnum.door) {
                object.setAngle(0);
            } else if (x - 1 > 0 &&
                game.activeMap.levelMap[y][x - 1] !== EnumHelper.idEnum.tile &&
                game.activeMap.levelMap[y][x - 1] !== EnumHelper.idEnum.door) {
                object.setX(object.x + 75);
                object.setAngle(90);
            }
        }
        object.objectConfig.isActivated = !object.objectConfig.isActivated;
        game.activeMap.showMovementGrid();
    };
};