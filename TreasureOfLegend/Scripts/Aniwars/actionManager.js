import {EnumHelper} from 'Aniwars/enumHelper';
import {Pathfinder} from 'Aniwars/pathfinder';

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
        var path;
        // If object within reach try the interaction
        if (character.characterConfig.actionId === EnumHelper.actionEnum.attackMainHand) {
            this._checkDefaultAction(character, enemy);
        } else if (character.characterConfig.actionId === EnumHelper.actionEnum.attackSpell) {
            // TODO: Check if offhand is empty?
            if (character.characterConfig.mana - character.characterConfig.manaSpent >= 0) {
                if (Math.abs(character.x - enemy.x) <= 50 * character.characterConfig.inventory.spells[0].range &&
                    Math.abs(character.y - enemy.y) <= 50 * character.characterConfig.inventory.spells[0].range &&
                    (Math.abs(character.x - enemy.x) > 0 || Math.abs(character.y - enemy.y) > 0)) {
                    if (this._checkProjectileSuccess(character, enemy)) {
                        this._attackWithSpell(character, enemy);
                    }
                } else if (Math.abs(character.x - enemy.x) !== 0 || Math.abs(character.y - enemy.y) !== 0) {
                    path = Pathfinder.getPathFromAToB(character, enemy, this.game.activeMap.levelMap);
                    if (character.characterConfig.isPlayerControlled) {
                        this.game.characters.moveActiveCharacterNearObject(null, path[path.length - 2][0], path[path.length - 2][1]);
                    }
                }
            }
        } else {
            this._checkDefaultAction(character, enemy);
        }
    };

    // PRIVATE -------------------------------------------------------------------------------------------------------------------------------
    this._checkProjectileSuccess = (character, enemy) => {
        // TODO: Check Bresenham's algorithm (https://www.redblobgames.com/grids/line-drawing.html)
        // TODO: Maybe check from each corner of character to each corner of enemy to make sure it hits
        var self = this;
        var linePoints = this._supercoverLine(character, enemy);
        var isNotBlocked = true;
        _.each(linePoints, function(point) {
            if (self.game.activeMap.levelMap[point.y / 50][point.x / 50] !== 0) {
                isNotBlocked = false;
            }
        });

        return isNotBlocked;
    };

    this._supercoverLine = function(character, enemy) {
        var dx = enemy.x - character.x,
            dy = enemy.y - character.y;
        var nx = Math.abs(dx),
            ny = Math.abs(dy);
        var signX = dx > 0 ? 1 : -1,
            signY = dy > 0 ? 1 : -1;
        var p = {
            x: character.x,
            y: character.y
        };
        var points = [{ x: p.x, y: p.y }];
        for (var ix = 0, iy = 0; ix < nx || iy < ny;) {
            if ((0.5 + ix) / nx === (0.5 + iy) / ny) {
                // next step is diagonal
                p.x += signX;
                p.y += signY;
                ix++;
                iy++;
            } else if ((0.5 + ix) / nx < (0.5 + iy) / ny) {
                // next step is horizontal
                p.x += signX;
                ix++;
            } else {
                // next step is vertical
                p.y += signY;
                iy++;
            }
            if (p.x % 10 === 0 && p.y % 10 === 0) {
                if (!points.find(function(point) {
                    return point.x === Math.floor(p.x / 50) * 50 &&
                        point.y === Math.floor(p.y / 50) * 50;
                })) {
                    points.push({
                        x: Math.floor(p.x / 50) * 50,
                        y: Math.floor(p.y / 50) * 50
                    });
                }
            }
        }
        return points;
    };

    // OBJECT INTERACTION -------------------------------------------------------------------------------------------------------------------
    this._checkDefaultAction = (character, enemy) => {
        var path;
        if (Math.abs(character.x - enemy.x) <= 50 * character.characterConfig.inventory.mainHand.range &&
           Math.abs(character.y - enemy.y) <= 50 * character.characterConfig.inventory.mainHand.range &&
           (Math.abs(character.x - enemy.x) > 0 || Math.abs(character.y - enemy.y) > 0)) {
            if (character.characterConfig.inventory.mainHand.range > 1) {
                if (this._checkProjectileSuccess(character, enemy)) {
                    this._attackWithMainHand(character, enemy);
                }
            } else {
                this._attackWithMainHand(character, enemy);
            }
        }
            // Otherwise move near the object and try again
        else if (Math.abs(character.x - enemy.x) !== 0 || Math.abs(character.y - enemy.y) !== 0) {
            path = Pathfinder.getPathFromAToB(character, enemy, this.game.activeMap.levelMap);
            if (character.characterConfig.isPlayerControlled) {
                this.game.characters.moveActiveCharacterNearObject(null, path[path.length - 2][0], path[path.length - 2][1]);
            }
        }
    };

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
        character.characterConfig.actionId = -1;
        enemy.characterConfig.life -= character.characterConfig.inventory.mainHand.damage;

        if (character.characterConfig.isPlayerControlled) {
            this.game.events.emit('activeCharacterActed', character);
        }
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

    this._attackWithSpell = (character, enemy) => {
        character.characterConfig.actionsSpent++;
        character.characterConfig.actionId = -1;
        character.characterConfig.manaSpent += character.characterConfig.inventory.spells[0].cost;
        enemy.characterConfig.life -= character.characterConfig.inventory.spells[0].damage;

        if (character.characterConfig.isPlayerControlled) {
            this.game.events.emit('activeCharacterActed', character);
        }
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