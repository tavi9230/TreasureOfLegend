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
            this.descriptionsText = this.add.text(410, 710, '', { fill: '#FFF' });
            this.soulsText = this.add.text(410, 750, 'Souls: 0/5', { fill: '#FFF'});

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

            var skillsButton = this.add.image(850, 710, 'skills').setOrigin(0, 0);
            skillsButton.displayHeight = 50;
            skillsButton.displayWidth = 50;
            skillsButton.on('pointerdown', function() {
                if (self.activeScene.activeCharacter.characterConfig.isPlayerControlled) {
                    self._openSkillTree(self.activeScene.activeCharacter);
                }
            });
            this.hudbuttons.add(skillsButton);

            this.input.setHitArea(this.hudbuttons.getChildren());

            this.locationText = this.add.text(1080, 780, 'X:0, Y:0', { fill: '#FFF' });

            this.turnText = this.add.text(1150, 750, this.turn, { fill: '#FFF' });
            this._addEvents();
            this.events.emit('getCharacterStartData');
        },
        _addEvents: function() {
            var self = this;
            this.activeScene = this.scene.get(this.sceneName);

            this.activeScene.events.on('activeCharacterChanged', _.bind(this._setCharacterStatus, this));
            this.activeScene.events.on('activeCharacterActed', _.bind(this._setCharacterStatus, this));
            this.activeScene.events.on('activeCharacterPositionModified', _.bind(this._setCharacterPosition, this));
            this.activeScene.events.on('updateSouls', _.bind(this._updateSoulPoints, this));
            this.activeScene.events.on('showObjectDescription', function(object) {
                self.descriptionsText.setText(object.objectConfig.description);
            });
            this.activeScene.events.on('showCharacterInitiative', _.bind(this._showCharacterInitiative, this));
            this.activeScene.events.on('endEnemyTurn', _.bind(this._endTurn, this));
            this.activeScene.events.on('getSpells', _.bind(this._openSpellBook, this));
            this.activeScene.events.on('showDeadCharacterInventory', _.bind(this._showDeadCharacterInventory, this));
            this.activeScene.events.on('closeLootbag', _.bind(this._closeLootbag, this));
            this.activeScene.events.on('updateAttributePointsPanel', _.bind(this._showAttributePointSelection, this));
            this.activeScene.events.on('changeTurnCounter', _.bind(this._changeTurnCounter, this));
        },
        _setCharacterPosition: function(character) {
            this.locationText.setText('X:' + Math.floor(character.x / 50) + ', Y:' + Math.floor(character.y / 50));
        },
        _updateSoulPoints: function(souls) {
            this.soulsText.setText('Souls: ' + souls.current + '/' + souls.nextLevel);
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
        },
        _changeTurnCounter: function() {
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

                var percentageOfLife = (100 * charConfig.life.current) / charConfig.life.max,
                    lifeWidth = (75 * percentageOfLife) / 100,
                    lifeBar = self.add.graphics(),
                    lifeText = self.add.text(x + 25, y, (charConfig.life.current + '/' + charConfig.life.max), { fill: '#FFF', fontSize: '9px' });
                lifeBar.fillStyle(0x990000, 0.8);
                lifeBar.fillRect(x, y, lifeWidth, 10);

                var percentageOfMana = (100 * (charConfig.mana.max - charConfig.mana.spent)) / charConfig.mana.max,
                    manaWidth = (75 * percentageOfMana) / 100,
                    manaBar = self.add.graphics(),
                    manaText = self.add.text(x + 25, y + 75,
                    ((charConfig.mana.max - charConfig.mana.spent) + '/' + charConfig.mana.max), { fill: '#FFF', fontSize: '9px' });
                manaBar.fillStyle(0x000099, 0.8);
                manaBar.fillRect(x, y + 75, manaWidth, 10);

                // TODO change event to just be thrown on image hover
                characterImage.objectToSend = character;
                box.objectToSend = character;
                lifeBar.objectToSend = character;
                lifeText.objectToSend = character;
                manaBar.objectToSend = character;
                manaText.objectToSend = character;

                self.initiativeTracker.add(box);
                self.initiativeTracker.add(characterImage);
                self.initiativeTracker.add(lifeBar);
                self.initiativeTracker.add(lifeText);
                self.initiativeTracker.add(manaBar);
                self.initiativeTracker.add(manaText);
                x += 80;
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

                var experienceText = this.add.text(210, 330, 'Experience: ' + charConfig.experience.current + '/' + charConfig.experience.nextLevel, { fill: '#FFF'});
                var strengthText = this.add.text(210, 345, 'Strength: ' + charConfig.attributes.strength, { fill: '#FFF'});
                var dexterityText = this.add.text(210, 360, 'Dexterity: ' + charConfig.attributes.dexterity, { fill: '#FFF'});
                var intelligenceText = this.add.text(210, 375, 'Intelligence: ' + charConfig.attributes.intelligence, { fill: '#FFF'});
                this.characterInfo.add(experienceText);
                this.characterInfo.add(strengthText);
                this.characterInfo.add(dexterityText);
                this.characterInfo.add(intelligenceText);

                this._showAttributePointSelection(character);
            } else {
                this.isCharacterInfoMenuOpen = false;
                this.characterInfo.destroy(true);
                this.characterInfoCloseButtonGroup.destroy(true);
                this._showCharacterInfo(character);
            }
        },
        _showAttributePointSelection: function(character) {
            var charConfig = character.characterConfig;
            if (this.attributesInfo) {
                this.attributesInfo.destroy(true);
            }
            if (this.attributesInfoBox) {
                this.attributesInfoBox.destroy(true);
            }
            if (charConfig.experience.attributePoints > 0
                && character.x === this.activeScene.activeCharacter.x
                && character.y === this.activeScene.activeCharacter.y) {
                var self = this;
                this.attributesInfo = this.add.group();
                this.attributesInfoBox = this.add.group();
                var attributePointsText = this.add.text(210, 315, 'Attribute points: ' + charConfig.experience.attributePoints, { fill: '#FFF'});
                this.attributesInfo.add(attributePointsText);
                for (let i = 0; i < 3; i++) {
                    var attributeBox = this.add.graphics();
                    attributeBox.fillStyle(0xFFD700, 0.8);
                    attributeBox.fillRect(190, 345 + (i * 15), 15, 15);
                    attributeBox.objectToSend = i + 1;
                    var attributeButtonText = this.add.text(193, 345 + (i * 15), '+', { fill: '#FFF'});
                    attributeButtonText.objectToSend = i + 1;
                    this.attributesInfoBox.add(attributeBox);
                    this.attributesInfoBox.add(attributeButtonText);
                }
                this.input.setHitArea(this.attributesInfoBox.getChildren());
                _.each(this.attributesInfoBox.getChildren(), function (item) {
                    item.on('pointerdown', function() {
                        self.events.emit('addAttributePoint', item.objectToSend);
                    });
                });
            }
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
                this.input.setHitArea([image]);
                image.on('pointerover', _.bind(this._showItemStats, this, { x: x, y: y, item: item, character: character }));
                image.on('pointerout', _.bind(this._hideItemStats, this));
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
                    if (self.enemyInventory) {
                        self.enemyInventory.destroy(true);
                    }
                    if (self.attributesInfo) {
                        self.attributesInfo.destroy(true);
                    }
                    if (self.attributesInfoBox) {
                        self.attributesInfoBox.destroy(true);
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
        },
        _showItemStats: function(config) {
            if (config.item.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                var item = config.item;
                var characterConfig = config.character.characterConfig;
                var compareBox = this.add.graphics();
                var damageText;
                var equippedBox;
                var equippedDamageText;
                compareBox.fillStyle(0x222222, 0.8);
                compareBox.fillRect(config.x + 50, config.y, 100, 100);

                this.itemStats = this.add.group();
                this.itemStats.add(compareBox);

                if (item.type === EnumHelper.inventoryEnum.mainHand) {
                    damageText = this.add.text(config.x + 55, config.y, 'Damage: ' + item.damage[0].value, { fill: '#FFF' });
                    this.itemStats.add(damageText);
                    if (characterConfig.inventory.mainHand.type !== EnumHelper.inventoryEnum.defaultEquipment && !item.isEquipped) {
                        equippedBox = this.add.graphics();
                        equippedBox.fillStyle(0x222222, 0.8);
                        equippedBox.fillRect(config.x + 150, config.y, 100, 100);
                        equippedDamageText = this.add.text(config.x + 155, config.y, 'Damage: ' + characterConfig.inventory.mainHand.damage[0].value, { fill: '#FFF' });
                        this.itemStats.add(equippedBox);
                        this.itemStats.add(equippedDamageText);
                    }
                } else if (item.type === EnumHelper.inventoryEnum.offHand) {
                    if (item.damage) {
                        damageText = this.add.text(config.x + 55, config.y, 'Damage: ' + item.damage[0].value, { fill: '#FFF' });
                    } else {
                        damageText = this.add.text(config.x + 55, config.y, 'Armor: ' + item.armor, { fill: '#FFF' });
                    }
                    this.itemStats.add(damageText);
                    if (characterConfig.inventory.offHand.type !== EnumHelper.inventoryEnum.defaultEquipment && !item.isEquipped) {
                        equippedBox = this.add.graphics();
                        equippedBox.fillStyle(0x222222, 0.8);
                        equippedBox.fillRect(config.x + 150, config.y, 100, 100);
                        if (characterConfig.inventory.offHand.damage) {
                            equippedDamageText = this.add.text(config.x + 155, config.y, 'Damage: ' + characterConfig.inventory.offHand.damage[0].value, { fill: '#FFF' });
                        } else {
                            equippedDamageText = this.add.text(config.x + 155, config.y, 'Armor: ' + characterConfig.inventory.offHand.armor, { fill: '#FFF' });
                        }
                        this.itemStats.add(equippedBox);
                        this.itemStats.add(equippedDamageText);
                    }
                } else if (item.type === EnumHelper.inventoryEnum.head) {
                    damageText = this.add.text(config.x + 55, config.y, 'Armor: ' + item.armor, { fill: '#FFF' });
                    this.itemStats.add(damageText);
                    if (characterConfig.inventory.head.type !== EnumHelper.inventoryEnum.defaultEquipment && !item.isEquipped) {
                        equippedBox = this.add.graphics();
                        equippedBox.fillStyle(0x222222, 0.8);
                        equippedBox.fillRect(config.x + 150, config.y, 100, 100);
                        equippedDamageText = this.add.text(config.x + 155, config.y, 'Armor: ' + characterConfig.inventory.head.armor, { fill: '#FFF' });
                        this.itemStats.add(equippedBox);
                        this.itemStats.add(equippedDamageText);
                    }
                } else if (item.type === EnumHelper.inventoryEnum.body) {
                    damageText = this.add.text(config.x + 55, config.y, 'Armor: ' + item.armor, { fill: '#FFF' });
                    this.itemStats.add(damageText);
                    if (characterConfig.inventory.body.type !== EnumHelper.inventoryEnum.defaultEquipment && !item.isEquipped) {
                        equippedBox = this.add.graphics();
                        equippedBox.fillStyle(0x222222, 0.8);
                        equippedBox.fillRect(config.x + 150, config.y, 100, 100);
                        equippedDamageText = this.add.text(config.x + 155, config.y, 'Armor: ' + characterConfig.inventory.body.armor, { fill: '#FFF' });
                        this.itemStats.add(equippedBox);
                        this.itemStats.add(equippedDamageText);
                    }
                } else if (item.type === EnumHelper.inventoryEnum.hands) {
                    damageText = this.add.text(config.x + 55, config.y, 'Armor: ' + item.armor, { fill: '#FFF' });
                    this.itemStats.add(damageText);
                    if (characterConfig.inventory.hands.type !== EnumHelper.inventoryEnum.defaultEquipment && !item.isEquipped) {
                        equippedBox = this.add.graphics();
                        equippedBox.fillStyle(0x222222, 0.8);
                        equippedBox.fillRect(config.x + 150, config.y, 100, 100);
                        equippedDamageText = this.add.text(config.x + 155, config.y, 'Armor: ' + characterConfig.inventory.hands.armor, { fill: '#FFF' });
                        this.itemStats.add(equippedBox);
                        this.itemStats.add(equippedDamageText);
                    }
                } else if (item.type === EnumHelper.inventoryEnum.feet) {
                    damageText = this.add.text(config.x + 55, config.y, 'Armor: ' + item.armor, { fill: '#FFF' });
                    this.itemStats.add(damageText);
                    if (characterConfig.inventory.feet.type !== EnumHelper.inventoryEnum.defaultEquipment && !item.isEquipped) {
                        equippedBox = this.add.graphics();
                        equippedBox.fillStyle(0x222222, 0.8);
                        equippedBox.fillRect(config.x + 150, config.y, 100, 100);
                        equippedDamageText = this.add.text(config.x + 155, config.y, 'Armor: ' + characterConfig.inventory.feet.armor, { fill: '#FFF' });
                        this.itemStats.add(equippedBox);
                        this.itemStats.add(equippedDamageText);
                    }
                }
            }
        },
        _hideItemStats: function() {
            if (this.itemStats) {
                this.itemStats.destroy(true);
            }
        },
        _showDeadCharacterInventory: function(lootbag) {
            // TODO: Show character inventory items as a list of icons
            this._closeLootbag();
            var activeCharacter = this.activeScene.activeCharacter,
                lootbagConfig = lootbag.objectConfig,
                characterBelonging = lootbagConfig.belongsTo.characterConfig;
            this.enemyInventory = this.add.group();
            var panel = this.add.graphics();
            panel.fillStyle(0x111111, 0.8);
            panel.fillRect(400, 290, 200, 400);
            this.enemyInventory.add(panel);
            this._showCharacterInfo(activeCharacter);
            var x = 410;
            var y = 300;
            var image;
            var self = this;
            if (characterBelonging.inventory.mainHand.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                image = this.add.image(x, y, characterBelonging.inventory.mainHand.image).setOrigin(0, 0);
                image.displayWidth = 50;
                image.displayHeight = 50;
                image.objectToSend = characterBelonging.inventory.mainHand;
                this.enemyInventory.add(image);
                y += 60;
            }
            if (characterBelonging.inventory.offHand.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                image = this.add.image(x, y, characterBelonging.inventory.offHand.image).setOrigin(0, 0);
                image.displayWidth = 50;
                image.displayHeight = 50;
                image.objectToSend = characterBelonging.inventory.offHand;
                this.enemyInventory.add(image);
                y += 60;
            }
            if (characterBelonging.inventory.head.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                image = this.add.image(x, y, characterBelonging.inventory.head.image).setOrigin(0, 0);
                image.displayWidth = 50;
                image.displayHeight = 50;
                image.objectToSend = characterBelonging.inventory.head;
                this.enemyInventory.add(image);
                y += 60;
            }
            if (characterBelonging.inventory.body.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                image = this.add.image(x, y, characterBelonging.inventory.body.image).setOrigin(0, 0);
                image.displayWidth = 50;
                image.displayHeight = 50;
                image.objectToSend = characterBelonging.inventory.body;
                this.enemyInventory.add(image);
                y += 60;
            }
            if (characterBelonging.inventory.hands.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                image = this.add.image(x, y, characterBelonging.inventory.hands.image).setOrigin(0, 0);
                image.displayWidth = 50;
                image.displayHeight = 50;
                image.objectToSend = characterBelonging.inventory.hands;
                this.enemyInventory.add(image);
                y += 60;
            }
            if (characterBelonging.inventory.feet.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                image = this.add.image(x, y, characterBelonging.inventory.feet.image).setOrigin(0, 0);
                image.displayWidth = 50;
                image.displayHeight = 50;
                image.objectToSend = characterBelonging.inventory.feet;
                this.enemyInventory.add(image);
                y += 60;
            }
            if (characterBelonging.inventory.slots.items.length > 0) {
                _.each(characterBelonging.inventory.slots.items, function(item) {
                    image = self.add.image(x, y, item.image).setOrigin(0, 0);
                    image.displayWidth = 50;
                    image.displayHeight = 50;
                    image.objectToSend = item;
                    self.enemyInventory.add(image);
                    y += 60;
                });
            }
            this.input.setHitArea(this.enemyInventory.getChildren());
            _.each(this.enemyInventory.getChildren(), function(item) {
                item.on('pointerdown', function() {
                    self.events.emit('getItemFromLootBag', { item: item.objectToSend, lootbag: lootbag });
                });
                item.on('pointerover', _.bind(self._showItemStats, self, { x: item.x, y: item.y, item: item.objectToSend, character: activeCharacter }));
                item.on('pointerout', _.bind(self._hideItemStats, self));
            });
        },
        _closeLootbag: function() {
            if (this.enemyInventory) {
                this.enemyInventory.destroy(true);
                this._hideItemStats();
            }
        },
        _openSpellBook: function (character) {
            var self = this;
            if (this.skillTree) {
                this.skillTree.destroy(true);
                this.skillTree.closeButtonGroup.destroy(true);
            }
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

            this.spellBook.closeButtonGroup = this._createCloseButton(1180, 0, this.spellBook);
            this.input.setHitArea(this.spellBook.getChildren());
            _.each(this.spellBook.getChildren(), function(item) {
                item.on('pointerdown', function() {
                    self.events.emit('spellSelected', item.objectToSend);
                    self.spellBook.destroy(true);
                    self.spellBook.closeButtonGroup.destroy(true);
                    panel.destroy();
                    // Get main attack icon
                    // TODO Change this to call a separate function
                    self.events.emit('getCharacterStartData');
                });
            });
        },
        _openSkillTree: function (character) {
            var self = this;
            if (this.spellBook) {
                this.spellBook.destroy(true);
                this.spellBook.closeButtonGroup.destroy(true);
            }
            if (!this.skillTree) {
                this.skillTree = this.add.group();
            } else {
                this.skillTree.destroy(true);
                this.skillTree = this.add.group();
            }
            var panel = self.add.graphics();
            panel.fillStyle(0x111111, 0.8);
            panel.fillRect(900, 0, 300, 700);
            this.skillTree.add(panel);
            var x = 920;
            var y = 10;
            _.each(character.characterConfig.skillsToBuy, function(skill) {
                var box = self.add.graphics();
                box.fillStyle(0xded7c7, 0.8);
                box.fillRect(x - 10, y, 70, 70);
                var skillImage = self.add.image(x, y + 10, skill.image).setOrigin(0, 0);
                skillImage.displayWidth = 50;
                skillImage.displayHeight = 50;
                var skillLevelText = self.add.text(x + 22, y + 60, skill.level, { fill: '#FFF' });

                box.objectToSend = skill;
                skillImage.objectToSend = skill;
                skillLevelText.objectToSend = skill;

                self.skillTree.add(box);
                self.skillTree.add(skillImage);
                self.skillTree.add(skillLevelText);
                x += 80;
            });

            this.skillTree.closeButtonGroup = this._createCloseButton(1180, 0, this.skillTree);
            if (this.activeScene.characters.souls.skillPoints > 0) {
                this.input.setHitArea(this.skillTree.getChildren());
                _.each(this.skillTree.getChildren(), function(item) {
                    item.on('pointerdown', function() {
                        self.events.emit('boughtSkill', item.objectToSend);
                        self.skillTree.closeButtonGroup.destroy(true);
                        panel.destroy();
                        self._openSkillTree(character);
                    });
                });
            }
        }
    });
};