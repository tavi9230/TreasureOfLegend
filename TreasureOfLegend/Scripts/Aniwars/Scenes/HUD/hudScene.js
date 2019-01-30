import {AssetLoader} from 'Aniwars/Helpers/assetLoader';
import {EnumHelper} from 'Aniwars/Helpers/enumHelper';
import {HUDLowerPanel} from 'Aniwars/Scenes/HUD/lowerPanel';
import {HUDCharacterStatus} from 'Aniwars/Scenes/HUD/characterStatus';

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
            var lowerPanel = new HUDLowerPanel(this);
            lowerPanel.createLowerPanel();
            this.characterStatus = new HUDCharacterStatus(this);
            this._addEvents();
            this.events.emit('getCharacterStartData');
        },
        endTurn: function() {
            this.events.emit('endTurn');
        },
        openMainMenu: function() {
            this.scene.sleep('HUDScene');
            this.scene.sleep(this.sceneName);
            this.scene.wake('MainMenuScene');
        },
        _addEvents: function() {
            var self = this;
            this.activeScene = this.scene.get(this.sceneName);

            this.activeScene.events.on('activeCharacterChanged', function(activeCharacter, characters) {
                self.characterStatus.showCharacterStatus(activeCharacter, characters);
            });
            this.activeScene.events.on('activeCharacterActed', function(activeCharacter, characters) {
                self.characterStatus.showCharacterStatus(activeCharacter, characters);
            });
            this.activeScene.events.on('activeCharacterPositionModified', function(character) {
                self.locationText.setText('X:' + Math.floor(character.x / 50) + ', Y:' + Math.floor(character.y / 50));
            });
            this.activeScene.events.on('updateSouls', function(souls) {
                self.soulsText.setText('Souls: ' + souls.current + '/' + souls.nextLevel);
            });
            this.activeScene.events.on('showObjectDescription', function(object) {
                self.descriptionsText.setText(object.objectConfig.description);
            });
            this.activeScene.events.on('showCharacterInitiative', _.bind(this._showCharacterInitiative, this));
            this.activeScene.events.on('endEnemyTurn', _.bind(this.endTurn, this));
            this.activeScene.events.on('getSpells', _.bind(this._openSpellBook, this));
            this.activeScene.events.on('showDeadCharacterInventory', _.bind(this._showDeadCharacterInventory, this));
            this.activeScene.events.on('closeLootbag', _.bind(this._closeLootbag, this));
            this.activeScene.events.on('updateAttributePointsPanel', function(character) {
                self.characterStatus.showAttributePointSelection(character);
            });
            this.activeScene.events.on('changeTurnCounter', function() {
                self.turn++;
                self.turnText.setText(this.turn);
            });
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
            if (!this.initiativeTrackerImages) {
                this.initiativeTrackerImages = this.add.group();
            } else {
                this.initiativeTrackerImages.destroy(true);
                this.initiativeTrackerImages = this.add.group();
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

                characterImage.objectToSend = character;

                self.initiativeTracker.add(box);
                self.initiativeTracker.add(lifeBar);
                self.initiativeTracker.add(lifeText);
                self.initiativeTracker.add(manaBar);
                self.initiativeTracker.add(manaText);
                self.initiativeTrackerImages.add(characterImage);
                x += 80;
            });
            this.input.setHitArea(this.initiativeTrackerImages.getChildren());
            _.each(this.initiativeTrackerImages.getChildren(), function(item) {
                item.on('pointerover', function() {
                    self.events.emit('highlightCharacter', item.objectToSend);
                });
                item.on('pointerout', function() {
                    self.events.emit('dehighlightCharacter', item.objectToSend);
                });
            });
        },
        createCloseButton: function(x, y, groupToDestroy) {
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
                        self.characterStatus.isCharacterInfoMenuOpen = false;
                    }
                    if (self.enemyInventory) {
                        self.enemyInventory.destroy(true);
                    }
                    if (self.characterStatus.attributesInfo) {
                        self.characterStatus.attributesInfo.destroy(true);
                    }
                    if (self.characterStatus.attributesInfoBox) {
                        self.characterStatus.attributesInfoBox.destroy(true);
                    }
                    closeButtonGroup.destroy(true);
                });
            });
            return closeButtonGroup;
        },
        showItemStats: function(config) {
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
        hideItemStats: function() {
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
            this.characterStatus.showCharacterInfo(activeCharacter);
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
                item.on('pointerover', _.bind(self.showItemStats, self, { x: item.x, y: item.y, item: item.objectToSend, character: activeCharacter }));
                item.on('pointerout', _.bind(self.hideItemStats, self));
            });
        },
        _closeLootbag: function() {
            if (this.enemyInventory) {
                this.enemyInventory.destroy(true);
                this.hideItemStats();
            }
        },
        _openSpellBook: function (character) {
            var self = this;
            if (this.skillTree) {
                this.skillTree.closeButtonGroup.destroy(true);
                this.skillTree.destroy(true);
            }
            if (!this.spellBook) {
                this.spellBook = this.add.group();
            } else {
                this.spellBook.closeButtonGroup.destroy(true);
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

            this.spellBook.closeButtonGroup = this.createCloseButton(1180, 0, this.spellBook);
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
        openSkillTree: function (character) {
            var self = this;
            if (this.spellBook) {
                this.spellBook.closeButtonGroup.destroy(true);
                this.spellBook.destroy(true);
            }
            if (!this.skillTree) {
                this.skillTree = this.add.group();
            } else {
                this.skillTree.closeButtonGroup.destroy(true);
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

            this.skillTree.closeButtonGroup = this.createCloseButton(1180, 0, this.skillTree);
            if (this.activeScene.characters.souls.skillPoints > 0) {
                this.input.setHitArea(this.skillTree.getChildren());
                _.each(this.skillTree.getChildren(), function(item) {
                    item.on('pointerdown', function() {
                        self.events.emit('boughtSkill', item.objectToSend);
                        self.skillTree.closeButtonGroup.destroy(true);
                        panel.destroy();
                        self.openSkillTree(character);
                    });
                });
            }
        }
    });
};