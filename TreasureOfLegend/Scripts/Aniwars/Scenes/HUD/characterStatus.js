import { EnumHelper } from 'Aniwars/Helpers/enumHelper';

export const HUDCharacterStatus = function (scene) {
    var game = scene,
        characterInventoryTabGroup = null,
        characterDescriptionTabGroup = null,
        characterAbilitiesTabGroup = null,
        abilityStats = null,
        attributesInfo = null,
        attributesInfoBox = null,
        abilityGroup = null,
        damageArray = ['slashing', 'piercing', 'bludgeoning', 'fire'],
        inventoryCallback = _.bind(function (character) {
            game.tipsModal.hideTips();
            this.toggleInventoryTab(character);
        }, this),
        descriptionCallback = _.bind(function (character) {
            game.tipsModal.hideTips();
            this.toggleDescriptionTab(character);
        }, this),
        abilitiesCallback = _.bind(function (character) {
            game.tipsModal.hideTips();
            this.toggleAbilitiesTab(character);
        }, this);

    // Inventory TAB ------------------------------------------------------------------------------------------------------------------------
    this.openInventoryTab = function (character) {
        if (characterInventoryTabGroup) {
            this.destroyAllCharacterGroups();
            this.toggleInventoryTab(character);
        } else {
            this.toggleInventoryTab(character);
        }
    };
    this.toggleInventoryTab = function (character) {
        if (!characterInventoryTabGroup) {
            this.destroyAllCharacterGroups();
            var coords = this._getCoordsForTabs(character),
                x = coords.x,
                y = coords.y,
                charConfig = character.characterConfig,
                panel = game.add.graphics();
            characterInventoryTabGroup = game.add.group();
            panel.fillStyle(0x111111, 1);
            panel.fillRect(x, y, 440, 440);
            characterInventoryTabGroup.add(panel);
            // Equiped Inventory -----------------------------------------------------------------------------------------------------
            this._createInventorySlot(x + 75, y + 10, character, charConfig.inventory.head);
            this._createInventorySlot(x + 75, y + 65, character, charConfig.inventory.body);
            this._createInventorySlot(x + 20, y + 65, character, charConfig.inventory.mainHand);
            this._createInventorySlot(x + 130, y + 65, character, charConfig.inventory.offHand);
            this._createInventorySlot(x + 20, y + 120, character, charConfig.inventory.hands);
            this._createInventorySlot(x + 130, y + 120, character, charConfig.inventory.feet);
            // Unequiped inventory ---------------------------------------------------------------------------------------------------
            this._createUnequippedInventorySlots(character, x, y + 220);
            this._createTabButton(character, x, y + 20, 'inventoryButton', 'Inventory', inventoryCallback, characterInventoryTabGroup);
            this._createTabButton(character, x, y + 50, 'spellsButton', 'Description', descriptionCallback, characterInventoryTabGroup);
            this._createTabButton(character, x, y + 80, 'spellsButton', 'Abilities', abilitiesCallback, characterInventoryTabGroup);
            this._createCloseButton(x + 420, y, characterInventoryTabGroup);
        } else {
            this.destroyAllCharacterGroups();
            game.tipsModal.hideTips();
        }
    };
    this._createInventorySlot = function (x, y, character, item) {
        var image = null,
            box = game.add.graphics();
        box.fillStyle(0x444444, 0.8);
        box.fillRect(x, y, 50, 50);
        characterInventoryTabGroup.add(box);

        if (item) {
            image = game.add.image(x, y, item.image).setOrigin(0, 0);
            image.displayWidth = 50;
            image.displayHeight = 50;
            game.input.setHitArea([image]);
            image.on('pointerover', _.bind(game.showItemStats, game, { x: x, y: y, item: item, character: character }));
            image.on('pointerout', _.bind(game.hideItemStats, game));
            characterInventoryTabGroup.add(image);
        }
        if (item && item.type !== EnumHelper.inventoryEnum.defaultEquipment &&
            character.x === game.activeScene.activeCharacter.x &&
            character.y === game.activeScene.activeCharacter.y) {
            this._createDropButton(x + 40, y, character, item, characterInventoryTabGroup);
        }
        if (_.isObject(item) && !item.isEquipped &&
            item && item.type !== EnumHelper.inventoryEnum.defaultEquipment &&
            character.x === game.activeScene.activeCharacter.x &&
            character.y === game.activeScene.activeCharacter.y) {
            this._createReplaceButton(x, y, character, item, characterInventoryTabGroup);
        }
    };
    this._createUnequippedInventorySlots = function (character, x, y) {
        var startX = x,
            charConfig = character.characterConfig;
        for (let i = 0; i < charConfig.inventory.slots.max; i++) {
            this._createInventorySlot(x, y, character, character.characterConfig.inventory.slots.items[i]);
            x += 55;
            if (x >= startX + 440) {
                x = startX;
                y += 55;
            }
        }
    };

    // Description TAB ------------------------------------------------------------------------------------------------------------------------
    this.openDescriptionTab = function (character) {
        if (characterDescriptionTabGroup) {
            this.destroyAllCharacterGroups();
            this.toggleDescriptionTab(character);
        } else {
            this.toggleDescriptionTab(character);
        }
    };
    this.toggleDescriptionTab = function (character) {
        if (!characterDescriptionTabGroup) {
            this.destroyAllCharacterGroups();
            characterDescriptionTabGroup = game.add.group();
            var coords = this._getCoordsForTabs(character),
                x = coords.x,
                y = coords.y,
                isPlayerControlled = character.characterConfig.isPlayerControlled,
                charConfig = character.characterConfig,
                text = isPlayerControlled
                    ? 'Experience: ' + charConfig.experience.current + '/' + charConfig.experience.nextLevel
                    : 'Experience: ' + charConfig.experience,
                textStyle = {
                    fill: '#FFF',
                    wordWrap: {
                        width: 420
                    }
                },
                panel = game.add.graphics();
            panel.fillStyle(0x111111, 1);
            panel.fillRect(x, y, 440, 440);
            characterDescriptionTabGroup.add(panel);
            var experienceText = game.add.text(x + 10, y + 25, text, textStyle);
            var strengthText = game.add.text(x + 10, y + 40, 'Strength: ' + charConfig.attributes.strength, textStyle);
            var dexterityText = game.add.text(x + 10, y + 55, 'Dexterity: ' + charConfig.attributes.dexterity, textStyle);
            var intelligenceText = game.add.text(x + 10, y + 70, 'Intelligence: ' + charConfig.attributes.intelligence, textStyle);

            var armorText = game.add.text(x + 10, y + 100, 'Armor total: ' + charConfig.armor, textStyle);
            var naturalArmorText = game.add.text(x + 10, y + 115, 'Natural Armor: ' + charConfig.naturalArmor, textStyle);
            var lifeText = game.add.text(x + 10, y + 130, 'Health: ' + charConfig.life.current + '/' + charConfig.life.max, textStyle);
            var manaText = game.add.text(x + 10, y + 145, 'Mana: ' + (charConfig.mana.max - charConfig.mana.spent) + '/' + charConfig.mana.max, textStyle);
            var movementText = game.add.text(x + 10, y + 160, 'Movement: ' + (charConfig.movement.max - charConfig.movement.spent) + '/' + charConfig.movement.max, textStyle);
            var energyText = game.add.text(x + 10, y + 175, 'Energy: ' + (charConfig.energy.max - charConfig.energy.spent) + '/' + charConfig.energy.max, textStyle);

            var moneyText = game.add.text(x + 10, y + 205, 'Money: ' + charConfig.inventory.money, textStyle);

            characterDescriptionTabGroup.add(experienceText);
            characterDescriptionTabGroup.add(strengthText);
            characterDescriptionTabGroup.add(dexterityText);
            characterDescriptionTabGroup.add(intelligenceText);
            characterDescriptionTabGroup.add(armorText);
            characterDescriptionTabGroup.add(naturalArmorText);
            characterDescriptionTabGroup.add(lifeText);
            characterDescriptionTabGroup.add(manaText);
            characterDescriptionTabGroup.add(movementText);
            characterDescriptionTabGroup.add(energyText);
            characterDescriptionTabGroup.add(moneyText);

            this._addVulnerabilities('invulnerabilities', charConfig, x + 10, y + 220, 'Invulnerable: ', textStyle, characterDescriptionTabGroup);
            this._addVulnerabilities('resistances', charConfig, x + 10, y + 250, 'Resistant: ', textStyle, characterDescriptionTabGroup);
            this._addVulnerabilities('vulnerabilities', charConfig, x + 10, y + 280, 'Vulnerable: ', textStyle, characterDescriptionTabGroup);
            if (isPlayerControlled) {
                this.showAttributePointSelection(character);
            }
            this._createTabButton(character, x, y + 20, 'inventoryButton', 'Inventory', inventoryCallback, characterDescriptionTabGroup);
            this._createTabButton(character, x, y + 50, 'spellsButton', 'Description', descriptionCallback, characterDescriptionTabGroup);
            this._createTabButton(character, x, y + 80, 'spellsButton', 'Abilities', abilitiesCallback, characterDescriptionTabGroup);
            this._createCloseButton(x + 420, y, characterDescriptionTabGroup);
        } else {
            this.destroyAllCharacterGroups();
            game.tipsModal.hideTips();
        }
    };
    this._addVulnerabilities = function (type, charConfig, x, y, textToShow, textStyle, group) {
        var vulnerabilities = '', text;
        for (let i = 0; i < charConfig[type].length; i++) {
            if (i !== charConfig[type].length - 1) {
                vulnerabilities += damageArray[charConfig[type][i]] + ', ';
            } else {
                vulnerabilities += damageArray[charConfig[type][i]];
            }
        }
        text = game.add.text(x, y, textToShow + vulnerabilities, textStyle);
        group.add(text);
    };
    this.showAttributePointSelection = function (character) {
        var coords = this._getCoordsForTabs(character),
            x = coords.x,
            y = coords.y,
            charConfig = character.characterConfig;
        this._destroyAttributesInfo();
        if (charConfig.experience.attributePoints > 0
            && character.x === game.activeScene.activeCharacter.x
            && character.y === game.activeScene.activeCharacter.y
            && characterDescriptionTabGroup !== null) {
            attributesInfo = game.add.group();
            attributesInfoBox = game.add.group();
            var attributePointsText = game.add.text(x + 220, y + 10, 'Attribute points: ' + charConfig.experience.attributePoints, { fill: '#FFF' });
            attributesInfo.add(attributePointsText);
            for (let i = 0; i < 3; i++) {
                var attributeButton = game.add.image(x + 200, y + 40 + (i * 15), 'plusButton').setOrigin(0, 0);
                attributeButton.displayHeight = 14;
                attributeButton.displayWidth = 14;
                attributeButton.objectToSend = i + 1;
                attributesInfoBox.add(attributeButton);
            }
            game.input.setHitArea(attributesInfoBox.getChildren());
            _.each(attributesInfoBox.getChildren(), function (item) {
                item.on('pointerdown', function () {
                    game.events.emit('addAttributePoint', item.objectToSend);
                });
            });
        }
    };

    // Abilities TAB ------------------------------------------------------------------------------------------------------------------------
    this.openAbilitiesTab = function (character) {
        if (characterAbilitiesTabGroup) {
            this.destroyAllCharacterGroups();
            this.toggleAbilitiesTab(character);
        } else {
            this.toggleAbilitiesTab(character);
        }
    };
    this.toggleAbilitiesTab = function (character) {
        if (!characterAbilitiesTabGroup) {
            this.destroyAllCharacterGroups();
            var coords = this._getCoordsForTabs(character),
                x = coords.x,
                y = coords.y,
                self = this,
                startX = coords.x;
            characterAbilitiesTabGroup = game.add.group();
            abilityGroup = game.add.group();
            var panel = game.add.graphics();
            panel.fillStyle(0x111111, 1);
            panel.fillRect(x, y, 440, 440);
            characterAbilitiesTabGroup.add(panel);
            this._createCloseButton(x + 420, y, characterAbilitiesTabGroup);
            this._createTabButton(character, x, y + 20, 'inventoryButton', 'Inventory', inventoryCallback, characterAbilitiesTabGroup);
            this._createTabButton(character, x, y + 50, 'spellsButton', 'Description', descriptionCallback, characterAbilitiesTabGroup);
            this._createTabButton(character, x, y + 80, 'spellsButton', 'Abilities', abilitiesCallback, characterAbilitiesTabGroup);
            _.each(character.characterConfig.inventory.spells, function (spell) {
                var box = game.add.graphics(),
                    spellImage;
                box.fillStyle(0xded7c7, 1);
                box.fillRect(x, y, 70, 70);
                characterAbilitiesTabGroup.add(box);

                spellImage = game.add.image(x + 10, y + 10, spell.image).setOrigin(0, 0);
                spellImage.displayWidth = 50;
                spellImage.displayHeight = 50;
                spellImage.objectToSend = spell;
                self._showAbilityUpgradeButton(character, spell, characterAbilitiesTabGroup, x, y);
                abilityGroup.add(spellImage);
                x += 80;
                if (x >= startX + 440) {
                    x = startX;
                    y += 80;
                }
            });

            game.input.setHitArea(abilityGroup.getChildren());
            _.each(abilityGroup.getChildren(), function (abilityImage) {
                abilityImage.on('pointerover', function () {
                    self._showAbilityStats(abilityImage, abilityImage.objectToSend);
                });
                abilityImage.on('pointerout', _.bind(self._destroyAbilityStats, self));
                abilityImage.on('pointerdown', function () {
                    if (abilityImage.objectToSend.level > 0) {
                        var hideAbilityStats = _.bind(self._destroyAbilityStats, self);
                        hideAbilityStats();
                        game.events.emit('spellSelected', abilityImage.objectToSend);
                        self._destroyCharacterInventoryTab();
                    }
                });
            });
        } else {
            this.destroyAllCharacterGroups();
            game.tipsModal.hideTips();
        }
    };
    this._showAbilityStats = function (image, ability) {
        var panel = game.add.graphics(),
            nameText, descriptionText, damageText, rangeText, costText, levelText, isPassiveText,
            damage = '',
            textStyle = {
                fill: '#FFF',
                wordWrap: {
                    width: 145
                }
            };
        panel.fillStyle(0x111111, 1);
        panel.fillRect(image.x + 50, image.y, 150, 150);
        abilityStats = game.add.group();
        abilityStats.add(panel);
        nameText = game.add.text(image.x + 55, image.y, ability.name, textStyle);
        abilityStats.add(nameText);
        descriptionText = game.add.text(image.x + 55, image.y + 30, ability.description, textStyle);
        abilityStats.add(descriptionText);
        for (let i = 0; i < ability.damage.length; i++) {
            if (i !== ability.damage.length - 1) {
                damage += ability.damage[0].value + ' ' + damageArray[ability.damage[0].type - 1] + ', ';
            } else {
                damage += ability.damage[0].value + ' ' + damageArray[ability.damage[0].type - 1];
            }
        }
        damageText = game.add.text(image.x + 55, image.y + 60, 'Damage: ' + damage, textStyle);
        abilityStats.add(damageText);
        rangeText = game.add.text(image.x + 55, image.y + 75, 'Range: ' + ability.range, textStyle);
        abilityStats.add(rangeText);
        costText = game.add.text(image.x + 55, image.y + 90, 'Cost: ' + ability.cost, textStyle);
        abilityStats.add(costText);
        levelText = game.add.text(image.x + 55, image.y + 105, 'Level: ' + ability.level, textStyle);
        abilityStats.add(levelText);
        isPassiveText = game.add.text(image.x + 55, image.y + 120, ability.isPassive ? 'Passive' : 'Active', textStyle);
        abilityStats.add(isPassiveText);
    };
    this._showAbilityUpgradeButton = function (character, spell, group, x, y) {
        if (character.characterConfig.isPlayerControlled && game.activeScene.characters.souls.skillPoints > 0
            && game.activeScene.activeCharacter.x === character.x
            && game.activeScene.activeCharacter.y === character.y
            && spell.level < spell.maxLevel) {
            var self = this,
                upgradeButton = game.add.image(x, y + 60, 'upgradeButton').setOrigin(0, 0);
            upgradeButton.displayWidth = 70;
            upgradeButton.displayHeight = 10;
            group.add(upgradeButton);
            game.input.setHitArea([upgradeButton]);
            upgradeButton.on('pointerdown', function () {
                game.events.emit('boughtSkill', spell);
                self.openAbilitiesTab(character);
            });
        }
    };
    // DESTROY METHODS -----------------------------------------------------------------------------------------------------------------------------------------------
    // Inventory TAB
    this._destroyCharacterInventoryTab = function () {
        if (characterInventoryTabGroup) {
            characterInventoryTabGroup.destroy(true);
            characterInventoryTabGroup = null;
        }
    };

    // Description TAB
    this._destroyAttributesInfo = function () {
        if (attributesInfo) {
            attributesInfo.destroy(true);
            attributesInfoBox.destroy(true);
            attributesInfo = null;
            attributesInfoBox = null;
        }
    };
    this._destroyCharacterDescriptionTab = function () {
        this._destroyAttributesInfo();
        if (characterDescriptionTabGroup) {
            characterDescriptionTabGroup.destroy(true);
            characterDescriptionTabGroup = null;
        }
    };

    // Abilities TAB
    this._destroyAbilityStats = function () {
        if (abilityStats) {
            abilityStats.destroy(true);
            abilityStats = null;
        }
    };
    this._destroyCharacterAbilitiesTab = function () {
        if (characterAbilitiesTabGroup) {
            characterAbilitiesTabGroup.destroy(true);
            characterAbilitiesTabGroup = null;
        }
        if (abilityGroup) {
            abilityGroup.destroy(true);
            abilityGroup = null;
        }
        this._destroyAbilityStats();
    };

    this.destroyAllCharacterGroups = function () {
        this._destroyCharacterInventoryTab();
        this._destroyCharacterDescriptionTab();
        this._destroyCharacterAbilitiesTab();
    };

    // BUTTONS --------------------------------------------------------------------------------------------------------------------------------------------
    this._createTabButton = function (character, x, y, buttonImage, text, callback, group) {
        var button = game.add.graphics(),
            startX = character.characterConfig.isPlayerControlled ? x + 440 : x - 30,
            tabImage = game.add.image(startX, y, buttonImage).setOrigin(0, 0);
        button.fillStyle(0x111111, 1);
        button.fillRect(startX, y, 30, 30);
        group.add(button);
        tabImage.displayWidth = 30;
        tabImage.displayHeight = 30;
        group.add(tabImage);

        game.input.setHitArea([tabImage]);
        tabImage.on('pointerdown', function () {
            callback(character, x);
        });
        tabImage.on('pointerover', function () {
            game.tipsModal.showTips(startX + 30, y, 100, 20, text);
        });
        tabImage.on('pointerout', function () {
            game.tipsModal.hideTips();
        });
    };
    this._createDropButton = function (x, y, character, itemToDrop, group) {
        var dropButton = game.add.image(x, y, 'closeButton').setOrigin(0, 0);
        dropButton.displayHeight = 10;
        dropButton.displayWidth = 10;
        group.add(dropButton);
        game.input.setHitArea([dropButton]);

        dropButton.on('pointerdown', function () {
            game.events.emit('dropItem', itemToDrop);
        });
    };
    this._createReplaceButton = function (x, y, character, itemToReplace, group) {
        var replaceButton = game.add.image(x, y, 'replaceButton').setOrigin(0, 0);
        replaceButton.displayHeight = 10;
        replaceButton.displayWidth = 10;
        group.add(replaceButton);
        game.input.setHitArea([replaceButton]);
        replaceButton.on('pointerdown', function () {
            game.events.emit('replaceItem', itemToReplace);
        });
    };
    this._createCloseButton = function (x, y, groupToDestroy) {
        var closeButton = game.add.image(x, y, 'closeButton').setOrigin(0, 0),
            self = this;
        closeButton.displayHeight = 20;
        closeButton.displayWidth = 20;
        groupToDestroy.add(closeButton);
        game.input.setHitArea([closeButton]);
        closeButton.on('pointerdown', function () {
            self.destroyAllCharacterGroups();
            game.closeLootbag();
        });
    };

    this._getCoordsForTabs = function (character) {
        var x = character.characterConfig.isPlayerControlled ? 0 : game.windowWidth - 440,
            y = 0;
        return {
            x: x,
            y: y
        };
    };
};