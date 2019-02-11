import { EnumHelper } from 'Aniwars/Helpers/enumHelper';

export const HUDCharacterStatus = function (scene) {
    this.scene = scene;
    this.isCharacterInfoMenuOpen = null;
    this.characterBarImages = null;
    this.characterMainAttack = null;
    this.characterInfo = null;
    this.characterInfoCloseButtonGroup = null;
    this.attributesInfo = null;
    this.attributesInfoBox = null;
    this.characterBar = null;
    this.whosInventory = null;
    this.abilityGroup = null;
    this.abilitiesImage = null;
    this.abilityStats = null;

    this.toggleCharacterInfo = function (character, forceRemainOpen) {
        if (!this.isCharacterInfoMenuOpen) {
            var x = character.characterConfig.isPlayerControlled ? 0 : this.scene.windowWidth - 440,
                y = 0;
            this._createInventory(character, x, y);
            this._createCharacterInfoScreen(character, x, y);
        } else {
            this._closeCharacterInfo();
            this._hideAbilityStats();
            this.scene.tipsModal.hideTips();
            if ((this.whosInventory && (this.whosInventory.x !== character.x || this.whosInventory.y !== character.y)) || forceRemainOpen) {
                this.toggleCharacterInfo(character);
            }
        }
    };
    this.showAttributePointSelection = function (character, x, y) {
        var charConfig = character.characterConfig;
        if (this.attributesInfo) {
            this.attributesInfo.destroy(true);
        }
        if (this.attributesInfoBox) {
            this.attributesInfoBox.destroy(true);
        }
        if (charConfig.experience.attributePoints > 0
            && character.x === this.scene.activeScene.activeCharacter.x
            && character.y === this.scene.activeScene.activeCharacter.y) {
            var self = this;
            this.attributesInfo = this.scene.add.group();
            this.attributesInfoBox = this.scene.add.group();
            var attributePointsText = this.scene.add.text(x + 220, y + 10, 'Attribute points: ' + charConfig.experience.attributePoints, { fill: '#FFF' });
            this.attributesInfo.add(attributePointsText);
            for (let i = 0; i < 3; i++) {
                var attributeButton = this.scene.add.image(x + 200, y + 40 + (i * 15), 'plusButton').setOrigin(0, 0);
                attributeButton.displayHeight = 14;
                attributeButton.displayWidth = 14;
                attributeButton.objectToSend = i + 1;
                this.attributesInfoBox.add(attributeButton);
            }
            this.scene.input.setHitArea(this.attributesInfoBox.getChildren());
            _.each(this.attributesInfoBox.getChildren(), function (item) {
                item.on('pointerdown', function () {
                    self.scene.events.emit('addAttributePoint', item.objectToSend);
                });
            });
        }
    };

    this._createInventory = function (character, x, y) {
        var charConfig = character.characterConfig,
            isPlayerControlled = character.characterConfig.isPlayerControlled,
            panel = this.scene.add.graphics(),
            startX = x,
            self = this;
        this.whosInventory = character;
        this.isCharacterInfoMenuOpen = true;
        this.characterInfo = this.scene.add.group();
        panel.fillStyle(0x111111, 1);
        panel.fillRect(x, y, 440, 440);
        this.characterInfo.add(panel);
        // Equiped Inventory -----------------------------------------------------------------------------------------------------
        this._createInventorySlot(x + 75, y + 10, 50, 50, character, charConfig.inventory.head);
        this._createInventorySlot(x + 75, y + 65, 50, 50, character, charConfig.inventory.body);
        this._createInventorySlot(x + 20, y + 65, 50, 50, character, charConfig.inventory.mainHand);
        this._createInventorySlot(x + 130, y + 65, 50, 50, character, charConfig.inventory.offHand);
        this._createInventorySlot(x + 20, y + 120, 50, 50, character, charConfig.inventory.hands);
        this._createInventorySlot(x + 130, y + 120, 50, 50, character, charConfig.inventory.feet);
        // Unequiped inventory ---------------------------------------------------------------------------------------------------
        y += 220;
        for (let i = 0; i < charConfig.inventory.slots.max; i++) {
            this._createInventorySlot(x, y, 50, 50, character, charConfig.inventory.slots.items[i]);
            x += 55;
            if (x >= startX + 440) {
                x = isPlayerControlled ? 0 : this.scene.windowWidth - 440;
                y += 55;
            }
        }
        x = isPlayerControlled ? 0 : this.scene.windowWidth - 440;
        y = 0;
        var callback = function () {
            this.scene.tipsModal.hideTips();
            self._showCharacterAbilities(character, x, y);
        };
        this._createAbilitiesTabButton(character, x, y, 'spellsButton', 'Abilities', callback);
        this.characterInfo.name = 'characterInfo';
        this.characterInfoCloseButtonGroup = this.scene.createCloseButton(x + 420, y, this.characterInfo);
    };
    this._createInventorySlot = function (x, y, w, h, character, item) {
        var image = null,
            box = this.scene.add.graphics(),
            self = this;
        box.fillStyle(0x444444, 0.8);
        box.fillRect(x, y, w, h);
        if (item) {
            image = this.scene.add.image(x, y, item.image).setOrigin(0, 0);
            image.displayWidth = w;
            image.displayHeight = h;
        }
        this.characterInfo.add(box);
        if (image) {
            this.scene.input.setHitArea([image]);
            image.on('pointerover', _.bind(this.scene.showItemStats, this.scene, { x: x, y: y, item: item, character: character }));
            image.on('pointerout', _.bind(this.scene.hideItemStats, this.scene));
            this.characterInfo.add(image);
        }
        var dropButtonGroup = this._createDropButton(x + 40, y, character, item);
        if (dropButtonGroup) {
            _.each(dropButtonGroup.getChildren(), function (item) {
                self.characterInfo.add(item);
            });
        }
        if (_.isObject(item) && !item.isEquipped) {
            var replaceButtonGroup = this._createReplaceButton(x, y, character, item);
            if (replaceButtonGroup) {
                _.each(replaceButtonGroup.getChildren(), function (item) {
                    self.characterInfo.add(item);
                });
            }
        }
    };
    this._createCharacterInfoScreen = function (character, x, y) {
        var isPlayerControlled = character.characterConfig.isPlayerControlled,
            charConfig = character.characterConfig,
            text = isPlayerControlled
                ? 'Experience: ' + charConfig.experience.current + '/' + charConfig.experience.nextLevel
                : 'Experience: ' + charConfig.experience,
            textStyle = {
                fill: '#FFF',
                wordWrap: {
                    width: 220
                }
            },
            damageArray = ['slashing', 'piercing', 'bludgeoning', 'fire'];
        var experienceText = this.scene.add.text(x + 220, y + 25, text, { fill: '#FFF' });
        var strengthText = this.scene.add.text(x + 220, y + 40, 'Strength: ' + charConfig.attributes.strength, textStyle);
        var dexterityText = this.scene.add.text(x + 220, y + 55, 'Dexterity: ' + charConfig.attributes.dexterity, textStyle);
        var intelligenceText = this.scene.add.text(x + 220, y + 70, 'Intelligence: ' + charConfig.attributes.intelligence, textStyle);

        var armorText = this.scene.add.text(x + 220, y + 100, 'Armor total: ' + charConfig.armor, textStyle);
        var naturalArmorText = this.scene.add.text(x + 220, y + 115, 'Natural Armor: ' + charConfig.naturalArmor, textStyle);
        var lifeText = this.scene.add.text(x + 220, y + 130, 'Health: ' + charConfig.life.current + '/' + charConfig.life.max, textStyle);
        var manaText = this.scene.add.text(x + 220, y + 145, 'Mana: ' + (charConfig.mana.max - charConfig.mana.spent) + '/' + charConfig.mana.max, textStyle);
        var movementText = this.scene.add.text(x + 220, y + 160, 'Movement: ' + (charConfig.movement.max - charConfig.movement.spent) + '/' + charConfig.movement.max, textStyle);
        var energyText = this.scene.add.text(x + 220, y + 175, 'Energy: ' + (charConfig.energy.max - charConfig.energy.spent) + '/' + charConfig.energy.max, textStyle);

        var moneyText = this.scene.add.text(x + 220, y + 205, 'Money: ' + charConfig.inventory.money, textStyle);

        var invulnerabilities = '', resistances = '', vulnerabilities = '';
        for (let i = 0; i < charConfig.invulnerabilities.length; i++) {
            if (i !== charConfig.invulnerabilities.length - 1) {
                invulnerabilities += damageArray[charConfig.invulnerabilities[i]] + ', ';
            } else {
                invulnerabilities += damageArray[charConfig.invulnerabilities[i]];
            }
        }
        for (let i = 0; i < charConfig.resistances.length; i++) {
            if (i !== charConfig.resistances.length - 1) {
                resistances += damageArray[charConfig.resistances[i]] + ', ';
            } else {
                resistances += damageArray[charConfig.resistances[i]];
            }
        }
        for (let i = 0; i < charConfig.vulnerabilities.length; i++) {
            if (i !== charConfig.vulnerabilities.length - 1) {
                vulnerabilities += damageArray[charConfig.vulnerabilities[i]] + ', ';
            } else {
                vulnerabilities += damageArray[charConfig.vulnerabilities[i]];
            }
        }

        this.characterInfo.add(experienceText);
        this.characterInfo.add(strengthText);
        this.characterInfo.add(dexterityText);
        this.characterInfo.add(intelligenceText);
        this.characterInfo.add(armorText);
        this.characterInfo.add(naturalArmorText);
        this.characterInfo.add(lifeText);
        this.characterInfo.add(manaText);
        this.characterInfo.add(movementText);
        this.characterInfo.add(energyText);
        this.characterInfo.add(moneyText);
        if (invulnerabilities) {
            var invulnerabilitiesText = this.scene.add.text(x + 220, y + 220, 'Invulnerable: ' + invulnerabilities, textStyle);
            this.characterInfo.add(invulnerabilitiesText);
        }
        if (resistances) {
            var resistancesText = this.scene.add.text(x + 220, y + 250, 'Resistant: ' + resistances, textStyle);
            this.characterInfo.add(resistancesText);
        }
        if (vulnerabilities) {
            var vulnerabilitiesText = this.scene.add.text(x + 220, y + 280, 'Vulnerable: ' + vulnerabilities, textStyle);
            this.characterInfo.add(vulnerabilitiesText);
        }
        if (isPlayerControlled) {
            this.showAttributePointSelection(character, x, y);
        }
    };
    this._createAbilitiesTabButton = function (character, x, y, buttonImage, text, callback) {
        var button = this.scene.add.graphics(),
            self = this,
            startX = character.characterConfig.isPlayerControlled ? x + 440 : x - 30;
        button.fillStyle(0x111111, 1);
        button.fillRect(startX, y + 20, 30, 30);
        if (this.abilitiesImage) {
            this.abilitiesImage.destroy(true);
            this.abilitiesImage = null;
        }
        this.abilitiesImage = this.scene.add.image(startX, y + 20, buttonImage).setOrigin(0, 0);
        this.abilitiesImage.displayWidth = 30;
        this.abilitiesImage.displayHeight = 30;
        this.characterInfo.add(button);
        this.scene.input.setHitArea([this.abilitiesImage]);
        this.abilitiesImage.on('pointerdown', callback);
        this.abilitiesImage.on('pointerover', function () {
            self.scene.tipsModal.showTips(startX + 30, y + 20, 100, 20, text);
        });
        this.abilitiesImage.on('pointerout', function () {
            self.scene.tipsModal.hideTips();
        });
    };
    this._showCharacterAbilities = function (character, x, y) {
        this._closeCharacterInfo();
        this.isCharacterInfoMenuOpen = true;
        var self = this,
            startX = x;
        this.characterInfo = this.scene.add.group();
        this.abilityGroup = this.scene.add.group();
        var panel = this.scene.add.graphics();
        panel.fillStyle(0x111111, 1);
        panel.fillRect(x, y, 440, 440);
        this.characterInfo.add(panel);
        this.characterInfo.name = 'characterInfo';
        this.characterInfoCloseButtonGroup = this.scene.createCloseButton(x + 420, y, this.characterInfo);
        var callback = function () {
            self.scene.tipsModal.hideTips();
            self.toggleCharacterInfo(character, true);
        };
        this._createAbilitiesTabButton(character, x, y, 'inventoryButton', 'Inventory', callback);
        _.each(character.characterConfig.inventory.spells, function (spell) {
            var box = self.scene.add.graphics();
            box.fillStyle(0xded7c7, 1);
            box.fillRect(x, y, 70, 70);
            var spellImage = self.scene.add.image(x + 10, y + 10, spell.image).setOrigin(0, 0);
            spellImage.displayWidth = 50;
            spellImage.displayHeight = 50;
            spellImage.objectToSend = spell;
            if (character.characterConfig.isPlayerControlled && self.scene.activeScene.characters.souls.skillPoints > 0
                && self.scene.activeScene.activeCharacter.x === character.x
                && self.scene.activeScene.activeCharacter.y === character.y
                && spell.level < spell.maxLevel) {
                var upgradeButton = self.scene.add.image(x, y + 60, 'upgradeButton').setOrigin(0, 0);
                upgradeButton.displayWidth = 70;
                upgradeButton.displayHeight = 10;
                self.characterInfo.add(upgradeButton);
                self.scene.input.setHitArea([upgradeButton]);
                upgradeButton.on('pointerdown', function () {
                    self.scene.events.emit('boughtSkill', spell);
                });
            }

            self.characterInfo.add(box);
            self.abilityGroup.add(spellImage);
            x += 80;
            if (x >= startX + 440) {
                x = startX;
                y += 80;
            }
        });

        this.scene.input.setHitArea(this.abilityGroup.getChildren());
        _.each(this.abilityGroup.getChildren(), function (abilityImage) {
            abilityImage.on('pointerover', function () {
                self._showAbilityStats(abilityImage, abilityImage.objectToSend);
            });
            abilityImage.on('pointerout', _.bind(self._hideAbilityStats, self));
            abilityImage.on('pointerdown', function () {
                if (abilityImage.objectToSend.level > 0) {
                    var hideAbilityStats = _.bind(self._hideAbilityStats, self);
                    hideAbilityStats();
                    self.scene.events.emit('spellSelected', abilityImage.objectToSend);
                    self._closeCharacterInfo();
                }
            });
        });
    };
    this._showAbilityStats = function (image, ability) {
        var panel = this.scene.add.graphics(),
            nameText, descriptionText, damageText, rangeText, costText, levelText, isPassiveText,
            damageArray = ['slashing', 'piercing', 'bludgeoning', 'fire'],
            damage = '',
            textStyle = {
                fill: '#FFF',
                wordWrap: {
                    width: 145
                }
            };
        panel.fillStyle(0x111111, 1);
        panel.fillRect(image.x + 50, image.y, 150, 150);
        this.abilityStats = this.scene.add.group();
        this.abilityStats.add(panel);
        nameText = this.scene.add.text(image.x + 55, image.y, ability.name, textStyle);
        this.abilityStats.add(nameText);
        descriptionText = this.scene.add.text(image.x + 55, image.y + 30, ability.description, textStyle);
        this.abilityStats.add(descriptionText);
        for (let i = 0; i < ability.damage.length; i++) {
            if (i !== ability.damage.length - 1) {
                damage += ability.damage[0].value + ' ' + damageArray[ability.damage[0].type - 1] + ', ';
            } else {
                damage += ability.damage[0].value + ' ' + damageArray[ability.damage[0].type - 1];
            }
        }
        damageText = this.scene.add.text(image.x + 55, image.y + 60, 'Damage: ' + damage, textStyle);
        this.abilityStats.add(damageText);
        rangeText = this.scene.add.text(image.x + 55, image.y + 75, 'Range: ' + ability.range, textStyle);
        this.abilityStats.add(rangeText);
        costText = this.scene.add.text(image.x + 55, image.y + 90, 'Cost: ' + ability.cost, textStyle);
        this.abilityStats.add(costText);
        levelText = this.scene.add.text(image.x + 55, image.y + 105, 'Level: ' + ability.level, textStyle);
        this.abilityStats.add(levelText);
        isPassiveText = this.scene.add.text(image.x + 55, image.y + 120, ability.isPassive ? 'Passive' : 'Active', textStyle);
        this.abilityStats.add(isPassiveText);
    };
    this._hideAbilityStats = function () {
        if (this.abilityStats) {
            this.abilityStats.destroy(true);
            this.abilityStats = null;
        }
    };
    this._closeCharacterInfo = function () {
        // TODO: Hide tips in case player presses TAB
        if (this.attributesInfo) {
            this.attributesInfo.destroy(true);
            this.attributesInfoBox.destroy(true);
        }
        if (this.abilityGroup) {
            this.abilityGroup.destroy(true);
        }
        if (this.abilitiesImage) {
            this.abilitiesImage.destroy(true);
            this.abilitiesImage = null;
        }
        if (this.characterInfo) {
            this.isCharacterInfoMenuOpen = false;
            this.characterInfo.destroy(true);
            this.characterInfoCloseButtonGroup.destroy(true);
        }
    };
    this._createDropButton = function (x, y, character, itemToDrop) {
        if (itemToDrop &&
            itemToDrop.type !== EnumHelper.inventoryEnum.defaultEquipment &&
            character.x === this.scene.activeScene.activeCharacter.x &&
            character.y === this.scene.activeScene.activeCharacter.y) {
            var self = this,
                dropButtonGroup = this.scene.add.group();

            var dropButton = this.scene.add.graphics();
            dropButton.fillStyle(0x990000, 0.8);
            dropButton.fillRect(x + 1, y, 10, 10);
            dropButtonGroup.add(dropButton);

            var dropText = this.scene.add.text(x + 2, y, 'X', { fill: '#FFF', fontSize: '10px' });
            dropButtonGroup.add(dropText);
            this.scene.input.setHitArea(dropButtonGroup.getChildren());
            _.each(dropButtonGroup.getChildren(), function (item) {
                item.on('pointerdown', function () {
                    self.scene.events.emit('dropItem', itemToDrop);
                });
            });
            return dropButtonGroup;
        }
    };
    this._createReplaceButton = function (x, y, character, itemToReplace) {
        if (itemToReplace &&
            itemToReplace.type !== EnumHelper.inventoryEnum.defaultEquipment &&
            character.x === this.scene.activeScene.activeCharacter.x &&
            character.y === this.scene.activeScene.activeCharacter.y) {
            var self = this,
                replaceButtonGroup = this.scene.add.group();

            var replaceButton = this.scene.add.graphics();
            replaceButton.fillStyle(0x009900, 0.8);
            replaceButton.fillRect(x, y, 10, 10);
            replaceButtonGroup.add(replaceButton);

            var replaceText = this.scene.add.text(x + 2, y, 'R', { fill: '#FFF', fontSize: '10px' });
            replaceButtonGroup.add(replaceText);
            this.scene.input.setHitArea(replaceButtonGroup.getChildren());
            _.each(replaceButtonGroup.getChildren(), function (item) {
                item.on('pointerdown', function () {
                    self.scene.events.emit('replaceItem', itemToReplace);
                });
            });
            return replaceButtonGroup;
        }
    };
};