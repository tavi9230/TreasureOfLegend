import { EnumHelper } from 'Aniwars/Helpers/enumHelper';

export const HUDCharacterStatus = function (scene) {
    var game = scene,
        characterInfo = null,
        abilityStats = null,
        attributesInfo = null,
        attributesInfoBox = null,
        abilityGroup = null,
        damageArray = ['slashing', 'piercing', 'bludgeoning', 'fire'],
        abilitiesCallback = _.bind(function (character, x, y) {
            game.tipsModal.hideTips();
            this._showCharacterAbilities(character, x, y);
        }, this),
        inventoryCallback = _.bind(function (character, x, y) {
            game.tipsModal.hideTips();
            this.toggleCharacterInventory(character, x, y);
        }, this),
        descriptionCallback = _.bind(function (character, x, y) {
            game.tipsModal.hideTips();
            this._createDescriptionsTab(character, x, y);
        }, this);

    this.toggleCharacterInventory = function (character) {
        if (!characterInfo) {
            var x = character.characterConfig.isPlayerControlled ? 0 : game.windowWidth - 440,
                y = 0;
            var charConfig = character.characterConfig,
                panel = game.add.graphics();
            characterInfo = game.add.group();
            panel.fillStyle(0x111111, 1);
            panel.fillRect(x, y, 440, 440);
            characterInfo.add(panel);
            // Equiped Inventory -----------------------------------------------------------------------------------------------------
            this._createInventorySlot(x + 75, y + 10, character, charConfig.inventory.head);
            this._createInventorySlot(x + 75, y + 65, character, charConfig.inventory.body);
            this._createInventorySlot(x + 20, y + 65, character, charConfig.inventory.mainHand);
            this._createInventorySlot(x + 130, y + 65, character, charConfig.inventory.offHand);
            this._createInventorySlot(x + 20, y + 120, character, charConfig.inventory.hands);
            this._createInventorySlot(x + 130, y + 120, character, charConfig.inventory.feet);
            // Unequiped inventory ---------------------------------------------------------------------------------------------------
            this._createUnequippedInventorySlots(character, x, y + 220);
            this._createInventoryTabButton(character, x, y, 'inventoryButton', 'Inventory', inventoryCallback);
            this._createDescriptionTabButton(character, x, y, 'spellsButton', 'Description', descriptionCallback);
            this._createAbilitiesTabButton(character, x, y, 'spellsButton', 'Abilities', abilitiesCallback);
            this._createCloseButton(x + 420, y, characterInfo);
        } else {
            this._destroyCharacterInfo();
            this._destroyAbilityStats();
            game.tipsModal.hideTips();
            this.toggleCharacterInventory(character);
        }
    };
    this.showAttributePointSelection = function (character, x, y) {
        var charConfig = character.characterConfig;
        this._destroyAttributesInfo();
        if (charConfig.experience.attributePoints > 0
            && character.x === game.activeScene.activeCharacter.x
            && character.y === game.activeScene.activeCharacter.y) {
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

    this._createInventorySlot = function (x, y, character, item) {
        var image = null,
            box = game.add.graphics();
        box.fillStyle(0x444444, 0.8);
        box.fillRect(x, y, 50, 50);
        characterInfo.add(box);

        if (item) {
            image = game.add.image(x, y, item.image).setOrigin(0, 0);
            image.displayWidth = 50;
            image.displayHeight = 50;
            game.input.setHitArea([image]);
            image.on('pointerover', _.bind(game.showItemStats, game, { x: x, y: y, item: item, character: character }));
            image.on('pointerout', _.bind(game.hideItemStats, game));
            characterInfo.add(image);
        }
        if (item && item.type !== EnumHelper.inventoryEnum.defaultEquipment &&
            character.x === game.activeScene.activeCharacter.x &&
            character.y === game.activeScene.activeCharacter.y) {
            this._createDropButton(x + 40, y, character, item, characterInfo);
        }
        if (_.isObject(item) && !item.isEquipped &&
            item && item.type !== EnumHelper.inventoryEnum.defaultEquipment &&
            character.x === game.activeScene.activeCharacter.x &&
            character.y === game.activeScene.activeCharacter.y) {
            this._createReplaceButton(x, y, character, item, characterInfo);
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
    this._createDescriptionsTab = function (character, x, y) {
        if (!characterInfo) {
            characterInfo = game.add.group();
            var isPlayerControlled = character.characterConfig.isPlayerControlled,
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
            characterInfo.add(panel);
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

            characterInfo.add(experienceText);
            characterInfo.add(strengthText);
            characterInfo.add(dexterityText);
            characterInfo.add(intelligenceText);
            characterInfo.add(armorText);
            characterInfo.add(naturalArmorText);
            characterInfo.add(lifeText);
            characterInfo.add(manaText);
            characterInfo.add(movementText);
            characterInfo.add(energyText);
            characterInfo.add(moneyText);

            this._addVulnerabilities('invulnerabilities', charConfig, x + 10, y + 220, 'Invulnerable: ', textStyle, characterInfo);
            this._addVulnerabilities('resistances', charConfig, x + 10, y + 250, 'Resistant: ', textStyle, characterInfo);
            this._addVulnerabilities('vulnerabilities', charConfig, x + 10, y + 280, 'Vulnerable: ', textStyle, characterInfo);
            if (isPlayerControlled) {
                this.showAttributePointSelection(character, x, y);
            }
            this._createInventoryTabButton(character, x, y, 'inventoryButton', 'Inventory', inventoryCallback);
            this._createDescriptionTabButton(character, x, y, 'spellsButton', 'Description', descriptionCallback);
            this._createAbilitiesTabButton(character, x, y, 'spellsButton', 'Abilities', abilitiesCallback);
            this._createCloseButton(x + 420, y, characterInfo);
        } else {
            this._destroyCharacterInfo();
            this._createDescriptionsTab(character, x, y);
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
    this._showCharacterAbilities = function (character, x, y) {
        if (!characterInfo) {
            var self = this,
                startX = x,
                inventoryCallback = function () {
                    game.tipsModal.hideTips();
                    self.toggleCharacterInventory(character, true);
                };
            characterInfo = game.add.group();
            abilityGroup = game.add.group();
            var panel = game.add.graphics();
            panel.fillStyle(0x111111, 1);
            panel.fillRect(x, y, 440, 440);
            characterInfo.add(panel);
            this._createCloseButton(x + 420, y, characterInfo, this._destroyAbilityGroup);
            this._createInventoryTabButton(character, x, y, 'inventoryButton', 'Inventory', inventoryCallback);
            this._createDescriptionTabButton(character, x, y, 'spellsButton', 'Description', descriptionCallback);
            this._createAbilitiesTabButton(character, x, y, 'spellsButton', 'Abilities', abilitiesCallback);
            _.each(character.characterConfig.inventory.spells, function (spell) {
                var box = game.add.graphics(),
                    spellImage;
                box.fillStyle(0xded7c7, 1);
                box.fillRect(x, y, 70, 70);
                characterInfo.add(box);

                spellImage = game.add.image(x + 10, y + 10, spell.image).setOrigin(0, 0);
                spellImage.displayWidth = 50;
                spellImage.displayHeight = 50;
                spellImage.objectToSend = spell;
                self._showAbilityUpgradeButton(character, spell, characterInfo, x, y);
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
                        self._destroyCharacterInfo();
                    }
                });
            });
        } else {
            this._destroyCharacterInfo();
            this._showCharacterAbilities(character, x, y);
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
            var upgradeButton = game.add.image(x, y + 60, 'upgradeButton').setOrigin(0, 0);
            upgradeButton.displayWidth = 70;
            upgradeButton.displayHeight = 10;
            group.add(upgradeButton);
            game.input.setHitArea([upgradeButton]);
            upgradeButton.on('pointerdown', function () {
                game.events.emit('boughtSkill', spell);
            });
        }
    };
    this._destroyAbilityStats = function () {
        if (abilityStats) {
            abilityStats.destroy(true);
            abilityStats = null;
        }
    };
    this._destroyCharacterInfo = function () {
        // TODO: Hide tips in case player presses TAB
        this._destroyAttributesInfo();
        this._destroyAbilityGroup();
        if (characterInfo) {
            characterInfo.destroy(true);
            characterInfo = null;
        }
    };
    this._destroyAbilityGroup = function () {
        if (abilityGroup) {
            abilityGroup.destroy(true);
            abilityGroup = null;
        }
    };
    this._destroyAttributesInfo = function () {
        if (attributesInfo) {
            attributesInfo.destroy(true);
            attributesInfoBox.destroy(true);
            attributesInfo = null;
            attributesInfoBox = null;
        }
    };

    // BUTTONS --------------------------------------------------------------------------------------------------------------------------------------------
    this._createInventoryTabButton = function (character, x, y, buttonImage, text, callback) {
        var button = game.add.graphics(),
            startX = character.characterConfig.isPlayerControlled ? x + 440 : x - 30,
            tabImage = game.add.image(startX, y + 20, buttonImage).setOrigin(0, 0);
        button.fillStyle(0x111111, 1);
        button.fillRect(startX, y + 20, 30, 30);
        characterInfo.add(button);
        tabImage.displayWidth = 30;
        tabImage.displayHeight = 30;
        characterInfo.add(tabImage);

        game.input.setHitArea([tabImage]);
        tabImage.on('pointerdown', function () {
            callback(character, x, y);
        });
        tabImage.on('pointerover', function () {
            game.tipsModal.showTips(startX + 30, y + 20, 100, 20, text);
        });
        tabImage.on('pointerout', function () {
            game.tipsModal.hideTips();
        });
    };
    this._createDescriptionTabButton = function (character, x, y, buttonImage, text, callback) {
        var button = game.add.graphics(),
            startX = character.characterConfig.isPlayerControlled ? x + 440 : x - 30,
            tabImage = game.add.image(startX, y + 50, buttonImage).setOrigin(0, 0);
        button.fillStyle(0x111111, 1);
        button.fillRect(startX, y + 50, 30, 30);
        characterInfo.add(button);
        tabImage.displayWidth = 30;
        tabImage.displayHeight = 30;
        characterInfo.add(tabImage);

        game.input.setHitArea([tabImage]);
        tabImage.on('pointerdown', function () {
            callback(character, x, y);
        });
        tabImage.on('pointerover', function () {
            game.tipsModal.showTips(startX + 30, y + 50, 100, 20, text);
        });
        tabImage.on('pointerout', function () {
            game.tipsModal.hideTips();
        });
    };
    this._createAbilitiesTabButton = function (character, x, y, buttonImage, text, callback) {
        var button = game.add.graphics(),
            startX = character.characterConfig.isPlayerControlled ? x + 440 : x - 30,
            tabImage = game.add.image(startX, y + 80, buttonImage).setOrigin(0, 0);
        button.fillStyle(0x111111, 1);
        button.fillRect(startX, y + 80, 30, 30);
        characterInfo.add(button);
        tabImage.displayWidth = 30;
        tabImage.displayHeight = 30;
        characterInfo.add(tabImage);

        game.input.setHitArea([tabImage]);
        tabImage.on('pointerdown', function () {
            callback(character, x, y);
        });
        tabImage.on('pointerover', function () {
            game.tipsModal.showTips(startX + 30, y + 80, 100, 20, text);
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
    this._createCloseButton = function (x, y, groupToDestroy, callback) {
        var closeButton = game.add.image(x, y, 'closeButton').setOrigin(0, 0);
        closeButton.displayHeight = 20;
        closeButton.displayWidth = 20;
        groupToDestroy.add(closeButton);
        game.input.setHitArea([closeButton]);
        closeButton.on('pointerdown', function () {
            groupToDestroy.destroy(true);
            groupToDestroy = null;
            if (callback) {
                callback();
            }
        });
    };
};