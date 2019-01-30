﻿import {SceneManager} from 'Aniwars/sceneManager';
import {EnumHelper} from 'Aniwars/enumHelper';

export const TestLevelScene = function() {
    return new Phaser.Class({
        Extends: Phaser.Scene,
        initialize: function TestLevelScene() {
            Phaser.Scene.call(this, { key: 'TestLevelScene' });
        },
        preload() { },
        create() {
            this.sceneManager = new SceneManager(this);
            this.sceneManager.createMap();
            this.sceneManager.createItems();
            this.sceneManager.createCharacters();
            this.sceneManager.createEnemies();
            this._activateHUDScene();
            this.cursors = this.input.keyboard.createCursorKeys();
            this.initiative = this.sceneManager.getInitiativeArray();
            this.activeCharacter = this.initiative[0];
            this.initiativeIndex = 0;
            this.sceneManager.createCamera();
        },
        update() {
            this.sceneManager.checkManager();
            this._moveCamera();
        },
        _activateHUDScene() {
            var self = this;
            this.hudScene = this.scene.get('HUDScene');
            this.hudScene.scene.bringToTop();
            this.hudScene.events.on('endTurn', function() {
                var charConfig = self.activeCharacter.characterConfig;
                var shouldChangeTurn = false;
                if (charConfig.path.length === 0 &&
                    !charConfig.movement.isMoving) {
                    charConfig.movement.spent = 0;
                    charConfig.minorActions.spent = 0;
                    charConfig.actions.spent = 0;
                    // TODO: Fix initiative. When one or multiple enemies die, redo the initiative
                    self.initiativeIndex++;
                    if (self.initiativeIndex >= self.initiative.length) {
                        self.initiativeIndex = 0;
                        shouldChangeTurn = true;
                    }
                    self.activeCharacter = self.initiative[self.initiativeIndex];

                    if (self.activeCharacter.characterConfig.isPlayerControlled) {
                        self.events.emit('activeCharacterChanged', self.activeCharacter, self.characters);
                        self.events.emit('activeCharacterPositionModified', self.activeCharacter);
                        self.activeMap.showMovementGrid();
                        self.cameras.main.startFollow(self.activeCharacter, true, 0.09, 0.09);
                    } else {
                        self.activeMap.hideMovementGrid();
                    }
                    if (shouldChangeTurn) {
                        self.events.emit('changeTurnCounter');
                    }
                }
            });
            this.hudScene.events.on('getCharacterStartData', function() {
                self.events.emit('activeCharacterChanged', self.activeCharacter, self.characters);
                self.events.emit('showCharacterInitiative', self.initiative);
            });
            this.hudScene.events.on('getActiveCharacterSpells', function() {
                if (self.activeCharacter.characterConfig.isPlayerControlled) {
                    self.events.emit('getSpells', self.activeCharacter);
                }
            });
            this.hudScene.events.on('spellSelected', function(spell) {
                var charConfig = self.activeCharacter.characterConfig;
                charConfig.actions.actionId = EnumHelper.actionEnum.attackSpell;
                charConfig.actions.selectedAction = spell;
                if (charConfig.isPlayerControlled) {
                    self.events.emit('activeCharacterActed', self.activeCharacter, self.characters);
                }
            });
            this.hudScene.events.on('highlightCharacter', function(character) {
                self.activeMap.highlightCharacter(character);
            });
            this.hudScene.events.on('dehighlightCharacter', function(character) {
                self.activeMap.dehighlightCharacter(character);
            });
            this.hudScene.events.on('dropItem', function(itemToDrop) {
                self.characters.dropItem(itemToDrop);
            });
            this.hudScene.events.on('replaceItem', function(itemToReplace) {
                self.characters.replaceItem(itemToReplace);
            });
            this.hudScene.events.on('getItemFromLootBag', function(config) {
                var item = config.item,
                    lootbag = config.lootbag;
                self.characters.addItemFromList(item, lootbag);
            });
            this.hudScene.events.on('addAttributePoint', function(index) {
                self.characters.updateAttributes(index);
            });
        },
        _moveCamera() {
            // TODO: Stop following active character and follow back when you don't want to scroll anymore?
            //this.cameras.main.stopFollow();
            if (this.cursors.left.isDown) {
                this.cameras.main.scrollX -= 10;
            }
            if (this.cursors.right.isDown) {
                this.cameras.main.scrollX += 10;
            }
            if (this.cursors.up.isDown) {
                this.cameras.main.scrollY -= 10;
            }
            if (this.cursors.down.isDown) {
                this.cameras.main.scrollY += 10;
            }
        }
    });
};