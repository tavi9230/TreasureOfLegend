import { EnumHelper } from 'TreasureOfLegend/Helpers/enumHelper';

export const HUDCharacterStatus = function (scene) {
    var game = scene,
        characterInventoryTabGroup = null,
        characterDescriptionTabGroup = null,
        characterAbilitiesTabGroup = null,
        abilityStats = null,
        attributesInfo = null,
        attributesInfoBox = null,
        abilityGroup = null,
        enemyInventory = null,
        itemStats = null,
        selectedItem = null,
        damageArray = ['slashing', 'piercing', 'bludgeoning', 'fire', 'cold', 'poison', 'acid', 'lightning', 'necrotic', 'radiant', 'thunder', 'psychic', 'force'],
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
    this.refreshInventoryTab = function (character) {
        if (characterInventoryTabGroup) {
            this.openInventoryTab(character);
        }
    };
    this.openInventoryTab = function (character) {
        this.destroyAllCharacterGroups();
        this.toggleInventoryTab(character);
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
            this._createInventorySlot(x + 75, y + 10, character, charConfig.inventory.head, 'head');
            this._createInventorySlot(x + 75, y + 65, character, charConfig.inventory.body, 'body');
            this._createInventorySlot(x + 20, y + 65, character, charConfig.inventory.mainHand, 'mainHand');
            this._createInventorySlot(x + 130, y + 65, character, charConfig.inventory.offHand, 'offHand');
            this._createInventorySlot(x + 20, y + 120, character, charConfig.inventory.hands, 'hands');
            this._createInventorySlot(x + 130, y + 120, character, charConfig.inventory.feet, 'feet');
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
    this._createInventorySlot = function (x, y, character, item, location) {
        var self = this,
            image = null,
            box = game.add.image(x, y, 'inventoryBox').setOrigin(0, 0);
        box.displayWidth = 50;
        box.displayHeight = 50;
        box.name = 'inventoryBox';
        if (character.x === game.activeScene.activeCharacter.x &&
            character.y === game.activeScene.activeCharacter.y) {
            game.input.setHitArea([box]);
            box.on('pointerdown', function () {
                if (selectedItem) {
                    game.events.emit('replaceItem', { selectedItem: selectedItem, itemToReplace: null });
                }
            });
        }
        characterInventoryTabGroup.add(box);

        if (item) {
            item.location = location;
            image = game.add.image(x, y, item.image).setOrigin(0, 0);
            image.displayWidth = 50;
            image.displayHeight = 50;
            game.input.setHitArea([image]);
            image.on('pointerover', function () {
                self._showItemStats({ x: x, y: y, item: item, character: character });
            });
            image.on('pointerout', this._destroyItemStats);
            if (character.x === game.activeScene.activeCharacter.x &&
                character.y === game.activeScene.activeCharacter.y) {
                image.on('pointerdown', function () {
                    var dropButton;
                    if (!selectedItem) {
                        if (item.type !== EnumHelper.inventoryEnum.defaultEquipment) {
                            box.setTexture('inventoryBoxSelected');
                            selectedItem = item;
                            self._createDropButton(x + 40, y, character, item, characterInventoryTabGroup);
                        }
                    } else if (selectedItem !== item) {
                        var inventoryBoxes = characterInventoryTabGroup.getChildren().filter(function (obj) {
                            return obj.name === 'inventoryBox';
                        });
                        _.each(inventoryBoxes, function (box) {
                            box.setTexture('inventoryBox');
                        });
                        dropButton = characterInventoryTabGroup.getChildren().find(function (obj) {
                            return obj.name === 'dropButton';
                        });
                        dropButton.destroy();
                        game.events.emit('replaceItem', { selectedItem: selectedItem, itemToReplace: item });
                        selectedItem = null;
                    } else {
                        dropButton = characterInventoryTabGroup.getChildren().find(function (obj) {
                            return obj.name === 'dropButton';
                        });
                        dropButton.destroy();
                        box.setTexture('inventoryBox');
                        selectedItem = null;
                    }
                });
            }
            characterInventoryTabGroup.add(image);
        }
    };
    this._createUnequippedInventorySlots = function (character, x, y) {
        var startX = x,
            charConfig = character.characterConfig;
        for (let i = 0; i < charConfig.inventory.slots.max; i++) {
            this._createInventorySlot(x, y, character, character.characterConfig.inventory.slots.items[i], 'inventory');
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

            var armorText = game.add.text(x + 10, y + 100, 'Armor total: ' + (charConfig.armor + charConfig.attributes.dexterity), textStyle);
            var naturalArmorText = game.add.text(x + 10, y + 115, 'Natural Armor: ' + charConfig.attributes.dexterity, textStyle);
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
                vulnerabilities += damageArray[charConfig[type][i] - 1] + ', ';
            } else {
                vulnerabilities += damageArray[charConfig[type][i] - 1];
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
                if (x + 80 >= startX + 440) {
                    x = startX;
                    y += 80;
                }
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
                        self.destroyAllCharacterGroups();
                    }
                });
            });
        } else {
            this.destroyAllCharacterGroups();
            this._destroyItemStats();
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
                    width: 190
                }
            };
        panel.fillStyle(0x111111, 1);
        panel.fillRect(image.x + 50, image.y, 200, 200);
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
        rangeText = game.add.text(image.x + 55, image.y + 90, 'Range: ' + ability.range, textStyle);
        abilityStats.add(rangeText);
        costText = game.add.text(image.x + 55, image.y + 105, 'Cost: ' + ability.cost, textStyle);
        abilityStats.add(costText);
        levelText = game.add.text(image.x + 55, image.y + 120, 'Level: ' + ability.level, textStyle);
        abilityStats.add(levelText);
        isPassiveText = game.add.text(image.x + 55, image.y + 135, ability.isPassive ? 'Passive' : 'Active', textStyle);
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

    // LOOTBAG -------------------------------------------------------------------------------------------------------------------------------------------------------
    this.openCharacterInventoryAndLootbag = function (lootbag) {
        var activeCharacter = game.activeScene.activeCharacter;
        this.refreshInventoryTab(activeCharacter);
        this.showDeadCharacterInventory(lootbag);
    };
    this.showDeadCharacterInventory = function (lootbag) {
        this.closeLootbag();
        var self = this,
            activeCharacter = game.activeScene.activeCharacter,
            lootbagConfig = lootbag.objectConfig,
            characterBelonging = lootbagConfig.belongsTo.characterConfig,
            panel = game.add.graphics(),
            x = 480,
            y = 10,
            image;
        this.openInventoryTab(activeCharacter);
        enemyInventory = game.add.group();
        panel.fillStyle(0x111111, 0.8);
        panel.fillRect(470, 0, 220, 440);
        enemyInventory.add(panel);
        y = this._addToEnemyInventory('mainHand', characterBelonging, x, y);
        y = this._addToEnemyInventory('offHand', characterBelonging, x, y);
        y = this._addToEnemyInventory('head', characterBelonging, x, y);
        y = this._addToEnemyInventory('body', characterBelonging, x, y);
        y = this._addToEnemyInventory('hands', characterBelonging, x, y);
        y = this._addToEnemyInventory('feet', characterBelonging, x, y);
        if (characterBelonging.inventory.slots.items.length > 0) {
            _.each(characterBelonging.inventory.slots.items, function (item) {
                item.isEquipped = false;
                image = game.add.image(x, y, item.image).setOrigin(0, 0);
                image.displayWidth = 50;
                image.displayHeight = 50;
                image.objectToSend = item;
                enemyInventory.add(image);
                y += 60;
            });
        }
        game.input.setHitArea(enemyInventory.getChildren());
        _.each(enemyInventory.getChildren(), function (item) {
            item.on('pointerdown', function () {
                game.events.emit('getItemFromLootBag', { item: item.objectToSend, lootbag: lootbag });
            });
            item.on('pointerover', function () {
                self._showItemStats({ x: item.x, y: item.y, item: item.objectToSend, character: activeCharacter });
            });
            item.on('pointerout', self._destroyItemStats);
        });
    };
    this.closeLootbag = function () {
        if (enemyInventory) {
            enemyInventory.destroy(true);
            enemyInventory = null;
            this._destroyItemStats();
        }
    };
    // DESTROY METHODS -----------------------------------------------------------------------------------------------------------------------------------------------
    // Inventory TAB
    this._destroyItemStats = function () {
        if (itemStats) {
            itemStats.destroy(true);
            itemStats = null;
        }
    };

    this._destroyCharacterInventoryTab = function () {
        if (characterInventoryTabGroup) {
            characterInventoryTabGroup.destroy(true);
            characterInventoryTabGroup = null;
        }
        this._destroyItemStats();
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
        this.closeLootbag();
        selectedItem = null;
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
            game.tipsModal.showTips(startX + 30, y, text);
        });
        tabImage.on('pointerout', function () {
            game.tipsModal.hideTips();
        });
    };
    this._createDropButton = function (x, y, character, itemToDrop, group) {
        var dropButton = game.add.image(x, y, 'closeButton').setOrigin(0, 0);
        dropButton.displayHeight = 10;
        dropButton.displayWidth = 10;
        dropButton.name = 'dropButton';
        group.add(dropButton);
        game.input.setHitArea([dropButton]);

        dropButton.on('pointerdown', function () {
            game.events.emit('dropItem', itemToDrop);
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
        });
    };

    // PRIVATE ------------------------------------------------------------------------------------------------------------------------------------------
    this._getCoordsForTabs = function (character) {
        var x = character.characterConfig.isPlayerControlled ? 0 : game.windowWidth - 440,
            y = 0;
        return {
            x: x,
            y: y
        };
    };
    this._showItemStats = function (config) {
        if (config.item.type !== EnumHelper.inventoryEnum.defaultEquipment) {
            var item = config.item,
                compareBox = game.add.graphics();
            compareBox.fillStyle(0x222222, 1);
            compareBox.fillRect(config.x + 50, config.y, 150, 150);

            itemStats = game.add.group();
            itemStats.add(compareBox);

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
    };
    this._addToEnemyInventory = function (location, characterBelonging, x, y) {
        if (characterBelonging.inventory[location].type !== EnumHelper.inventoryEnum.defaultEquipment) {
            characterBelonging.inventory[location].isEquipped = false;
            var image = game.add.image(x, y, characterBelonging.inventory[location].image).setOrigin(0, 0);
            image.displayWidth = 50;
            image.displayHeight = 50;
            image.objectToSend = characterBelonging.inventory[location];
            enemyInventory.add(image);
            y += 60;
        }
        return y;
    };
    this._createItemStatsBox = function (item, characterConfig, x, y, location) {
        var damage = '',
            nameText, descriptionText, damageText, rangeText, holdText, durabilityText,
            equippedBox, equippedNameText, equippedDescriptionText, equippedDamageText, equippedRangeText, equippedHoldText, equippedDurabilityText,
            textStyle = {
                fill: '#FFF',
                wordWrap: {
                    width: 145
                }
            },
            equippedHasDamage,
            equippedHasArmor;
        nameText = game.add.text(x + 55, y, item.name, textStyle);
        descriptionText = game.add.text(x + 55, y + 30, item.description, textStyle);
        if (item.damage) {
            var damage = '';
            for (let i = 0; i < item.damage.length; i++) {
                if (i !== item.damage.length - 1) {
                    damage += item.damage[0].value + ' ' + damageArray[item.damage[0].type - 1] + ', ';
                } else {
                    damage += item.damage[0].value + ' ' + damageArray[item.damage[0].type - 1];
                }
            }
            damageText = game.add.text(x + 55, y + 60, 'Damage: ' + damage, textStyle);
        } else if (item.armor) {
            damageText = game.add.text(x + 55, y + 60, 'Armor: ' + item.armor, textStyle);
        } else {
            damageText = game.add.text(x + 55, y + 60, 'Quantity: ' + item.quantity, textStyle);
        }
        if (item.damage) {
            rangeText = game.add.text(x + 55, y + 105, 'Range: ' + item.range, textStyle);
            holdText = game.add.text(x + 55, y + 120, 'Hold: ' + item.hold, textStyle);
            itemStats.add(rangeText);
            itemStats.add(holdText);
            durabilityText = game.add.text(x + 55, y + 135, 'Durability: ' + item.durability.current + '/' + item.durability.max, textStyle);
        } else if (item.armor) {
            durabilityText = game.add.text(x + 55, y + 135, 'Durability: ' + item.durability.current + '/' + item.durability.max, textStyle);
        }

        itemStats.add(nameText);
        itemStats.add(descriptionText);
        itemStats.add(damageText);
        if (durabilityText) {
            itemStats.add(durabilityText);
        }
        if (characterConfig.inventory[location].type !== EnumHelper.inventoryEnum.defaultEquipment && !item.isEquipped) {
            equippedBox = game.add.graphics();
            equippedBox.fillStyle(0x222222, 1);
            equippedBox.fillRect(x + 200, y, 150, 150);
            equippedHasDamage = characterConfig.inventory[location].damage;
            equippedHasArmor = characterConfig.inventory[location].armor;
            equippedNameText = game.add.text(x + 205, y, characterConfig.inventory[location].name, textStyle);
            equippedDescriptionText = game.add.text(x + 205, y + 30, characterConfig.inventory[location].description, textStyle);
            if (equippedHasDamage) {
                damage = '';
                for (let i = 0; i < characterConfig.inventory[location].damage.length; i++) {
                    if (i !== characterConfig.inventory[location].damage.length - 1) {
                        damage += characterConfig.inventory[location].damage[0].value + ' ' + damageArray[characterConfig.inventory[location].damage[0].type - 1] + ', ';
                    } else {
                        damage += characterConfig.inventory[location].damage[0].value + ' ' + damageArray[characterConfig.inventory[location].damage[0].type - 1];
                    }
                }
                equippedDamageText = game.add.text(x + 205, y + 60, 'Damage: ' + damage, textStyle);
            } else if (equippedHasArmor) {
                equippedDamageText = game.add.text(x + 205, y + 60, 'Armor: ' + characterConfig.inventory[location].armor, textStyle);
            } else {
                equippedDamageText = game.add.text(x + 205, y + 60, 'Quantity: ' + characterConfig.inventory[location].quantity, textStyle);
            }
            if (equippedHasDamage) {
                equippedRangeText = game.add.text(x + 205, y + 105, 'Range: ' + characterConfig.inventory[location].range, textStyle);
                equippedHoldText = game.add.text(x + 205, y + 120, 'Hold: ' + characterConfig.inventory[location].hold, textStyle);
                itemStats.add(equippedRangeText);
                itemStats.add(equippedHoldText);
                equippedDurabilityText = game.add.text(x + 205, y + 135,
                    'Durability: ' + characterConfig.inventory[location].durability.current + '/' + characterConfig.inventory[location].durability.max, textStyle);
            } else if (equippedHasArmor) {
                equippedDurabilityText = game.add.text(x + 205, y + 135,
                    'Durability: ' + characterConfig.inventory[location].durability.current + '/' + characterConfig.inventory[location].durability.max, textStyle);
            }

            itemStats.add(equippedBox);
            itemStats.add(equippedNameText);
            itemStats.add(equippedDescriptionText);
            itemStats.add(equippedDamageText);
            if (equippedDurabilityText) {
                itemStats.add(equippedDurabilityText);
            }
        }
    };
};