﻿import {SceneManager} from 'Aniwars/Managers/sceneManager';
import {EnumHelper} from 'Aniwars/Helpers/enumHelper';

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
            this.selectedCharacter = this.initiative[0];
            this.initiativeIndex = 0;
            this.sceneManager.createCamera();
            this.input.mouse.capture = true;
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
                self.sceneManager.endTurn();
            });
            this.hudScene.events.on('getCharacterStartData', function() {
                self.events.emit('showCharacterInitiative', self.initiative);
            });
            this.hudScene.events.on('spellSelected', function(spell) {
                var charConfig = self.activeCharacter.characterConfig;
                charConfig.energy.actionId = EnumHelper.actionEnum.attackSpell;
                charConfig.energy.selectedAction = spell;
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
            this.hudScene.events.on('boughtSkill', function(skill) {
                self.characters.buySkill(skill);
            });
            this.hudScene.events.on('mainHandSelected', function(character) {
                var charConfig = character.characterConfig;
                charConfig.energy.actionId = EnumHelper.actionEnum.attackMainHand;
                charConfig.energy.selectedAction = null;
            });
            this.hudScene.events.on('useDash', function() {
                self.characters.useDash();
            });
            this.hudScene.events.on('inspectSelected', function() {
                self.sceneManager.actions.inspect = !self.sceneManager.actions.inspect;
            });
            this.hudScene.events.on('setSelectedCharacter', function (character) {
                self.selectedCharacter = character;
                _.each(self.characters.characters.getChildren(), function (char) {
                    char.clearTint();
                });
                _.each(self.enemies.characters.getChildren(), function (char) {
                    char.clearTint();
                });
                character.setTint(0xFF0000);
                self.events.emit('toggleActionButtons',
                    self.activeCharacter.x === character.x && self.activeCharacter.y === character.y,
                    character.characterConfig.isPlayerControlled);
            });
        },
        _moveCamera() {
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