import { SceneManager } from 'Aniwars/Managers/sceneManager';
import { EnumHelper } from 'Aniwars/Helpers/enumHelper';
import { MapConfig } from 'Aniwars/Configurations/mapConfig';

export const TestLevelScene = function () {
    return new Phaser.Class({
        Extends: Phaser.Scene,
        initialize: function TestLevelScene() {
            Phaser.Scene.call(this, { key: 'TestLevelScene' });
        },
        preload() { },
        create() {
            this.backgroundMusic = this.sound.add('background_combat_1', { volume: 0.1 });
			// TODO: Loop does not work?
            this.backgroundMusic.setLoop(true);
            this.debugMode = true;
            this.sceneManager = new SceneManager(this);
            this.sceneManager.createMap(MapConfig.level0);
            this.sceneManager.createItems();
            this.sceneManager.createCharacters();
            this.sceneManager.createEnemies();
            this._activateHUDScene();
            this.cursors = this.input.keyboard.createCursorKeys();
            this.initiative = this.sceneManager.getInitiativeArray();
            this.activeCharacter = this.initiative[0];
            this.initiativeIndex = 0;
            this.sceneManager.createCamera();
            this.input.mouse.capture = true;
            this.createKeys();
            this.events.emit('showCharacterInitiative', this.initiative);
            this.backgroundMusic.play();
        },
        update() {
            this.sceneManager.checkManager();
            this._moveCamera();
        },
        createKeys: function () {
            this.keycodes = {
                d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                alt: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT)
            };
        },
        _activateHUDScene() {
            var self = this;
            this.hudScene = this.scene.get('HUDScene');
            this.hudScene.scene.bringToTop();
            this.hudScene.events.on('endTurn', function () {
                self.sceneManager.endTurn();
            });
            this.hudScene.events.on('getCharacterStartData', function () {
                self.events.emit('showCharacterInitiative', self.initiative);
            });
            this.hudScene.events.on('highlightCharacter', function (character) {
                self.activeMap.highlightCharacter(character);
            });
            this.hudScene.events.on('dehighlightCharacter', function (character) {
                self.activeMap.dehighlightCharacter(character);
            });
            this.hudScene.events.on('dropItem', function (itemToDrop) {
                self.characters.dropItem(itemToDrop);
            });
            this.hudScene.events.on('replaceItem', function (itemToReplace) {
                self.characters.replaceItem(itemToReplace);
            });
            this.hudScene.events.on('getItemFromLootBag', function (config) {
                var item = config.item,
                    lootbag = config.lootbag;
                self.characters.addItemFromList(item, lootbag);
            });
            this.hudScene.events.on('addAttributePoint', function (index) {
                self.characters.updateAttributes(index);
            });
            this.hudScene.events.on('boughtSkill', function (skill) {
                self.characters.buySkill(skill);
            });
            this.hudScene.events.on('useDash', function () {
                self.characters.useDash();
            });
            this.hudScene.events.on('spellSelected', function (spell) {
                if (self.activeCharacter.characterConfig.energy.actionId === EnumHelper.actionEnum.attackSpell
                    && self.activeCharacter.characterConfig.energy.selectedAction === spell) {
                    self.activeCharacter.characterConfig.energy.actionId = -1;
                    self.events.emit('removeSelectedActionIcon');
                } else {
                    var charConfig = self.activeCharacter.characterConfig;
                    charConfig.energy.actionId = EnumHelper.actionEnum.attackSpell;
                    charConfig.energy.selectedAction = spell;
                    self.events.emit('showSelectedActionIcon', spell.image);
                }
            });
            this.hudScene.events.on('inspectSelected', function () {
                if (self.activeCharacter.characterConfig.energy.actionId === EnumHelper.actionEnum.inspect) {
                    self.activeCharacter.characterConfig.energy.actionId = -1;
                    self.events.emit('removeSelectedActionIcon');
                } else {
                    self.activeCharacter.characterConfig.energy.actionId = EnumHelper.actionEnum.inspect;
                    self.events.emit('showSelectedActionIcon', 'inspectButton');
                }
                self.activeCharacter.characterConfig.energy.selectedAction = null;
            });
            this.hudScene.events.on('useMainHand', function () {
                if (self.activeCharacter.characterConfig.energy.actionId === EnumHelper.actionEnum.attackMainHand) {
                    self.activeCharacter.characterConfig.energy.actionId = -1;
                    self.events.emit('removeSelectedActionIcon');
                } else {
                    self.activeCharacter.characterConfig.energy.actionId = EnumHelper.actionEnum.attackMainHand;
                    self.events.emit('showSelectedActionIcon', self.activeCharacter.characterConfig.inventory.mainHand.image);
                    self.activeCharacter.characterConfig.energy.selectedAction = self.activeCharacter.characterConfig.inventory.mainHand;
                }
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
            if (this.keycodes.d.isDown && this.keycodes.alt.isDown) {
                this.debugMode = !this.debugMode;
            }
        }
    });
};