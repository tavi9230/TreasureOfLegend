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
        var character = this.game.activeCharacter,
            charConfig = character.characterConfig;
        if (charConfig.actions.actionId === EnumHelper.actionEnum.attackMainHand) {
            this._checkDefaultAction(character, enemy);
        } else if (charConfig.actions.actionId === EnumHelper.actionEnum.attackSpell) {
            this._checkSpellAttack(character, enemy);
        } else {
            this._checkDefaultAction(character, enemy);
        }
    };

    // OBJECT INTERACTION -------------------------------------------------------------------------------------------------------------------
    this._interactWithDoor = (object) => {
        var charConfig = this.game.activeCharacter.characterConfig,
            x = object.x / 50,
            y = object.y / 50;
        charConfig.minorActions.spent++;
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
        if (charConfig.isPlayerControlled) {
            this.game.events.emit('activeCharacterActed', this.game.activeCharacter, this.game.characters);
            this.game.activeMap.showMovementGrid();
        }
    };

    //ENEMY INTERACTION --------------------------------------------------------------------------------------------------------------------
    this._attackWithMainHand = (character, enemy) => {
        // TODO: Get chance of hit (it's always a hit, but if armor is bigger than attack you just lose armor). D20 + attacking attribute vs armor of enemy
        // if armor is bigger, armor --;
        // if armor is equal, armor--;
        // if armor is lower, life = life - (D20 + attacking attribute vs armor of enemy - armor)
        // if armor is lower, armor = armor - ((D20 + attacking attribute vs armor of enemy - armor) / 2)
        var charConfig = character.characterConfig;
        var attackAttribute = EnumHelper.attributeEnum.strength === charConfig.inventory.mainHand.attribute
            ? charConfig.attributes.strength
            : charConfig.attributes.dexterity;
        var d20 = Math.floor(Math.random() * 20) + 1 + attackAttribute;
        if (d20 <= enemy.characterConfig.armor) {
            // TODO: Get individual pieces of armor and remove one point from random armor piece
            if (enemy.characterConfig.armor > 0) {
                enemy.characterConfig.armor --;
            }
        } else {
            var attackDamage = Math.floor(Math.random() * charConfig.inventory.mainHand.damage) + Math.floor(attackAttribute / 2);
            enemy.characterConfig.life.current -= attackDamage;
            // TODO: Get individual pieces of armor and remove d20 / 2 points of random armor piece. If it goes lower than 0,
            // destroy piece and remove remaining points from another piece
            if (enemy.characterConfig.armor > 0) {
                enemy.characterConfig.armor -= Math.ceil(attackDamage / 2);
            }
        }

        charConfig.actions.spent++;
        charConfig.actions.actionId = -1;
        charConfig.actions.selectedAction = null;
        if (charConfig.isPlayerControlled) {
            this.game.events.emit('activeCharacterActed', this.game.activeCharacter, this.game.characters);
        }
        this._checkInitiative(enemy);
    };

    this._attackWithSpell = (character, enemy) => {
        var charConfig = character.characterConfig;
        var d20 = Math.floor(Math.random() * 20) + 1 + charConfig.attributes.intelligence;
        if (d20 <= enemy.characterConfig.armor) {
            // TODO: Get individual pieces of armor and remove one point from random armor piece
            if (enemy.characterConfig.armor > 0) {
                enemy.characterConfig.armor --;
            }
        } else {
            var attackDamage = Math.floor(Math.random() * charConfig.inventory.selectedAction.damage) + Math.floor(charConfig.attributes.intelligence / 2);
            enemy.characterConfig.life.current -= attackDamage;
            // TODO: Get individual pieces of armor and remove d20 / 2 points of random armor piece. If it goes lower than 0,
            // destroy piece and remove remaining points from another piece
            if (enemy.characterConfig.armor > 0) {
                enemy.characterConfig.armor -= Math.ceil(attackDamage / 2);
            }
        }
        //enemy.characterConfig.life.current -= Math.floor(Math.random() * charConfig.actions.selectedAction.damage) + Math.floor(charConfig.attributes.intelligence / 2);

        charConfig.actions.spent++;
        charConfig.actions.actionId = -1;
        charConfig.mana.spent += charConfig.actions.selectedAction.cost;
        charConfig.actions.selectedAction = null;

        if (charConfig.isPlayerControlled) {
            this.game.events.emit('activeCharacterActed', this.game.activeCharacter, this.game.characters);
        }
        this._checkInitiative(enemy);
    };

    // PRIVATE -------------------------------------------------------------------------------------------------------------------------------
    this._checkProjectileSuccess = (character, enemy) => {
        // TODO: Check Bresenham's algorithm (https://www.redblobgames.com/grids/line-drawing.html)
        // TODO: Maybe check from each corner of character to each corner of enemy to make sure it hits
        var self = this,
            isNotBlocked = true,
            linePoints = this._supercoverLine(character, enemy);
        _.each(linePoints, function(point) {
            if (self.game.activeMap.levelMap[point.y / 50][point.x / 50] !== 0) {
                isNotBlocked = false;
            }
        });

        return isNotBlocked;
    };

    this._supercoverLine = function(character, enemy) {
        var dx = enemy.x - character.x,
            dy = enemy.y - character.y,
            nx = Math.abs(dx),
            ny = Math.abs(dy),
            signX = dx > 0 ? 1 : -1,
            signY = dy > 0 ? 1 : -1,
            p = {
                x: character.x,
                y: character.y
            },
            points = [{ x: p.x, y: p.y }];
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
                if (!points.find( function(point) {
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

    this._tryMovingCharacter = (character, enemy) => {
        var path,
            charConfig = character.characterConfig;
        if (Math.abs(character.x - enemy.x) !== 0 || Math.abs(character.y - enemy.y) !== 0) {
            path = Pathfinder.getPathFromAToB(character, enemy, this.game.activeMap.levelMap);
            if (charConfig.isPlayerControlled && path.length > 0) {
                this.game.characters.moveActiveCharacterNearObject(null, path[path.length - 2][0], path[path.length - 2][1]);
            }
        }
    };

    this._checkInitiative = (enemy) => {
        var charConfig = enemy.characterConfig;
        if (charConfig.life.current <= 0) {
            enemy.destroy();
            if (charConfig.isPlayerControlled) {
                this.game.characters.characters.remove(enemy);
            } else {
                this.game.enemies.characters.remove(enemy);
            }
            this.game.initiative = this.game.sceneManager.getInitiativeArray();
        }
        this.game.events.emit('showCharacterInitiative', this.game.initiative);
    };

    this._checkDefaultAction = (character, enemy) => {
        // TODO: Check if offhand is empty?
        // Check if in range
        var charConfig = character.characterConfig;
        if (Math.abs(character.x - enemy.x) <= 50 * charConfig.inventory.mainHand.range &&
           Math.abs(character.y - enemy.y) <= 50 * charConfig.inventory.mainHand.range &&
           (Math.abs(character.x - enemy.x) > 0 || Math.abs(character.y - enemy.y) > 0)) {
            // If it is a ranged weapon chekc if projectile hits
            if (charConfig.inventory.mainHand.range > 1) {
                if (this._checkProjectileSuccess(character, enemy)) {
                    this._attackWithMainHand(character, enemy);
                }
            } else {
                this._attackWithMainHand(character, enemy);
            }
        }
            // Otherwise move near the object and try again
        else {
            this._tryMovingCharacter(character, enemy);
        }
    };

    this._checkSpellAttack = (character, enemy) => {
        // TODO: Check if offhand is empty?
        var charConfig = character.characterConfig;
        if (charConfig.mana.max - charConfig.mana.spent >= 0) {
            if (Math.abs(character.x - enemy.x) <= 50 * charConfig.actions.selectedAction.range &&
                Math.abs(character.y - enemy.y) <= 50 * charConfig.actions.selectedAction.range &&
                (Math.abs(character.x - enemy.x) > 0 || Math.abs(character.y - enemy.y) > 0)) {
                if (this._checkProjectileSuccess(character, enemy)) {
                    this._attackWithSpell(character, enemy);
                }
            } else {
                this._tryMovingCharacter(character, enemy);
            }
        }
    };
};