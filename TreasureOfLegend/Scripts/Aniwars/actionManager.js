﻿import {EnumHelper} from 'Aniwars/enumHelper';

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

    this.interactWithEnemy = (enemy) => {
        var character = this.game.activeCharacter;
        if (character.characterConfig.actionId === -1) {
            this._attackWithMainHand(character, enemy);
        }
    };

    // OBJECT INTERACTION -------------------------------------------------------------------------------------------------------------------
    this._interactWithDoor = (object) => {
        var character = this.game.activeCharacter;
        character.characterConfig.minorActionsSpent++;
        var x = object.x / 50;
        var y = object.y / 50;
        this.game.activeMap.levelMap = this.game.activeMap.copyMap(this.game.activeMap.levelMap, this.game.activeMap.previousMap);
        //door animations would be nice
        if (!object.objectConfig.isActivated) {
            this.game.activeMap.levelMap[y][x] = 0;
            if (object.objectConfig.id === EnumHelper.idEnum.door.up || object.objectConfig.id === EnumHelper.idEnum.door.down) {
                object.setX(object.x - 50);
            } else if (object.objectConfig.id === EnumHelper.idEnum.door.right || object.objectConfig.id === EnumHelper.idEnum.door.left) {
                object.setY(object.y - 50);
            }
        } else {
            this.game.activeMap.levelMap[y][x] = object.objectConfig.id;
        }
        object.objectConfig.isActivated = !object.objectConfig.isActivated;
        if (character.characterConfig.isPlayerControlled) {
            this.game.events.emit('activeCharacterActed', character);
            this.game.activeMap.showMovementGrid();
        }
    };

    //ENEMY INTERACTION --------------------------------------------------------------------------------------------------------------------
    this._attackWithMainHand = (character, enemy) => {
        character.characterConfig.actionsSpent++;
        if (character.characterConfig.isPlayerControlled) {
            this.game.events.emit('activeCharacterActed', character);
        }
        enemy.characterConfig.life -= character.characterConfig.inventory.mainHand.damage;
        if (enemy.characterConfig.life <= 0) {
            enemy.destroy();
            if (enemy.characterConfig.isPlayerControlled) {
                this.game.characters.characters.remove(enemy);
            } else {
                this.game.enemies.characters.remove(enemy);
            }
            this.game.initiativeIndex--;
            this.game.initiative = this.game.sceneManager.getInitiativeArray();
        }
        this.game.events.emit('showCharacterInitiative', this.game.initiative);
    };
};