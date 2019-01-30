export const HUDLowerPanel = function(scene) {
    this.scene = scene;
    this.skillTree = null;
    this.spellBook = null;

    this.createLowerPanel = function() {
        //create player hud
        this.scene.turn = 1;
        this.hudbuttons = this.scene.add.group();
        this.footerPanel = this.scene.add.graphics();
        this.footerPanel.fillStyle(0x111111, 0.8);
        this.footerPanel.fillRect(0, 690, 1200, 110);
        this.scene.descriptionsText = this.scene.add.text(410, 710, '', { fill: '#FFF' });
        this.scene.soulsText = this.scene.add.text(410, 750, 'Souls: 0/5', { fill: '#FFF'});
        this.scene.locationText = this.scene.add.text(1080, 780, 'X:0, Y:0', { fill: '#FFF' });
        this.scene.turnText = this.scene.add.text(1150, 750, this.scene.turn, { fill: '#FFF' });

        this._createEndTurnButton();
        this._createMenuButton();
        this._createSpellbookButton();
        this._createSkillsButton();
        this.scene.input.setHitArea(this.hudbuttons.getChildren());
    };
    this.endTurn = function() {
        this.events.emit('endTurn');
    };

    this._createEndTurnButton = function() {
        var endTurnButton = this.scene.add.image(1100, 710, 'hourglass').setOrigin(0, 0);
        endTurnButton.on('pointerdown', _.bind(this.endTurn, this.scene));
        this.hudbuttons.add(endTurnButton);
    };
    this._createMenuButton = function() {
        var openMenuButton = this.scene.add.image(1000, 710, 'openMenuButton').setOrigin(0, 0);
        openMenuButton.displayHeight = 50;
        openMenuButton.displayWidth = 50;
        openMenuButton.on('pointerdown', _.bind(this._openMainMenu, this.scene));
        this.hudbuttons.add(openMenuButton);
    };
    this._createSpellbookButton = function() {
        var self = this,
            spellsButton = this.scene.add.image(900, 710, 'spells').setOrigin(0, 0);
        spellsButton.displayHeight = 50;
        spellsButton.displayWidth = 50;
        spellsButton.on('pointerdown', function() {
            if (self.scene.activeScene.activeCharacter.characterConfig.isPlayerControlled) {
                self._openSpellBook(self.scene.activeScene.activeCharacter);
            }
        });
        this.hudbuttons.add(spellsButton);
    };
    this._createSkillsButton = function() {
        var self = this,
            skillsButton = this.scene.add.image(850, 710, 'skills').setOrigin(0, 0);
        skillsButton.displayHeight = 50;
        skillsButton.displayWidth = 50;
        skillsButton.on('pointerdown', function() {
            if (self.scene.activeScene.activeCharacter.characterConfig.isPlayerControlled) {
                self._openSkillTree(self.scene.activeScene.activeCharacter);
            }
        });
        this.hudbuttons.add(skillsButton);
    };
    this._openMainMenu = function() {
        this.scene.sleep('HUDScene');
        this.scene.sleep(this.sceneName);
        this.scene.wake('MainMenuScene');
    };
    this._openSpellBook = function (character) {
        var self = this;
        if (this.skillTree) {
            this.skillTree.closeButtonGroup.destroy(true);
            this.skillTree.destroy(true);
        }
        if (!this.spellBook) {
            this.spellBook = this.scene.add.group();
        } else {
            this.spellBook.closeButtonGroup.destroy(true);
            this.spellBook.destroy(true);
            this.spellBook = this.scene.add.group();
        }
        var panel = self.scene.add.graphics();
        panel.fillStyle(0x111111, 0.8);
        panel.fillRect(900, 0, 300, 700);
        this.spellBook.add(panel);
        var x = 920;
        var y = 10;
        _.each(character.characterConfig.inventory.spells, function(spell) {
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

        this.spellBook.closeButtonGroup = this.scene.createCloseButton(1180, 0, this.spellBook);
        this.scene.input.setHitArea(this.spellBook.getChildren());
        _.each(this.spellBook.getChildren(), function(item) {
            item.on('pointerdown', function() {
                self.scene.events.emit('spellSelected', item.objectToSend);
                self.spellBook.destroy(true);
                self.spellBook.closeButtonGroup.destroy(true);
                panel.destroy();
                // Get main attack icon
                // TODO Change this to call a separate function
                self.scene.events.emit('getCharacterStartData');
            });
        });
    };
    this._openSkillTree = function(character) {
        var self = this;
        if (this.spellBook) {
            this.spellBook.closeButtonGroup.destroy(true);
            this.spellBook.destroy(true);
        }
        if (!this.skillTree) {
            this.skillTree = this.scene.add.group();
        } else {
            this.skillTree.closeButtonGroup.destroy(true);
            this.skillTree.destroy(true);
            this.skillTree = this.scene.add.group();
        }
        var panel = self.scene.add.graphics();
        panel.fillStyle(0x111111, 0.8);
        panel.fillRect(900, 0, 300, 700);
        this.skillTree.add(panel);
        var x = 920;
        var y = 10;
        _.each(character.characterConfig.skillsToBuy, function(skill) {
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

        this.skillTree.closeButtonGroup = this.scene.createCloseButton(1180, 0, this.skillTree);
        if (this.scene.activeScene.characters.souls.skillPoints > 0) {
            this.scene.input.setHitArea(this.skillTree.getChildren());
            _.each(this.skillTree.getChildren(), function(item) {
                item.on('pointerdown', function() {
                        self.scene.events.emit('boughtSkill', item.objectToSend);
                        self.skillTree.closeButtonGroup.destroy(true);
                        panel.destroy();
                        self._openSkillTree(character);
                    });
            });
        }
    };
};