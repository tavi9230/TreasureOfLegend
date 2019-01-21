import {EnumHelper} from 'Aniwars/enumHelper';

export const ActionManager = function (game) {
    this.game = game;

    this.interactWithObject = (object) => {
        if (object.objectConfig.id === EnumHelper.idEnum.door.up ||
            object.objectConfig.id === EnumHelper.idEnum.door.right ||
            object.objectConfig.id === EnumHelper.idEnum.door.down ||
            object.objectConfig.id === EnumHelper.idEnum.door.left) {
            this._interactWithDoor(object);
        }
    };

    this._interactWithDoor = (object) => {
        var character = game.activeCharacter;
        character.characterConfig.minorActionsSpent++;
        game.events.emit('activeCharacterActed', character);
        var x = object.x / 50;
        var y = object.y / 50;
        game.activeMap.levelMap = game.activeMap.copyMap(game.activeMap.levelMap, game.activeMap.previousMap);
        //door animations would be nice
        if (!object.objectConfig.isActivated) {
            game.activeMap.levelMap[y][x] = 0;
            if (object.objectConfig.id === EnumHelper.idEnum.door.up || object.objectConfig.id === EnumHelper.idEnum.door.down) {
                object.setX(object.x - 50);
            } else if (object.objectConfig.id === EnumHelper.idEnum.door.right || object.objectConfig.id === EnumHelper.idEnum.door.left) {
                object.setY(object.y - 50);
            }
        } else {
            game.activeMap.levelMap[y][x] = object.objectConfig.id;
        }
        object.objectConfig.isActivated = !object.objectConfig.isActivated;
        game.activeMap.showMovementGrid();
    };
};