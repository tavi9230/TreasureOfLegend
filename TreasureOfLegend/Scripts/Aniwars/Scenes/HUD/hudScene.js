import { AssetLoader } from 'Aniwars/Helpers/assetLoader';
import { EnumHelper } from 'Aniwars/Helpers/enumHelper';
import { HUDLowerPanel } from 'Aniwars/Scenes/HUD/lowerPanel';
import { HUDCharacterStatus } from 'Aniwars/Scenes/HUD/characterStatus';

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
                q: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
                a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                tab: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB),
                esc: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
            };
        },
        getTurn: function () {
            return this.turn;
        },
        createCloseButton: function (x, y, groupToDestroy) {
            var self = this,
                closeButtonGroup = this.add.group();

            var closeButton = this.add.graphics();
            closeButton.fillStyle(0x990000, 0.8);
            closeButton.fillRect(x, y, 20, 20);
            closeButtonGroup.add(closeButton);

            var closeText = this.add.text(x + 5, y + 2, 'X', { fill: '#FFF', fontSize: '18px' });
            closeButtonGroup.add(closeText);
            this.input.setHitArea(closeButtonGroup.getChildren());
            _.each(closeButtonGroup.getChildren(), function (item) {
                item.on('pointerdown', function () {
                    groupToDestroy.destroy(true);
                    if (groupToDestroy.name === 'characterInfo') {
                        self.characterStatus.isCharacterInfoMenuOpen = false;
                        if (self.characterStatus.attributesInfo) {
                            self.characterStatus.attributesInfo.destroy(true);
                        }
                        if (self.characterStatus.attributesInfoBox) {
                            self.characterStatus.attributesInfoBox.destroy(true);
                        }
                        //self.lowerPanel.setButtonTint('inventoryButton');
                    } else if (groupToDestroy.name === 'spellBook') {
                        self.lowerPanel.setButtonTint('spellsButton');
                        self.lowerPanel.spellBook = null;
                    } else if (groupToDestroy.name === 'skillTree') {
                        self.lowerPanel.setButtonTint('skillsButton');
                        self.lowerPanel.skillTree = null;
                    }
                    if (self.enemyInventory) {
                        self.enemyInventory.destroy(true);
                    }
                    closeButtonGroup.destroy(true);
                });
            });
            return closeButtonGroup;
        },
        showItemStats: function (config) {
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
        hideItemStats: function () {
            if (this.itemStats) {
                this.itemStats.destroy(true);
            }
        },
        showCharacterInitiative: function (characters) {
            var self = this;
            var x = 0;
            var y = this.windowHeight - 200;
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
                    ? box.fillRect(x, y, 200, 200)
                    : box.fillRect(x, y, 100, 100);
                box.name = 'initiativeBox';

                var characterImage = self.add.image(x, y, charConfig.image).setOrigin(0, 0);
                characterImage.displayWidth = index === 0 ? 200 : 100;
                characterImage.displayHeight = index === 0 ? 200 : 100;

                characterImage.objectToSend = character;

                self.initiativeTracker.add(box);
                self.initiativeTrackerImages.add(characterImage);
                x += index === 0 ? 205 : 105;
                if (index === 0) {
                    y += 100;
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
                _.each(characterBelonging.inventory.slots.items, function (item) {
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
            this.lowerPanel.setButtonTint('inspectButton');
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

            this.activeScene.events.on('activeCharacterPositionModified', function (character) {
                self.locationText.setText('X:' + Math.floor(character.x / 50) + ', Y:' + Math.floor(character.y / 50));
            });
            this.activeScene.events.on('updateSouls', function (souls) {
                self.soulsText.setText(souls.current);
            });
            this.activeScene.events.on('showCharacterInitiative', _.bind(this.showCharacterInitiative, this));
            this.activeScene.events.on('endEnemyTurn', _.bind(this.lowerPanel.endTurn, this));
            this.activeScene.events.on('showDeadCharacterInventory', _.bind(this.showDeadCharacterInventory, this));
            this.activeScene.events.on('closeLootbag', _.bind(this.closeLootbag, this));
            this.activeScene.events.on('updateAttributePointsPanel', function (character) {
                self.characterStatus.showAttributePointSelection(character);
            });
            this.activeScene.events.on('changeTurnCounter', function () {
                self.turn++;
                self.turnText.setText(self.turn);
            });
            this.activeScene.events.on('inspect', _.bind(this.inspect, this));
            this.activeScene.events.on('closeInspect', _.bind(this.closeInspect, this));
            this.activeScene.events.on('showCharacterInventory', _.bind(this.lowerPanel.openCharacterInventory, this.lowerPanel));
            this.activeScene.events.on('toggleActionButtons', _.bind(this.lowerPanel.toggleActionButtons, this.lowerPanel));
        },
        _addToEnemyInventory: function (location, characterBelonging, x, y) {
            if (characterBelonging.inventory[location].type !== EnumHelper.inventoryEnum.defaultEquipment) {
                var image = this.add.image(x, y, characterBelonging.inventory[location].image).setOrigin(0, 0);
                image.displayWidth = 50;
                image.displayHeight = 50;
                image.objectToSend = characterBelonging.inventory[location];
                this.enemyInventory.add(image);
                y += 60;
            }
            return y;
        },
        _checkShortcutKeys() {
            if (this.activeScene.activeCharacter.characterConfig.isPlayerControlled) {
                if (this.keycodes.w.isDown) {
                    this.lowerPanel.useDash();
                } else if (this.keycodes.e.isDown && !this.inspectButtonIsDown) {
                    this.inspectButtonIsDown = true;
                    this.lowerPanel.selectInspectAction();
                } else if (this.keycodes.q.isDown && !this.skillsButtonIsDown) {
                    this.skillsButtonIsDown = true;
                    // TODO: Show skills menu
                    //TODO: Change this to selected character?
                    this.lowerPanel.openSkillTree(this.activeScene.activeCharacter);
                } else if (this.keycodes.a.isDown && !this.mainHandButtonIsDown) {
                    this.mainHandButtonIsDown = true;
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
            if (this.keycodes.q.isUp) {
                this.skillsButtonIsDown = false;
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