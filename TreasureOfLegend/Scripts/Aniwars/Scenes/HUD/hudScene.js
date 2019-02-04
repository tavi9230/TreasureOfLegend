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
            this.lowerPanel = new HUDLowerPanel(this);
            this.lowerPanel.createLowerPanel();
            this.characterStatus = new HUDCharacterStatus(this);
            this._addEvents();
            this.events.emit('getCharacterStartData');
        },
        getTurn: function() {
            return this.turn;
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
        showCharacterInitiative: function(characters) {
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
        showDeadCharacterInventory: function(lootbag) {
            this.closeLootbag();
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
            y = this._addToEnemyInventory('mainHand', characterBelonging, x, y);
            y = this._addToEnemyInventory('offHand', characterBelonging, x, y);
            y = this._addToEnemyInventory('head', characterBelonging, x, y);
            y = this._addToEnemyInventory('body', characterBelonging, x, y);
            y = this._addToEnemyInventory('hands', characterBelonging, x, y);
            y = this._addToEnemyInventory('feet', characterBelonging, x, y);
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
        closeLootbag: function() {
            if (this.enemyInventory) {
                this.enemyInventory.destroy(true);
                this.hideItemStats();
            }
        },
        // PRIVATE ---------------------------------------------------------------------------------------------------------------------------------------
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
            this.activeScene.events.on('showCharacterInitiative', _.bind(this.showCharacterInitiative, this));
            this.activeScene.events.on('endEnemyTurn', _.bind(this.lowerPanel.endTurn, this));
            this.activeScene.events.on('showDeadCharacterInventory', _.bind(this.showDeadCharacterInventory, this));
            this.activeScene.events.on('closeLootbag', _.bind(this.closeLootbag, this));
            this.activeScene.events.on('updateAttributePointsPanel', function(character) {
                self.characterStatus.showAttributePointSelection(character);
            });
            this.activeScene.events.on('changeTurnCounter', function() {
                self.turn++;
                self.turnText.setText(self.turn);
            });
        },
        _addToEnemyInventory: function(location, characterBelonging, x, y) {
            if (characterBelonging.inventory[location].type !== EnumHelper.inventoryEnum.defaultEquipment) {
                var image = this.add.image(x, y, characterBelonging.inventory[location].image).setOrigin(0, 0);
                image.displayWidth = 50;
                image.displayHeight = 50;
                image.objectToSend = characterBelonging.inventory[location];
                this.enemyInventory.add(image);
                y += 60;
            }
            return y;
        }
    });
};