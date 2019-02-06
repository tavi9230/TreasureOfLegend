export const HUDLowerPanel = function (scene) {
    this.scene = scene;
    this.skillTree = null;
    this.spellBook = null;

    this.createLowerPanel = function () {
        //create player hud
        this.scene.turn = 1;
        this.hudbuttons = this.scene.add.group();
        this._createEndTurnButton();
        this._createMenuButton();
        this._createSpellbookButton();
        this._createSkillsButton();
        this._createWalkButton();
        this._createUseMainHandButton();
        this._createUseOffHandButton();
        this._createInventoryButton();
        this._createInspectButton();
        this._createTexts();
        this.scene.input.setHitArea(this.hudbuttons.getChildren());
    };
    this.endTurn = function () {
        this.events.emit('endTurn');
    };
    this.useDash = function () {
        this.scene.events.emit('useDash');
    };
    this.useMainHand = function () {
        this.scene.events.emit('useMainHand');
        this.setButtonTint('useMainHandButton');
    };
    this.toggleActionButtons = function (isVisible) {
        var buttons = this.hudbuttons.getChildren().filter(function (btn) {
            return btn.name === 'useMainHandButton'
                || btn.name === 'useOffHandButton'
                || btn.name === 'inspectButton'
                || btn.name === 'walkButton'
                || btn.name === 'skillsButton'
                || btn.name === 'spellsButton'
                || btn.name === 'inventoryButton';
        });
        _.each(buttons, function (button) {
            button.visible = isVisible;
        });

        buttons = this.hudbuttons.getChildren().filter(function (btn) {
            return btn.name === 'skillsButton';
        });
        buttons[0].visible = isVisible;
        this.scene.soulsText.visible = isVisible;
    };
    this.setButtonTint = function (buttonName) {
        if (buttonName) {
            var button = this.hudbuttons.getChildren().filter(function (button) {
                return button.name === buttonName;
            });
            if (button.length > 0) {
                if (button[0].isTinted) {
                    button[0].clearTint();
                } else {
                    button[0].setTint(0xAA1111);
                }
            }
        } else {
            _.each(this.hudbuttons.getChildren(), function (button) {
                button.clearTint();
            });
        }
    };
    this.selectInspectAction = function () {
        this.setButtonTint('inspectButton');
        this.scene.events.emit('inspectSelected');
    };
    this.openMainMenu = function () {
        this.scene.scene.sleep('HUDScene');
        this.scene.scene.sleep(this.scene.sceneName);
        this.scene.scene.wake('MainMenuScene');
    };
    this.openCharacterInventory = function (character) {
        var char = character && character.type === 'Sprite' ? character : this.scene.activeScene.activeCharacter;
        this.scene.characterStatus.toggleCharacterInfo(char);
    };
    this.openSpellBook = function (character) {
        if (character.characterConfig.isPlayerControlled) {
            this.setButtonTint('spellsButton');
            var self = this;
            if (this.spellBook) {
                this.spellBook.closeButtonGroup.destroy(true);
                this.spellBook.destroy(true);
                this.spellBook = null;
            } else {
                this.spellBook = this.scene.add.group();
                var panel = self.scene.add.graphics();
                panel.fillStyle(0x111111, 0.8);
                panel.fillRect(this.scene.windowWidth - 300, this.scene.windowHeight - 810, 300, 700);
                this.spellBook.add(panel);
                var x = this.scene.windowWidth - 280;
                var y = this.scene.windowHeight - 800;
                _.each(character.characterConfig.inventory.spells, function (spell) {
                    var box = self.scene.add.graphics();
                    box.fillStyle(0xded7c7, 0.8);
                    box.fillRect(x - 10, y, 70, 70);
                    var spellImage = self.scene.add.image(x, y + 10, spell.image).setOrigin(0, 0);
                    spellImage.displayWidth = 50;
                    spellImage.displayHeight = 50;

                    box.objectToSend = spell;
                    spellImage.objectToSend = spell;

                    self.spellBook.add(box);
                    self.spellBook.add(spellImage);
                    x += 80;
                });

                this.spellBook.name = 'spellBook';
                this.spellBook.closeButtonGroup = this.scene.createCloseButton(this.scene.windowWidth - 20, this.scene.windowHeight - 810, this.spellBook);
                this.scene.input.setHitArea(this.spellBook.getChildren());
                _.each(this.spellBook.getChildren(), function (item) {
                    item.on('pointerdown', function () {
                        self.scene.events.emit('spellSelected', item.objectToSend);
                        self.spellBook.destroy(true);
                        self.spellBook.closeButtonGroup.destroy(true);
                        panel.destroy();
                        // Get main attack icon
                        // TODO Change this to call a separate function
                        self.scene.events.emit('getCharacterStartData');
                    });
                });
            }
        }
    };
    this.openSkillTree = function (character) {
        if (character.characterConfig.isPlayerControlled) {
            this.setButtonTint('skillsButton');
            var self = this;
            if (this.skillTree) {
                this.skillTree.closeButtonGroup.destroy(true);
                this.skillTree.destroy(true);
                this.skillTree = null;
            } else {
                this.skillTree = this.scene.add.group();
                var panel = self.scene.add.graphics();
                panel.fillStyle(0x111111, 0.8);
                panel.fillRect(this.scene.windowWidth - 300, this.scene.windowHeight - 810, 300, 700);
                this.skillTree.add(panel);
                var x = this.scene.windowWidth - 280;
                var y = this.scene.windowHeight - 800;
                _.each(character.characterConfig.skillsToBuy, function (skill) {
                    var box = self.scene.add.graphics();
                    box.fillStyle(0xded7c7, 0.8);
                    box.fillRect(x - 10, y, 70, 70);
                    var skillImage = self.scene.add.image(x, y + 10, skill.image).setOrigin(0, 0);
                    skillImage.displayWidth = 50;
                    skillImage.displayHeight = 50;
                    var skillLevelText = self.scene.add.text(x + 22, y + 60, skill.level, { fill: '#FFF' });

                    box.objectToSend = skill;
                    skillImage.objectToSend = skill;
                    skillLevelText.objectToSend = skill;

                    self.skillTree.add(box);
                    self.skillTree.add(skillImage);
                    self.skillTree.add(skillLevelText);
                    x += 80;
                });

                this.skillTree.name = 'skillTree';
                this.skillTree.closeButtonGroup = this.scene.createCloseButton(this.scene.windowWidth - 20, this.scene.windowHeight - 810, this.skillTree);
                if (this.scene.activeScene.characters.souls.skillPoints > 0) {
                    this.scene.input.setHitArea(this.skillTree.getChildren());
                    _.each(this.skillTree.getChildren(), function (item) {
                        item.on('pointerdown', function () {
                            self.scene.events.emit('boughtSkill', item.objectToSend);
                            self.skillTree.closeButtonGroup.destroy(true);
                            panel.destroy();
                            self.openSkillTree(character);
                        });
                    });
                }
            }
        }
    };

    this._createEndTurnButton = function () {
        var endTurnButton = this.scene.add.image(this.scene.windowWidth - 170, this.scene.windowHeight - 150, 'endTurnButton').setOrigin(0, 0);
        endTurnButton.displayWidth = 100;
        endTurnButton.displayHeight = 100;
        endTurnButton.name = 'endTurnButton';
        endTurnButton.on('pointerdown', _.bind(this.endTurn, this.scene));
        endTurnButton.on('pointerover', _.bind(this._showTips, this.scene, endTurnButton.x, endTurnButton.y - 25, 87, 20, 'End Turn'));
        endTurnButton.on('pointerout', _.bind(this._hideTips, this.scene));
        this.hudbuttons.add(endTurnButton);
    };
    this._createMenuButton = function () {
        var openMenuButton = this.scene.add.image(this.scene.windowWidth - 80, this.scene.windowHeight - 60, 'openMenuButton').setOrigin(0, 0);
        openMenuButton.displayHeight = 50;
        openMenuButton.displayWidth = 50;
        openMenuButton.name = 'openMenuButton';
        openMenuButton.on('pointerdown', this.openMainMenu);
        openMenuButton.on('pointerover', _.bind(this._showTips, this.scene, openMenuButton.x - 50, openMenuButton.y - 25, 97, 20, 'Open Menu'));
        openMenuButton.on('pointerout', _.bind(this._hideTips, this.scene));
        this.hudbuttons.add(openMenuButton);
    };
    this._createSpellbookButton = function () {
        var self = this,
            spellsButton = this.scene.add.image(this.scene.windowWidth - 210, this.scene.windowHeight - 180, 'spellsButton').setOrigin(0, 0);
        spellsButton.displayHeight = 50;
        spellsButton.displayWidth = 50;
        spellsButton.name = 'spellsButton';
        spellsButton.on('pointerdown', function () {
            self.openSpellBook(self.scene.activeScene.activeCharacter);
        });
        spellsButton.on('pointerover', _.bind(this._showTips, this.scene, spellsButton.x - 45, spellsButton.y - 25, 148, 20, 'Open Spell Book'));
        spellsButton.on('pointerout', _.bind(this._hideTips, this.scene));
        this.hudbuttons.add(spellsButton);
    };
    this._createSkillsButton = function () {
        var self = this,
            skillsButton = this.scene.add.image(this.scene.windowWidth - 210, this.scene.windowHeight - 60, 'skillsButton').setOrigin(0, 0);
        skillsButton.displayHeight = 50;
        skillsButton.displayWidth = 50;
        skillsButton.name = 'skillsButton';
        skillsButton.on('pointerdown', function () {
            self.openSkillTree(self.scene.activeScene.activeCharacter);
        });
        skillsButton.on('pointerover', _.bind(this._showTips, this.scene, skillsButton.x - 45, skillsButton.y - 25, 152, 20, 'Open Skill List'));
        skillsButton.on('pointerout', _.bind(this._hideTips, this.scene));
        this.hudbuttons.add(skillsButton);
    };
    this._createWalkButton = function () {
        var walkButton = this.scene.add.image(this.scene.windowWidth - 80, this.scene.windowHeight - 180, 'walkButton').setOrigin(0, 0);
        walkButton.displayHeight = 50;
        walkButton.displayWidth = 50;
        walkButton.name = 'walkButton';
        walkButton.on('pointerdown', _.bind(this.useDash, this));
        walkButton.on('pointerover', _.bind(this._showTips, this.scene, walkButton.x, walkButton.y - 25, 48, 20, 'Dash'));
        walkButton.on('pointerout', _.bind(this._hideTips, this.scene));
        this.hudbuttons.add(walkButton);
    };
    this._createUseMainHandButton = function () {
        var useMainHandButton = this.scene.add.image(this.scene.windowWidth - 145, this.scene.windowHeight - 210, 'mainHandButton').setOrigin(0, 0);
        useMainHandButton.displayHeight = 50;
        useMainHandButton.displayWidth = 50;
        useMainHandButton.name = 'useMainHandButton';
        useMainHandButton.on('pointerdown', _.bind(this.useMainHand, this));
        useMainHandButton.on('pointerover', _.bind(this._showTips, this.scene, useMainHandButton.x - 30, useMainHandButton.y - 25, 134, 20, 'Use Main Hand'));
        useMainHandButton.on('pointerout', _.bind(this._hideTips, this.scene));
        this.hudbuttons.add(useMainHandButton);
    };
    this._createUseOffHandButton = function () {
        var useOffHandButton = this.scene.add.image(this.scene.windowWidth - 145, this.scene.windowHeight - 270, 'offHandButton').setOrigin(0, 0);
        useOffHandButton.displayHeight = 50;
        useOffHandButton.displayWidth = 50;
        useOffHandButton.name = 'useOffHandButton';
        //useOffHandButtonButton.on('pointerdown', _.bind(this._openMainMenu, this.scene));
        useOffHandButton.on('pointerover', _.bind(this._showTips, this.scene, useOffHandButton.x - 25, useOffHandButton.y - 25, 117, 20, 'Use Offhand'));
        useOffHandButton.on('pointerout', _.bind(this._hideTips, this.scene));
        this.hudbuttons.add(useOffHandButton);
    };
    this._createInventoryButton = function () {
        var inventoryButton = this.scene.add.image(this.scene.windowWidth - 230, this.scene.windowHeight - 120, 'inventoryButton').setOrigin(0, 0);
        inventoryButton.displayHeight = 50;
        inventoryButton.displayWidth = 50;
        inventoryButton.name = 'inventoryButton';
        inventoryButton.on('pointerdown', _.bind(this.openCharacterInventory, this));
        inventoryButton.on('pointerover', _.bind(this._showTips, this.scene, inventoryButton.x - 30, inventoryButton.y - 25, 143, 20, 'Open Inventory'));
        inventoryButton.on('pointerout', _.bind(this._hideTips, this.scene));
        this.hudbuttons.add(inventoryButton);
    };
    this._createInspectButton = function () {
        var inspectButton = this.scene.add.image(this.scene.windowWidth - 60, this.scene.windowHeight - 120, 'inspectButton').setOrigin(0, 0);
        inspectButton.displayHeight = 50;
        inspectButton.displayWidth = 50;
        inspectButton.name = 'inspectButton';
        inspectButton.on('pointerdown', _.bind(this.selectInspectAction, this));
        inspectButton.on('pointerover', _.bind(this._showTips, this.scene, inspectButton.x - 20, inspectButton.y - 25, 75, 20, 'Inspect'));
        inspectButton.on('pointerout', _.bind(this._hideTips, this.scene));
        this.hudbuttons.add(inspectButton);
    };
    this._createTexts = function () {
        this.scene.soulsText = this.scene.add.text(this.scene.windowWidth - 193, this.scene.windowHeight - 30, '0', { fill: '#D22' });
        this.scene.locationText = this.scene.add.text(this.scene.windowWidth - 160, this.scene.windowHeight - 20, 'X:0, Y:0', { fill: '#FFF' });
        this.scene.turnText = this.scene.add.text(this.scene.windowWidth - 125, this.scene.windowHeight - 92, this.scene.turn, { fill: '#FFF' });
    };
    this._showTips = function (x, y, width, height, textToShow) {
        this.tipsPanel = this.add.graphics();
        this.tipsPanel.fillStyle(0x111111, 1);
        this.tipsPanel.fillRect(x, y, width, height);
        this.tipsText = this.add.text(x + 5, y + 2, textToShow, { fill: '#FFF' });
    };
    this._hideTips = function () {
        this.tipsText.destroy();
        this.tipsPanel.destroy();
    };
};