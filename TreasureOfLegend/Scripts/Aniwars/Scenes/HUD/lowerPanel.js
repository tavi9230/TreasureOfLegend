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
        this._createSoulsButton();
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
        //this.setButtonTint('useMainHandButton');
    };
    this.toggleActionButtons = function (isVisible) {
        var buttons = this.hudbuttons.getChildren().filter(function (btn) {
            return btn.name === 'useMainHandButton'
                || btn.name === 'useOffHandButton'
                || btn.name === 'inspectButton'
                || btn.name === 'walkButton'
                || btn.name === 'soulsButton'
                || btn.name === 'spellsButton'
                || btn.name === 'inventoryButton';
        });
        _.each(buttons, function (button) {
            button.visible = isVisible;
        });

        buttons = this.hudbuttons.getChildren().filter(function (btn) {
            return btn.name === 'soulsButton';
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
        //this.setButtonTint('inspectButton');
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
        var x = character.characterConfig.isPlayerControlled ? 0 : this.scene.windowWidth - 440,
            y = 0;
        // TODO: Implement a toggle system
        this.scene.characterStatus._showCharacterAbilities(character, x, y);
    };
    this.showTips = function (x, y, width, height, textToShow) {
        this.tipsPanel = this.add.graphics();
        this.tipsPanel.fillStyle(0x111111, 1);
        this.tipsPanel.fillRect(x, y, width, height);
        this.tipsText = this.add.text(x + 5, y + 2, textToShow, { fill: '#FFF' });
    };
    this.hideTips = function () {
        this.tipsText.destroy();
        this.tipsPanel.destroy();
    };

    this._createEndTurnButton = function () {
        var endTurnButton = this.scene.add.image(this.scene.windowWidth - 170, this.scene.windowHeight - 150, 'endTurnButton').setOrigin(0, 0);
        endTurnButton.displayWidth = 100;
        endTurnButton.displayHeight = 100;
        endTurnButton.name = 'endTurnButton';
        endTurnButton.on('pointerdown', _.bind(this.endTurn, this.scene));
        endTurnButton.on('pointerover', _.bind(this.showTips, this.scene, endTurnButton.x, endTurnButton.y - 25, 87, 20, 'End Turn'));
        endTurnButton.on('pointerout', _.bind(this.hideTips, this.scene));
        this.hudbuttons.add(endTurnButton);
    };
    this._createMenuButton = function () {
        var openMenuButton = this.scene.add.image(this.scene.windowWidth - 80, this.scene.windowHeight - 60, 'openMenuButton').setOrigin(0, 0);
        openMenuButton.displayHeight = 50;
        openMenuButton.displayWidth = 50;
        openMenuButton.name = 'openMenuButton';
        openMenuButton.on('pointerdown', this.openMainMenu);
        openMenuButton.on('pointerover', _.bind(this.showTips, this.scene, openMenuButton.x - 50, openMenuButton.y - 25, 97, 20, 'Open Menu'));
        openMenuButton.on('pointerout', _.bind(this.hideTips, this.scene));
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
        spellsButton.on('pointerover', _.bind(this.showTips, this.scene, spellsButton.x - 45, spellsButton.y - 25, 148, 20, 'Open Spell Book'));
        spellsButton.on('pointerout', _.bind(this.hideTips, this.scene));
        this.hudbuttons.add(spellsButton);
    };
    this._createSoulsButton = function () {
        var self = this,
            soulsButton = this.scene.add.image(this.scene.windowWidth - 210, this.scene.windowHeight - 60, 'soulsButton').setOrigin(0, 0);
        soulsButton.displayHeight = 50;
        soulsButton.displayWidth = 50;
        soulsButton.name = 'soulsButton';
        soulsButton.on('pointerdown', function () {
            self.openSkillTree(self.scene.activeScene.activeCharacter);
        });
        soulsButton.on('pointerover', _.bind(this.showTips, this.scene, soulsButton.x - 45, soulsButton.y - 25, 152, 20, 'Open Skill List'));
        soulsButton.on('pointerout', _.bind(this.hideTips, this.scene));
        this.hudbuttons.add(soulsButton);
        this.scene.soulsText = this.scene.add.text(this.scene.windowWidth - 193, this.scene.windowHeight - 30, '0', { fill: '#D22' });
    };
    this._createWalkButton = function () {
        var walkButton = this.scene.add.image(this.scene.windowWidth - 80, this.scene.windowHeight - 180, 'walkButton').setOrigin(0, 0);
        walkButton.displayHeight = 50;
        walkButton.displayWidth = 50;
        walkButton.name = 'walkButton';
        walkButton.on('pointerdown', _.bind(this.useDash, this));
        walkButton.on('pointerover', _.bind(this.showTips, this.scene, walkButton.x, walkButton.y - 25, 48, 20, 'Dash'));
        walkButton.on('pointerout', _.bind(this.hideTips, this.scene));
        this.hudbuttons.add(walkButton);
    };
    this._createUseMainHandButton = function () {
        var useMainHandButton = this.scene.add.image(this.scene.windowWidth - 145, this.scene.windowHeight - 210, 'mainHandButton').setOrigin(0, 0);
        useMainHandButton.displayHeight = 50;
        useMainHandButton.displayWidth = 50;
        useMainHandButton.name = 'useMainHandButton';
        useMainHandButton.on('pointerdown', _.bind(this.useMainHand, this));
        useMainHandButton.on('pointerover', _.bind(this.showTips, this.scene, useMainHandButton.x - 30, useMainHandButton.y - 25, 134, 20, 'Use Main Hand'));
        useMainHandButton.on('pointerout', _.bind(this.hideTips, this.scene));
        this.hudbuttons.add(useMainHandButton);
    };
    this._createUseOffHandButton = function () {
        var useOffHandButton = this.scene.add.image(this.scene.windowWidth - 145, this.scene.windowHeight - 270, 'offHandButton').setOrigin(0, 0);
        useOffHandButton.displayHeight = 50;
        useOffHandButton.displayWidth = 50;
        useOffHandButton.name = 'useOffHandButton';
        //useOffHandButtonButton.on('pointerdown', _.bind(this._openMainMenu, this.scene));
        useOffHandButton.on('pointerover', _.bind(this.showTips, this.scene, useOffHandButton.x - 25, useOffHandButton.y - 25, 117, 20, 'Use Offhand'));
        useOffHandButton.on('pointerout', _.bind(this.hideTips, this.scene));
        this.hudbuttons.add(useOffHandButton);
    };
    this._createInventoryButton = function () {
        var inventoryButton = this.scene.add.image(this.scene.windowWidth - 230, this.scene.windowHeight - 120, 'inventoryButton').setOrigin(0, 0);
        inventoryButton.displayHeight = 50;
        inventoryButton.displayWidth = 50;
        inventoryButton.name = 'inventoryButton';
        inventoryButton.on('pointerdown', _.bind(this.openCharacterInventory, this));
        inventoryButton.on('pointerover', _.bind(this.showTips, this.scene, inventoryButton.x - 30, inventoryButton.y - 25, 143, 20, 'Open Inventory'));
        inventoryButton.on('pointerout', _.bind(this.hideTips, this.scene));
        this.hudbuttons.add(inventoryButton);
    };
    this._createInspectButton = function () {
        var inspectButton = this.scene.add.image(this.scene.windowWidth - 60, this.scene.windowHeight - 120, 'inspectButton').setOrigin(0, 0);
        inspectButton.displayHeight = 50;
        inspectButton.displayWidth = 50;
        inspectButton.name = 'inspectButton';
        inspectButton.on('pointerdown', _.bind(this.selectInspectAction, this));
        inspectButton.on('pointerover', _.bind(this.showTips, this.scene, inspectButton.x - 20, inspectButton.y - 25, 75, 20, 'Inspect'));
        inspectButton.on('pointerout', _.bind(this.hideTips, this.scene));
        this.hudbuttons.add(inspectButton);
    };
    this._createTexts = function () {
        this.scene.turnText = this.scene.add.text(this.scene.windowWidth - 125, this.scene.windowHeight - 92, this.scene.turn, { fill: '#FFF' });
    };
};