import { AssetLoader } from 'Aniwars/Helpers/assetLoader';
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
        // PRIVATE ---------------------------------------------------------------------------------------------------------------------------------------
        _addEvents: function () {
            var self = this;
            this.activeScene = this.scene.get(this.sceneName);

            this.activeScene.events.on('updateSouls', function (souls) {
                self.lowerPanel.soulsText.setText(souls.current);
            });
            this.activeScene.events.on('showCharacterInitiative', _.bind(this.showCharacterInitiative, this));
            this.activeScene.events.on('endEnemyTurn', _.bind(this.lowerPanel.endTurn, this));
            this.activeScene.events.on('showDeadCharacterInventory', function (lootbag) {
                self.characterStatus.openCharacterInventoryAndLootbag(lootbag);
            });
            this.activeScene.events.on('closeLootbag', _.bind(this.characterStatus.closeLootbag, this.characterStatus));
            this.activeScene.events.on('updateAttributePointsPanel', function (character) {
                self.characterStatus.openDescriptionTab(character);
            });
            this.activeScene.events.on('updateStats', function (character) {
                self.characterStatus.openDescriptionTab(character);
            });
            this.activeScene.events.on('changeTurnCounter', function () {
                self.lowerPanel.changeTurn();
            });
            this.activeScene.events.on('showCharacterInventory', function (character) {
                self.characterStatus.openInventoryTab(character);
            });
            this.activeScene.events.on('refreshCharacterInventory', function (character) {
                self.characterStatus.refreshInventoryTab(character);
            });
            this.activeScene.events.on('toggleActionButtons', _.bind(this.lowerPanel.toggleActionButtons, this.lowerPanel));
            this.activeScene.events.on('deselectButtons', _.bind(this.lowerPanel.deselectAllButtons, this.lowerPanel));
            this.activeScene.events.on('showSelectedActionIcon', _.bind(this.lowerPanel.showSelectedActionIcon, this.lowerPanel));
            this.activeScene.events.on('removeSelectedActionIcon', _.bind(this.lowerPanel.removeSelectedActionIcon, this.lowerPanel));
            this.activeScene.events.on('closeCharacterInfoTab', _.bind(this.characterStatus.destroyAllCharacterGroups, this.characterStatus));
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
            if (index === 0) {
                this.selectedActionX = frameImage.x + frameImage.displayWidth - offset - iconDimensions;
                this.selectedActionY = frameImage.y + ((frameImage.displayHeight / 3) * 2) + offset;
            }
        },
        _createQuickStatIcon: function (x, y, imageName, value, style, iconDimensions) {
            var image = this.add.image(x, y, imageName).setOrigin(0, 0),
                text = this.add.text(value < 10 && value >= 0 ? x + (iconDimensions === 30 ? 10 : 12) : x + (iconDimensions === 30 ? 3 : 5),
                    y + (iconDimensions === 30 ? 7 : 10), value, style);
            image.displayHeight = iconDimensions;
            image.displayWidth = iconDimensions;
            this.initiativeTracker.add(image);
            this.initiativeTracker.add(text);
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
                } else if (this.keycodes.s.isDown && !this.spellsButtonIsDown) {
                    this.spellsButtonIsDown = true;
                    this.lowerPanel.openSpellBook(this.activeScene.activeCharacter);
                } else if (this.keycodes.d.isDown && !this.offhandButtonIsDown) {
                    this.offhandButtonIsDown = true;
                    this.lowerPanel.useOffHand();
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