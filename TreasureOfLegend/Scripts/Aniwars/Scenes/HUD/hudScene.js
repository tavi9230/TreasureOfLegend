import { AssetLoader } from 'Aniwars/Helpers/assetLoader';
import { EnumHelper } from 'Aniwars/Helpers/enumHelper';
import { HUDLowerPanel } from 'Aniwars/Scenes/HUD/lowerPanel';
import { HUDCharacterStatus } from 'Aniwars/Scenes/HUD/characterStatus';
import { TipsModal } from 'Aniwars/Scenes/HUD/Helpers/tipsModal';

export const HUDScene = function (sceneName) {
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
        update() {
            this._checkShortcutKeys();
        },
        create() {
            var self = this;
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;
            this.lowerPanel = new HUDLowerPanel(this);
            this.lowerPanel.createLowerPanel();
            this.characterStatus = new HUDCharacterStatus(this);
            this.tipsModal = new TipsModal(this);
            this._addEvents();
            this.events.emit('getCharacterStartData');

            this.resize = function () {
                self.windowWidth = window.innerWidth;
                self.windowHeight = window.innerHeight;
            };
            window.addEventListener('resize', this.resize, false);
            this.createKeys();
        },
        createKeys: function () {
            this.keycodes = {
                w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                e: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
                a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                tab: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB),
                esc: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
            };
        },
        getTurn: function () {
            return this.lowerPanel.turn;
        },
        showItemStats: function (config) {
            if (config.item.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                var item = config.item,
                    compareBox = this.add.graphics();
                compareBox.fillStyle(0x222222, 1);
                compareBox.fillRect(config.x + 50, config.y, 150, 150);

                this.itemStats = this.add.group();
                this.itemStats.add(compareBox);

                if (item.type === EnumHelper.inventoryEnum.mainHand) {
                    this._createItemStatsBox(item, config.character.characterConfig, config.x, config.y, 'mainHand');
                } else if (item.type === EnumHelper.inventoryEnum.offHand) {
                    this._createItemStatsBox(item, config.character.characterConfig, config.x, config.y, 'offHand');
                } else if (item.type === EnumHelper.inventoryEnum.head) {
                    this._createItemStatsBox(item, config.character.characterConfig, config.x, config.y, 'head');
                } else if (item.type === EnumHelper.inventoryEnum.body) {
                    this._createItemStatsBox(item, config.character.characterConfig, config.x, config.y, 'body');
                } else if (item.type === EnumHelper.inventoryEnum.hands) {
                    this._createItemStatsBox(item, config.character.characterConfig, config.x, config.y, 'hands');
                } else if (item.type === EnumHelper.inventoryEnum.feet) {
                    this._createItemStatsBox(item, config.character.characterConfig, config.x, config.y, 'feet');
                }
            }
        },
        hideItemStats: function () {
            if (this.itemStats) {
                this.itemStats.destroy(true);
            }
        },
        showCharacterInitiative: function (characters) {
            var self = this;
            var x = 0;
            var y = this.windowHeight - 280;
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
            var index = 0;
            _.each(characters, function (character) {
                var charConfig = character.characterConfig;
                var box = self.add.graphics();
                charConfig.isPlayerControlled
                    ? box.fillStyle(0x38b82c, 1)
                    : box.fillStyle(0xd6603c, 1);
                index === 0
                    ? box.fillRect(x, y, 280, 280)
                    : box.fillRect(x, y, 140, 140);
                box.name = 'initiativeBox';

                var frameImage = self.add.image(x, y, 'characterFrame').setOrigin(0, 0);
                frameImage.displayWidth = index === 0 ? 280 : 140;
                frameImage.displayHeight = index === 0 ? 280 : 140;
                var characterImage = self.add.image(x, y + 20, charConfig.image).setOrigin(0, 0);
                characterImage.displayHeight = index === 0 ? 250 : 100;
                characterImage.displayWidth = character.displayWidth * (characterImage.displayHeight / characterImage.height);
                characterImage.setX(characterImage.x + (((index === 0 ? 280 : 140) - characterImage.displayWidth) / 2));

                characterImage.objectToSend = character;
                self._showQuickStats(character, frameImage, index);

                self.initiativeTracker.add(frameImage);
                self.initiativeTracker.add(box);
                self.initiativeTrackerImages.add(characterImage);
                x += index === 0 ? 285 : 145;
                if (index === 0) {
                    y += 140;
                }
                index++;
            });
            this.input.setHitArea(this.initiativeTrackerImages.getChildren());
            _.each(this.initiativeTrackerImages.getChildren(), function (item) {
                item.on('pointerover', function () {
                    self.events.emit('highlightCharacter', item.objectToSend);
                });
                item.on('pointerout', function () {
                    self.events.emit('dehighlightCharacter', item.objectToSend);
                });
            });
        },
        showDeadCharacterInventory: function (lootbag) {
            this.closeLootbag();
            var activeCharacter = this.activeScene.activeCharacter,
                lootbagConfig = lootbag.objectConfig,
                characterBelonging = lootbagConfig.belongsTo.characterConfig,
                panel = this.add.graphics();
            this.enemyInventory = this.add.group();
            panel.fillStyle(0x111111, 0.8);
            panel.fillRect(470, 0, 220, 440);
            this.enemyInventory.add(panel);
            this.characterStatus.openInventoryTab(activeCharacter);
            var x = 480;
            var y = 10;
            var image;
            var self = this;
            y = this._addToEnemyInventory('mainHand', characterBelonging, x, y);
            y = this._addToEnemyInventory('offHand', characterBelonging, x, y);
            y = this._addToEnemyInventory('head', characterBelonging, x, y);
            y = this._addToEnemyInventory('body', characterBelonging, x, y);
            y = this._addToEnemyInventory('hands', characterBelonging, x, y);
            y = this._addToEnemyInventory('feet', characterBelonging, x, y);
            if (characterBelonging.inventory.slots.items.length > 0) {
                _.each(characterBelonging.inventory.slots.items, function (item) {
                    item.isEquipped = false;
                    image = self.add.image(x, y, item.image).setOrigin(0, 0);
                    image.displayWidth = 50;
                    image.displayHeight = 50;
                    image.objectToSend = item;
                    self.enemyInventory.add(image);
                    y += 60;
                });
            }
            this.input.setHitArea(this.enemyInventory.getChildren());
            _.each(this.enemyInventory.getChildren(), function (item) {
                item.on('pointerdown', function () {
                    self.events.emit('getItemFromLootBag', { item: item.objectToSend, lootbag: lootbag });
                });
                item.on('pointerover', _.bind(self.showItemStats, self, { x: item.x, y: item.y, item: item.objectToSend, character: activeCharacter }));
                item.on('pointerout', _.bind(self.hideItemStats, self));
            });
        },
        closeLootbag: function () {
            if (this.enemyInventory) {
                this.enemyInventory.destroy(true);
                this.hideItemStats();
            }
        },
        inspect: function (object) {
            // TODO: Disable right click menu on canvas
            // TODO: Panel location should be where you click instead of relative position of object
            // TODO: Fit text to box and box to text
            if (this.inspectionBox) {
                this.inspectionBox.destroy(true);
            }
            this.inspectionBox = this.add.group();
            var panel = this.add.graphics(),
                textPanel,
                text = '',
                x = object.x,
                y = object.y,
                style = {
                    fontSize: 20,
                    wordWrap: { width: 96, useAdvancedWrap: true }
                };
            if (object.objectConfig) {
                text = object.objectConfig.description;
            } else if (object.characterConfig) {
                text = object.characterConfig.description;
            }
            if (x === this.activeScene.activeMap.levelMap[0].length * 50 - 50) {
                x -= 100;
            }
            if (y === this.activeScene.activeMap.levelMap.length * 50 - 50) {
                y -= 100;
            }
            panel.fillStyle(0x111111, 1);
            panel.fillRect(x, y, 100, 100);
            textPanel = this.add.text(x + 2, y + 2, text, style);
            this.inspectionBox.add(panel);
            this.inspectionBox.add(textPanel);
        },
        closeInspect: function () {
            if (this.inspectionBox) {
                this.inspectionBox.destroy(true);
            }
        },
        // PRIVATE ---------------------------------------------------------------------------------------------------------------------------------------
        _addEvents: function () {
            var self = this;
            this.activeScene = this.scene.get(this.sceneName);

            this.activeScene.events.on('updateSouls', function (souls) {
                self.soulsText.setText(souls.current);
            });
            this.activeScene.events.on('showCharacterInitiative', _.bind(this.showCharacterInitiative, this));
            this.activeScene.events.on('endEnemyTurn', _.bind(this.lowerPanel.endTurn, this));
            this.activeScene.events.on('showDeadCharacterInventory', _.bind(this.showDeadCharacterInventory, this));
            this.activeScene.events.on('closeLootbag', _.bind(this.closeLootbag, this));
            this.activeScene.events.on('updateAttributePointsPanel', function (character) {
                self.characterStatus.openDescriptionTab(character);
            });
            this.activeScene.events.on('updateStats', function (character) {
                self.characterStatus.openDescriptionTab(character);
            });
            this.activeScene.events.on('changeTurnCounter', function () {
                self.lowerPanel.changeTurn();
            });
            this.activeScene.events.on('inspect', _.bind(this.inspect, this));
            this.activeScene.events.on('closeInspect', _.bind(this.closeInspect, this));
            this.activeScene.events.on('showCharacterInventory', function (character) {
                self.characterStatus.openInventoryTab(character);
            });
            this.activeScene.events.on('toggleActionButtons', _.bind(this.lowerPanel.toggleActionButtons, this.lowerPanel));
            this.activeScene.events.on('clearButtonTint', _.bind(this.lowerPanel.setButtonTint, this.lowerPanel));
        },
        _addToEnemyInventory: function (location, characterBelonging, x, y) {
            if (characterBelonging.inventory[location].type !== EnumHelper.inventoryEnum.defaultEquipment) {
                characterBelonging.inventory[location].isEquipped = false;
                var image = this.add.image(x, y, characterBelonging.inventory[location].image).setOrigin(0, 0);
                image.displayWidth = 50;
                image.displayHeight = 50;
                image.objectToSend = characterBelonging.inventory[location];
                this.enemyInventory.add(image);
                y += 60;
            }
            return y;
        },
        _showQuickStats: function (character, frameImage, index) {
            var textStyle = {
                fontSize: index === 0 ? 40 : 20,
                wordWrap: { width: 96, useAdvancedWrap: true }
            },
                charConfig = character.characterConfig,
                offset = index === 0 ? 20 : 10,
                iconDimensions = index === 0 ? 50 : 30;
            this._createQuickStatIcon(frameImage.x + offset, frameImage.y + ((frameImage.displayHeight / 3) * 0) + offset,
                'healthIcon', charConfig.life.current, textStyle, iconDimensions);
            this._createQuickStatIcon(frameImage.x + offset, frameImage.y + ((frameImage.displayHeight / 3) * 1) + offset,
                'manaIcon', (charConfig.mana.max - charConfig.mana.spent), textStyle, iconDimensions);
            this._createQuickStatIcon(frameImage.x + offset, frameImage.y + ((frameImage.displayHeight / 3) * 2) + offset,
                'armorIcon', charConfig.armor, textStyle, iconDimensions);
            this._createQuickStatIcon(frameImage.x + frameImage.displayWidth - offset - iconDimensions, frameImage.y + ((frameImage.displayHeight / 3) * 0) + offset,
                'movementIcon', (charConfig.movement.max - charConfig.movement.spent), textStyle, iconDimensions);
            this._createQuickStatIcon(frameImage.x + frameImage.displayWidth - offset - iconDimensions, frameImage.y + ((frameImage.displayHeight / 3) * 1) + offset,
                'energyIcon', (charConfig.energy.max - charConfig.energy.spent), textStyle, iconDimensions);
            var locationXText = this.add.text(frameImage.x + (index === 0 ? 80 : 60), frameImage.y + ((frameImage.displayHeight / 3) * 2) + offset,
                'X:' + (character.x / 50), { fontSize: index === 0 ? 30 : 15, color: '#000000' });
            var locationYText = this.add.text(frameImage.x + (index === 0 ? 80 : 60), frameImage.y + ((frameImage.displayHeight / 3) * 2) + offset + (index === 0 ? 30 : 15),
                'Y:' + (character.y / 50), { fontSize: index === 0 ? 30 : 15, color: '#000000' });
            this.initiativeTracker.add(locationXText);
            this.initiativeTracker.add(locationYText);
        },
        _createQuickStatIcon: function (x, y, imageName, value, style, iconDimensions) {
            var image = this.add.image(x, y, imageName).setOrigin(0, 0),
                text = this.add.text(value < 10 && value > 0 ? x + (iconDimensions === 30 ? 10 : 12) : x + (iconDimensions === 30 ? 3 : 5),
                    y + (iconDimensions === 30 ? 7 : 10), value, style);
            image.displayHeight = iconDimensions;
            image.displayWidth = iconDimensions;
            this.initiativeTracker.add(image);
            this.initiativeTracker.add(text);
        },
        _createItemStatsBox: function (item, characterConfig, x, y, location) {
            var damage = '',
                nameText, descriptionText, damageText, rangeText, holdText,
                equippedBox, equippedNameText, equippedDescriptionText, equippedDamageText, equippedRangeText, equippedHoldText,
                damageArray = ['slashing', 'piercing', 'bludgeoning', 'fire'],
                textStyle = {
                    fill: '#FFF',
                    wordWrap: {
                        width: 145
                    }
                },
                itemHasDamage = item.damage,
                equippedHasDamage;
            if (itemHasDamage) {
                var damage = '';
                for (let i = 0; i < item.damage.length; i++) {
                    if (i !== item.damage.length - 1) {
                        damage += item.damage[0].value + ' ' + damageArray[item.damage[0].type - 1] + ', ';
                    } else {
                        damage += item.damage[0].value + ' ' + damageArray[item.damage[0].type - 1];
                    }
                }
                damageText = this.add.text(x + 55, y + 60, 'Damage: ' + damage, textStyle);
            } else {
                damageText = this.add.text(x + 55, y + 60, 'Armor: ' + item.armor, textStyle);
            }
            nameText = this.add.text(x + 55, y, item.name, textStyle);
            descriptionText = this.add.text(x + 55, y + 30, item.description, textStyle);
            if (itemHasDamage) {
                rangeText = this.add.text(x + 55, y + 105, 'Range: ' + item.range, textStyle);
                holdText = this.add.text(x + 55, y + 120, 'Hold: ' + item.hold, textStyle);
                this.itemStats.add(rangeText);
                this.itemStats.add(holdText);
            }
            this.itemStats.add(nameText);
            this.itemStats.add(descriptionText);
            this.itemStats.add(damageText);
            if (characterConfig.inventory[location].type !== EnumHelper.inventoryEnum.defaultEquipment && !item.isEquipped) {
                equippedBox = this.add.graphics();
                equippedBox.fillStyle(0x222222, 1);
                equippedBox.fillRect(x + 200, y, 150, 150);
                equippedHasDamage = characterConfig.inventory[location].damage;
                if (equippedHasDamage) {
                    damage = '';
                    for (let i = 0; i < characterConfig.inventory[location].damage.length; i++) {
                        if (i !== item.damage.length - 1) {
                            damage += item.damage[0].value + ' ' + damageArray[item.damage[0].type - 1] + ', ';
                        } else {
                            damage += item.damage[0].value + ' ' + damageArray[item.damage[0].type - 1];
                        }
                    }
                    equippedDamageText = this.add.text(x + 205, y + 60, 'Damage: ' + damage, textStyle);
                } else {
                    equippedDamageText = this.add.text(x + 205, y + 60, 'Armor: ' + characterConfig.inventory[location].armor, textStyle);
                }
                equippedNameText = this.add.text(x + 205, y, characterConfig.inventory[location].name, textStyle);
                equippedDescriptionText = this.add.text(x + 205, y + 30, characterConfig.inventory[location].description, textStyle);
                if (equippedHasDamage) {
                    equippedRangeText = this.add.text(x + 205, y + 105, 'Range: ' + characterConfig.inventory[location].range, textStyle);
                    equippedHoldText = this.add.text(x + 205, y + 120, 'Hold: ' + characterConfig.inventory[location].hold, textStyle);
                    this.itemStats.add(equippedRangeText);
                    this.itemStats.add(equippedHoldText);
                }
                this.itemStats.add(equippedBox);
                this.itemStats.add(equippedNameText);
                this.itemStats.add(equippedDescriptionText);
                this.itemStats.add(equippedDamageText);
            }
        },
        _checkShortcutKeys() {
            if (this.activeScene.activeCharacter.characterConfig.isPlayerControlled) {
                if (this.keycodes.w.isDown) {
                    this.lowerPanel.useDash();
                } else if (this.keycodes.e.isDown && !this.inspectButtonIsDown) {
                    this.inspectButtonIsDown = true;
                    this.lowerPanel.selectInspectAction();
                } else if (this.keycodes.a.isDown && !this.mainHandButtonIsDown) {
                    this.mainHandButtonIsDown = true;
                    this.lowerPanel.useMainHand();
                    // TODO: Select attack action
                } else if (this.keycodes.s.isDown && !this.spellsButtonIsDown) {
                    //TODO: Change this to selected character?
                    this.spellsButtonIsDown = true;
                    this.lowerPanel.openSpellBook(this.activeScene.activeCharacter);
                } else if (this.keycodes.d.isDown && !this.offhandButtonIsDown) {
                    this.offhandButtonIsDown = true;
                    // TODO: Select offHand action
                } else if (this.keycodes.esc.isDown) {
                    this.keycodes.esc.isDown = false;
                    this.lowerPanel.openMainMenu();
                } else if (this.keycodes.tab.isDown && !this.inventoryButtonIsDown) {
                    this.inventoryButtonIsDown = true;
                    this.lowerPanel.openCharacterInventory();
                }
            }

            if (this.keycodes.e.isUp) {
                this.inspectButtonIsDown = false;
            }
            if (this.keycodes.a.isUp) {
                this.mainHandButtonIsDown = false;
            }
            if (this.keycodes.s.isUp) {
                this.spellsButtonIsDown = false;
            }
            if (this.keycodes.d.isUp) {
                this.offhandButtonIsDown = false;
            }
            if (this.keycodes.tab.isUp) {
                this.inventoryButtonIsDown = false;
            }
        }
    });
};