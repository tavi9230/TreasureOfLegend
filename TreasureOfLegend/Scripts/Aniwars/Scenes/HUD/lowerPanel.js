export const HUDLowerPanel = function(scene) {
    this.scene = scene;
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

    this._createEndTurnButton = function() {
        var endTurnButton = this.scene.add.image(1100, 710, 'hourglass').setOrigin(0, 0);
        endTurnButton.on('pointerdown', _.bind(this.scene.endTurn, this.scene));
        this.hudbuttons.add(endTurnButton);
    };
    this._createMenuButton = function() {
        var openMenuButton = this.scene.add.image(1000, 710, 'openMenuButton').setOrigin(0, 0);
        openMenuButton.displayHeight = 50;
        openMenuButton.displayWidth = 50;
        openMenuButton.on('pointerdown', _.bind(this.scene.openMainMenu, this.scene));
        this.hudbuttons.add(openMenuButton);
    };
    this._createSpellbookButton = function() {
        var self = this,
            spellsButton = this.scene.add.image(900, 710, 'spells').setOrigin(0, 0);
        spellsButton.displayHeight = 50;
        spellsButton.displayWidth = 50;
        spellsButton.on('pointerdown', function() {
            self.scene.events.emit('getActiveCharacterSpells');
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
                self.scene.openSkillTree(self.scene.activeScene.activeCharacter);
            }
        });
        this.hudbuttons.add(skillsButton);
    };
};