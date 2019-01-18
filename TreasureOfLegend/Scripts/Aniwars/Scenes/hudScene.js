import {AssetLoader} from 'Aniwars/assetLoader';

export const HUDScene = {
    initialize: () => {
        return new Phaser.Class({
            Extends: Phaser.Scene,

            initialize: function HUDScene() {
                Phaser.Scene.call(this, { key: 'HUDScene', active: true });
                this.activeCharacterPosition = { x: 0, y: 0 };
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

                this.worldScene = this.scene.get('WorldScene');

                this.worldScene.events.on('activeCharacterChanged', _.bind(this._setTexts, this));
                this.worldScene.events.on('activeCharacterActed', _.bind(this._setTexts, this));
                this.worldScene.events.on('activeCharacterPositionModified', _.bind(this._setTexts, this));
                this.worldScene.events.on('showObjectDescription', function(object) {
                    self.descriptionsText.setText(object.objectConfig.description);
                });
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
                this.locationText.setText('X:' +
                    Math.floor(activeCharacter.x / 50) +
                    ', Y:' +
                    Math.floor(activeCharacter.y / 50));
            },
            _setHpText: function(activeCharacter) {
                this.hpText.setText('HP: ' + activeCharacter.characterConfig.life);
            },
            _setManaText: function(activeCharacter) {
                this.manaText.setText('Mana: ' + activeCharacter.characterConfig.mana);
            },
            _setMovementText: function(activeCharacter) {
                this.movementText.setText('Movement: ' +
                    (activeCharacter.characterConfig.movement - activeCharacter.characterConfig.movementSpent));
            },
            _setArmorText: function(activeCharacter) {
                this.armorText.setText('Armor: ' + activeCharacter.characterConfig.armor);
            },
            _setActionsText: function(activeCharacter) {
                this.actionsText.setText('Actions: ' +
                    (activeCharacter.characterConfig.actions - activeCharacter.characterConfig.actionsSpent));
            },
            _setMinorActionsText: function(activeCharacter) {
                this.minorActionsText.setText('Minor Actions: ' +
                    (activeCharacter.characterConfig.minorActions - activeCharacter.characterConfig.minorActionsSpent));
            },
            _endTurn: function() {
                this.events.emit('endTurn');
                this.turn++;
                this.turnText.setText(this.turn);
            }
        });
    }
};