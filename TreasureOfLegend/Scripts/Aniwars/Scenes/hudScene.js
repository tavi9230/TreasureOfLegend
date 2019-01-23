import {AssetLoader} from 'Aniwars/assetLoader';

export const HUDScene = function(sceneName) {
    return new Phaser.Class({
        Extends: Phaser.Scene,

        initialize: function HUDScene() {
            Phaser.Scene.call(this, { key: 'HUDScene', active: true });
            this.activeCharacterPosition = { x: 0, y: 0 };
            this.sceneName = sceneName;
        },

        preload() {
            var assetLoader = new AssetLoader(this);
            assetLoader.loadHUDImages();
        },

        create() {
            //create player hud
            var self = this;
            this.turn = 1;
            this.hudbuttons = this.add.group();
            this.hudbackground = this.add.image(0, 700, 'hudbackground').setOrigin(0, 0);
            var endTurnButton = this.add.image(1100, 710, 'hourglass').setOrigin(0, 0);
            endTurnButton.on('pointerdown', _.bind(this._endTurn, this));
            this.hudbuttons.add(endTurnButton);

            var openMenuButton = this.add.image(1000, 710, 'openMenuButton').setOrigin(0, 0);
            openMenuButton.displayHeight = 50;
            openMenuButton.displayWidth = 50;
            openMenuButton.on('pointerdown', _.bind(this._openMainMenu, this));
            this.hudbuttons.add(openMenuButton);

            var spellsButton = this.add.image(900, 710, 'spells').setOrigin(0, 0);
            spellsButton.displayHeight = 50;
            spellsButton.displayWidth = 50;
            spellsButton.on('pointerdown', function() {
                self.events.emit('getActiveCharacterSpells');
            });
            this.hudbuttons.add(spellsButton);

            this.input.setHitArea(this.hudbuttons.getChildren());

            this.locationText = this.add.text(1080, 780, 'X:0, Y:0', { fill: '#000' });
            this.hpText = this.add.text(500, 710, 'HP: 0', { fill: '#000' });
            this.manaText = this.add.text(500, 730, 'Mana: 0', { fill: '#000' });
            this.armorText = this.add.text(500, 750, 'Armor: 0', { fill: '#000' });
            this.movementText = this.add.text(500, 770, 'Movement: 0', { fill: '#000' });
            this.actionsText = this.add.text(610, 710, 'Actions: 0', { fill: '#000' });
            this.minorActionsText = this.add.text(610, 730, 'Minor Actions: 0', { fill: '#000' });
            this.descriptionsText = this.add.text(10, 710, '', { fill: '#000' });

            this.turnText = this.add.text(1150, 750, this.turn, { fill: '#000' });
            this._addEvents();
            this.events.emit('getCharacterStartData');
        },
        _addEvents: function() {
            var self = this;
            this.activeScene = this.scene.get(this.sceneName);

            this.activeScene.events.on('activeCharacterChanged', _.bind(this._displayInfo, this));
            this.activeScene.events.on('activeCharacterActed', _.bind(this._displayInfo, this));
            this.activeScene.events.on('activeCharacterPositionModified', _.bind(this._displayInfo, this));
            this.activeScene.events.on('showObjectDescription', function(object) {
                self.descriptionsText.setText(object.objectConfig.description);
            });
            this.activeScene.events.on('showCharacterInitiative', _.bind(this._showCharacterInitiative, this));
            this.activeScene.events.on('endEnemyTurn', _.bind(this._endTurn, this));
            this.activeScene.events.on('getSpells', _.bind(this._openSpellBook, this));
        },
        _displayInfo: function(activeCharacter) {
            var charConfig = activeCharacter.characterConfig;

            this._setTexts(activeCharacter);
            var image = charConfig.actions.selectedAction
                ? charConfig.actions.selectedAction.image
                : charConfig.inventory.mainHand.image;
            if (this.mainAttack) {
                this.mainAttack.destroy();
            }
            this.mainAttack = this.add.image(610, 745, image).setOrigin(0, 0);
            this.mainAttack.displayWidth = 50;
            this.mainAttack.displayHeight = 50;
        },
        _setTexts: function(activeCharacter) {
            this._setPositionText(activeCharacter);
            this._setHpText(activeCharacter);
            this._setManaText(activeCharacter);
            this._setMovementText(activeCharacter);
            this._setArmorText(activeCharacter);
            this._setActionsText(activeCharacter);
            this._setMinorActionsText(activeCharacter);
        },
        _setPositionText: function(activeCharacter) {
            this.locationText.setText('X:' + Math.floor(activeCharacter.x / 50) + ', Y:' + Math.floor(activeCharacter.y / 50));
        },
        _setHpText: function(activeCharacter) {
            var charConfig = activeCharacter.characterConfig;
            this.hpText.setText('HP: ' + charConfig.life.current);
        },
        _setManaText: function(activeCharacter) {
            var charConfig = activeCharacter.characterConfig;
            this.manaText.setText('Mana: ' + (charConfig.mana.max - charConfig.mana.spent));
        },
        _setMovementText: function(activeCharacter) {
            var charConfig = activeCharacter.characterConfig;
            this.movementText.setText('Movement: ' + (charConfig.movement.max - charConfig.movement.spent));
        },
        _setArmorText: function(activeCharacter) {
            var charConfig = activeCharacter.characterConfig;
            this.armorText.setText('Armor: ' + charConfig.armor);
        },
        _setActionsText: function(activeCharacter) {
            var charConfig = activeCharacter.characterConfig;
            this.actionsText.setText('Actions: ' + (charConfig.actions.max - charConfig.actions.spent));
        },
        _setMinorActionsText: function(activeCharacter) {
            var charConfig = activeCharacter.characterConfig;
            this.minorActionsText.setText('Minor Actions: ' + (charConfig.minorActions.max - charConfig.minorActions.spent));
        },
        _endTurn: function() {
            this.events.emit('endTurn');
            // TODO: change turn counter after all from the initiative have done their movement
            this.turn++;
            this.turnText.setText(this.turn);
        },
        _openMainMenu: function() {
            this.scene.sleep('HUDScene');
            this.scene.sleep(this.sceneName);
            this.scene.wake('MainMenuScene');
        },
        _showCharacterInitiative: function(characters) {
            var self = this;
            var x = 20;
            var y = 20;
            if (!this.initiativeTracker) {
                this.initiativeTracker = this.add.group();
            } else {
                this.initiativeTracker.destroy(true);
                this.initiativeTracker = this.add.group();
            }
            _.each(characters, function(character) {
                var charConfig = character.characterConfig;
                var box = self.add.graphics();
                charConfig.isPlayerControlled
                    ? box.fillStyle(0x38b82c, 0.8)
                    : box.fillStyle(0x3c60d6, 0.8);
                box.fillRect(x - 10, y - 10, 70, 70);

                var maxLife = charConfig.life.max;
                var life = charConfig.life.current;
                var percentageOfLife = (100 * life) / maxLife;
                var lifeWidth = (70 * percentageOfLife) / 100;
                var lifeBar = self.add.graphics();
                lifeBar.fillStyle(0x990000, 0.8);
                lifeBar.fillRect(x - 10, y + 50, lifeWidth, 10);

                var lifeText = self.add.text(x + 20, y + 49, charConfig.life.current, { fill: '#FFF', fontSize: '9px' });

                var characterImage = self.add.image(x, y, charConfig.image).setOrigin(0, 0);
                x += 80;
                self.initiativeTracker.add(box);
                self.initiativeTracker.add(lifeBar);
                self.initiativeTracker.add(lifeText);
                self.initiativeTracker.add(characterImage);
            });

            this.input.setHitArea(this.initiativeTracker.getChildren());
            _.each(this.initiativeTracker.getChildren(), function(character) {
                // TODO: send the character as a parameter to the _showCharacterInfo method instead of children of initiativeTracker
                character.on('pointerdown', _.bind(self._showCharacterInfo, self, character));
            });
        },
        _showCharacterInfo: function (character) {
            // TODO: Show character inventory if player controlled otherwise show enemy info
            return character.characterConfig.inventory;
        },
        _openSpellBook: function (character) {
            var self = this;
            if (!this.spellBook) {
                this.spellBook = this.add.group();
            } else {
                this.spellBook.destroy(true);
                this.spellBook = this.add.group();
            }
            var panel = self.add.graphics();
            panel.fillStyle(0x111111, 0.8);
            panel.fillRect(900, 0, 300, 700);
            var x = 920;
            var y = 10;
            _.each(character.characterConfig.inventory.spells, function(spell) {
                var box = self.add.graphics();
                box.fillStyle(0xded7c7, 0.8);
                box.fillRect(x - 10, y, 70, 70);
                var spellImage = self.add.image(x, y + 10, spell.image).setOrigin(0, 0);
                spellImage.displayWidth = 50;
                spellImage.displayHeight = 50;

                box.objectToSend = spell;
                spellImage.objectToSend = spell;

                self.spellBook.add(box);
                self.spellBook.add(spellImage);
                x += 80;
            });
            this.input.setHitArea(this.spellBook.getChildren());
            _.each(this.spellBook.getChildren(), function(item) {
                // TODO: send the spell object as the parameter?
                item.on('pointerdown', function() {
                    self.events.emit('spellSelected', item.objectToSend);
                    self.spellBook.destroy(true);
                    panel.destroy();
                    self._displayInfo(character);
                });
            });
        }
    });
};