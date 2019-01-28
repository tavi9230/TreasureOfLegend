import {AssetLoader} from 'Aniwars/assetLoader';
import {EnumHelper} from 'Aniwars/enumHelper';

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
            this.footerPanel = self.add.graphics();
            this.footerPanel.fillStyle(0x111111, 0.8);
            this.footerPanel.fillRect(0, 690, 1200, 110);
            this.descriptionsText = this.add.text(410, 710, '', { fill: '#000' });

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

            this.turnText = this.add.text(1150, 750, this.turn, { fill: '#000' });
            this._addEvents();
            this.events.emit('getCharacterStartData');
        },
        _addEvents: function() {
            var self = this;
            this.activeScene = this.scene.get(this.sceneName);

            this.activeScene.events.on('activeCharacterChanged', _.bind(this._setCharacterStatus, this));
            this.activeScene.events.on('activeCharacterActed', _.bind(this._setCharacterStatus, this));
            this.activeScene.events.on('activeCharacterPositionModified', _.bind(this._setCharacterPosition, this));
            this.activeScene.events.on('showObjectDescription', function(object) {
                self.descriptionsText.setText(object.objectConfig.description);
            });
            this.activeScene.events.on('showCharacterInitiative', _.bind(this._showCharacterInitiative, this));
            this.activeScene.events.on('endEnemyTurn', _.bind(this._endTurn, this));
            this.activeScene.events.on('getSpells', _.bind(this._openSpellBook, this));
        },
        _setCharacterPosition: function(character) {
            this.locationText.setText('X:' + Math.floor(character.x / 50) + ', Y:' + Math.floor(character.y / 50));
        },
        _setCharacterStatus: function(activeCharacter, characters) {
            //TODO: Change this function to a creation function and an update function per character
            // per individual attribute so that we don't rerender unnecessary stuff
            var self = this,
                x = 0,
                y = 690;

            if (this.isCharacterInfoMenuOpen) {
                this._showCharacterInfo(activeCharacter);
            }
            if (!this.characterBar) {
                this.characterBar = this.add.group();
            } else {
                this.characterBar.destroy(true);
                this.characterBar = this.add.group();
            }
            if (!this.characterBarImages) {
                this.characterBarImages = this.add.group();
            } else {
                this.characterBarImages.destroy(true);
                this.characterBarImages = this.add.group();
            }
            _.each(characters.characters.getChildren(), function(character) {
                var charConfig = character.characterConfig;
                var characterImage = self.add.image(x, y, charConfig.image).setOrigin(0, 0);
                characterImage.displayWidth = 75;
                characterImage.displayHeight = 75;
                characterImage.objectToSend = character;

                var percentageOfLife = (100 * charConfig.life.current) / charConfig.life.max,
                    lifeWidth = (75 * percentageOfLife) / 100,
                    lifeBar = self.add.graphics(),
                    lifeText = self.add.text(x + 35, y + 75, (charConfig.life.current + '/' + charConfig.life.max), { fill: '#FFF', fontSize: '9px' });
                lifeBar.fillStyle(0x990000, 0.8);
                lifeBar.fillRect(x, y + 75, lifeWidth, 10);

                var percentageOfMana = (100 * (charConfig.mana.max - charConfig.mana.spent)) / charConfig.mana.max,
                    manaWidth = (75 * percentageOfMana) / 100,
                    manaBar = self.add.graphics(),
                    manaText = self.add.text(x + 35, y + 85,
                    ((charConfig.mana.max - charConfig.mana.spent) + '/' + charConfig.mana.max), { fill: '#FFF', fontSize: '9px' });
                manaBar.fillStyle(0x000099, 0.8);
                manaBar.fillRect(x, y + 85, manaWidth, 10);

                var percentageOfMovement = (100 * (charConfig.movement.max - charConfig.movement.spent)) / charConfig.movement.max,
                    movementWidth = (75 * percentageOfMovement) / 100,
                    movementBar = self.add.graphics(),
                    movementText = self.add.text(x + 35, y + 95,
                    ((charConfig.movement.max - charConfig.movement.spent) + '/' + charConfig.movement.max), { fill: '#FFF', fontSize: '9px' });
                movementBar.fillStyle(0x999900, 0.8);
                movementBar.fillRect(x, y + 95, movementWidth, 10);

                var armorBox = self.add.graphics(),
                    armorText = self.add.text(x + 75, y, charConfig.armor, { fill: '#FFF', fontSize: '18px' });
                armorBox.fillStyle(0xcccccc, 0.8);
                armorBox.fillRect(x + 75, y, 25, 25);

                var actionsBox = self.add.graphics(),
                    actionsText = self.add.text(x + 75, y + 25, (charConfig.actions.max - charConfig.actions.spent), { fill: '#FFF', fontSize: '18px' });
                actionsBox.fillStyle(0xcccccc, 0.8);
                actionsBox.fillRect(x + 75, y + 25, 25, 25);

                var minorActionsBox = self.add.graphics(),
                    minorActionsText = self.add.text(x + 75, y + 50, (charConfig.minorActions.max - charConfig.minorActions.spent), { fill: '#FFF', fontSize: '18px' });
                minorActionsBox.fillStyle(0xcccccc, 0.8);
                minorActionsBox.fillRect(x + 75, y + 50, 25, 25);

                var mainAttackImage = charConfig.actions.selectedAction
                        ? charConfig.actions.selectedAction.image
                        : charConfig.inventory.mainHand.image,
                    mainAttack = self.add.image(x + 75, y + 75, mainAttackImage).setOrigin(0, 0);
                mainAttack.displayWidth = 25;
                mainAttack.displayHeight = 25;

                self.characterBarImages.add(characterImage);
                self.characterBar.add(lifeBar);
                self.characterBar.add(lifeText);
                self.characterBar.add(manaBar);
                self.characterBar.add(manaText);
                self.characterBar.add(movementBar);
                self.characterBar.add(movementText);
                self.characterBar.add(armorBox);
                self.characterBar.add(armorText);
                self.characterBar.add(actionsBox);
                self.characterBar.add(actionsText);
                self.characterBar.add(minorActionsBox);
                self.characterBar.add(minorActionsText);
                self.characterBar.add(mainAttack);
                x += 100;
            });

            this.input.setHitArea(this.characterBarImages.getChildren());
            _.each(this.characterBarImages.getChildren(), function(item) {
                // TODO: send the character as a parameter to the _showCharacterInfo method instead of children of initiativeTracker
                item.on('pointerdown', _.bind(self._showCharacterInfo, self, item.objectToSend));
                item.on('pointerover', function() {
                    self.events.emit('highlightCharacter', item.objectToSend);
                });
                item.on('pointerout', function() {
                    self.events.emit('dehighlightCharacter', item.objectToSend);
                });
            });
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
            var x = 0;
            var y = 0;
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
                box.fillRect(x, y, 75, 75);

                var characterImage = self.add.image(x, y, charConfig.image).setOrigin(0, 0);
                characterImage.displayWidth = 75;
                characterImage.displayHeight = 75;
                x += 80;
                characterImage.objectToSend = character;
                box.objectToSend = character;
                self.initiativeTracker.add(box);
                self.initiativeTracker.add(characterImage);
            });
            this.input.setHitArea(this.initiativeTracker.getChildren());
            _.each(this.initiativeTracker.getChildren(), function(item) {
                item.on('pointerover', function() {
                    self.events.emit('highlightCharacter', item.objectToSend);
                });
                item.on('pointerout', function() {
                    self.events.emit('dehighlightCharacter', item.objectToSend);
                });
            });
        },
        _showCharacterInfo: function (character) {
            // TODO: Show character inventory if player controlled otherwise show enemy info
            if (!this.isCharacterInfoMenuOpen) {
                var charConfig = character.characterConfig;
                this.isCharacterInfoMenuOpen = true;
                this.characterInfo = this.add.group();
                var panel = this.add.graphics();
                panel.fillStyle(0x111111, 0.8);
                panel.fillRect(0, 290, 400, 400);
                this.characterInfo.add(panel);
                // Equiped Inventory -----------------------------------------------------------------------------------------------------
                this._createInventorySlot(75, 300, 50, 50, character, charConfig.inventory.head);
                this._createInventorySlot(75, 355, 50, 50, character, charConfig.inventory.body);
                this._createInventorySlot(20, 355, 50, 50, character, charConfig.inventory.mainHand);
                this._createInventorySlot(130, 355, 50, 50, character, charConfig.inventory.offHand);
                this._createInventorySlot(20, 410, 50, 50, character, charConfig.inventory.hands);
                this._createInventorySlot(75, 410, 50, 50, character, charConfig.inventory.feet);
                // Unequiped inventory ---------------------------------------------------------------------------------------------------
                var y = 490;
                var x = 0;
                for (let i = 0; i < charConfig.inventory.slots.max; i++) {
                    this._createInventorySlot(x, y, 50, 50, character, charConfig.inventory.slots.items[i]);
                    x += 50;
                    if (x >= 400) {
                        x = 0;
                        y += 50;
                    }
                }
                this.characterInfo.name = 'characterInfo';
                this.characterInfoCloseButtonGroup = this._createCloseButton(380, 290, this.characterInfo);
            } else {
                this.isCharacterInfoMenuOpen = false;
                this.characterInfo.destroy(true);
                this.characterInfoCloseButtonGroup.destroy(true);
                this._showCharacterInfo(character);
            }
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
            this.spellBook.add(panel);
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

            var closeButtonGroup = this._createCloseButton(1180, 0, this.spellBook);

            this.input.setHitArea(this.spellBook.getChildren());
            _.each(this.spellBook.getChildren(), function(item) {
                item.on('pointerdown', function() {
                    self.events.emit('spellSelected', item.objectToSend);
                    self.spellBook.destroy(true);
                    closeButtonGroup.destroy(true);
                    panel.destroy();
                    // Get main attack icon
                    // TODO Change this to call a separate function
                    self.events.emit('getCharacterStartData');
                });
            });
        },
        _createInventorySlot: function(x, y, w, h, character, item) {
            var image = null,
                box = this.add.graphics(),
                self = this;
            box.fillStyle(0x444444, 0.8);
            box.fillRect(x, y, w, h);
            if (item) {
                image = this.add.image(x, y, item.image).setOrigin(0, 0);
                image.displayWidth = w;
                image.displayHeight = h;
            }
            this.characterInfo.add(box);
            if (image) {
                this.characterInfo.add(image);
            }
            var dropButtonGroup = this._createDropButton(x + 40, y, character, item);
            if (dropButtonGroup) {
                _.each(dropButtonGroup.getChildren(), function(item) {
                    self.characterInfo.add(item);
                });
            }
            if (_.isObject(item) && !item.isEquipped) {
                var replaceButtonGroup = this._createReplaceButton(x, y, character, item);
                if (replaceButtonGroup) {
                    _.each(replaceButtonGroup.getChildren(), function(item) {
                        self.characterInfo.add(item);
                    });
                }
            }
        },
        _createCloseButton: function(x, y, groupToDestroy) {
            var self = this,
                closeButtonGroup = this.add.group();

            var closeButton = this.add.graphics();
            closeButton.fillStyle(0x990000, 0.8);
            closeButton.fillRect(x, y, 20, 20);
            closeButtonGroup.add(closeButton);

            var closeText = this.add.text(x + 5, y + 2, 'X', { fill: '#FFF', fontSize: '18px' });
            closeButtonGroup.add(closeText);
            this.input.setHitArea(closeButtonGroup.getChildren());
            _.each(closeButtonGroup.getChildren(), function(item) {
                item.on('pointerdown', function() {
                    groupToDestroy.destroy(true);
                    if (groupToDestroy.name === 'characterInfo') {
                        self.isCharacterInfoMenuOpen = false;
                    }
                    closeButtonGroup.destroy(true);
                });
            });
            return closeButtonGroup;
        },
        _createDropButton: function(x, y, character, itemToDrop) {
            if (itemToDrop && itemToDrop.type !== EnumHelper.inventoryEnum.defaultEquipment
                && character.x === this.activeScene.activeCharacter.x && character.y === this.activeScene.activeCharacter.y) {
                var self = this,
                    dropButtonGroup = this.add.group();

                var dropButton = this.add.graphics();
                dropButton.fillStyle(0x990000, 0.8);
                dropButton.fillRect(x + 1, y, 10, 10);
                dropButtonGroup.add(dropButton);

                var dropText = this.add.text(x + 2, y, 'X', { fill: '#FFF', fontSize: '10px' });
                dropButtonGroup.add(dropText);
                this.input.setHitArea(dropButtonGroup.getChildren());
                _.each(dropButtonGroup.getChildren(), function(item) {
                    item.on('pointerdown', function() {
                        self.events.emit('dropItem', itemToDrop);
                    });
                });
                return dropButtonGroup;
            }
        },
        _createReplaceButton: function(x, y, character, itemToReplace) {
            if (itemToReplace && itemToReplace.type !== EnumHelper.inventoryEnum.defaultEquipment
                && character.x === this.activeScene.activeCharacter.x && character.y === this.activeScene.activeCharacter.y) {
                var self = this,
                    replaceButtonGroup = this.add.group();

                var replaceButton = this.add.graphics();
                replaceButton.fillStyle(0x009900, 0.8);
                replaceButton.fillRect(x, y, 10, 10);
                replaceButtonGroup.add(replaceButton);

                var replaceText = this.add.text(x + 2, y, 'R', { fill: '#FFF', fontSize: '10px' });
                replaceButtonGroup.add(replaceText);
                this.input.setHitArea(replaceButtonGroup.getChildren());
                _.each(replaceButtonGroup.getChildren(), function(item) {
                    item.on('pointerdown', function() {
                        self.events.emit('replaceItem', itemToReplace);
                    });
                });
                return replaceButtonGroup;
            }
        }
    });
};