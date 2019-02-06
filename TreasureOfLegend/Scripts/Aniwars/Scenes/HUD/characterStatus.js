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

    this.showCharacterStatus = function (activeCharacter, characters) {
        var self = this,
            x = 0,
            y = this.scene.windowHeight - 110;

        if (this.isCharacterInfoMenuOpen) {
            this.showCharacterInfo(activeCharacter);
        }
        this._addCharacterStatusGroups();
        _.each(characters.characters.getChildren(), function (character) {
            self._createCharacterImage(character, x, y);
            self._createCharacterLifeBar(character, x, y);
            self._createCharacterManaBar(character, x, y);
            self._createCharacterMovementBar(character, x, y);
            self._createCharacterArmorBox(character, x, y);
            self._createCharacterMinorActionBox(character, x, y);
            self._createMainAttackImage(character, x, y);
            x += 100;
        });

        this.scene.input.setHitArea(this.characterBarImages.getChildren());
        _.each(this.characterBarImages.getChildren(), function (item) {
            item.on('pointerdown', _.bind(self.showCharacterInfo, self, item.objectToSend));
            item.on('pointerover', function () {
                self.scene.events.emit('highlightCharacter', item.objectToSend);
            });
            item.on('pointerout', function () {
                self.scene.events.emit('dehighlightCharacter', item.objectToSend);
            });
        });
        this.scene.input.setHitArea(this.characterMainAttack.getChildren());
        _.each(this.characterMainAttack.getChildren(), function (item) {
            item.on('pointerdown', function () {
                self.scene.events.emit('mainHandSelected', item.objectToSend);
            });
        });
    };
    this.showCharacterInfo = function (character) {
        // TODO: Show character inventory if player controlled otherwise show enemy info
        if (!this.isCharacterInfoMenuOpen) {
            var charConfig = character.characterConfig;
            this.isCharacterInfoMenuOpen = true;
            this.characterInfo = this.scene.add.group();
            var panel = this.scene.add.graphics();
            panel.fillStyle(0x111111, 0.8);
            panel.fillRect(0, this.scene.windowHeight - 510, 400, 400);
            this.characterInfo.add(panel);
            // Equiped Inventory -----------------------------------------------------------------------------------------------------
            this._createInventorySlot(75, this.scene.windowHeight - 500, 50, 50, character, charConfig.inventory.head);
            this._createInventorySlot(75, this.scene.windowHeight - 445, 50, 50, character, charConfig.inventory.body);
            this._createInventorySlot(20, this.scene.windowHeight - 445, 50, 50, character, charConfig.inventory.mainHand);
            this._createInventorySlot(130, this.scene.windowHeight - 445, 50, 50, character, charConfig.inventory.offHand);
            this._createInventorySlot(20, this.scene.windowHeight - 390, 50, 50, character, charConfig.inventory.hands);
            this._createInventorySlot(75, this.scene.windowHeight - 390, 50, 50, character, charConfig.inventory.feet);
            // Unequiped inventory ---------------------------------------------------------------------------------------------------
            var y = this.scene.windowHeight - 310;
            var x = 0;
            for (let i = 0; i < charConfig.inventory.slots.max; i++) {
                this._createInventorySlot(x, y, 50, 50, character, charConfig.inventory.slots.items[i]);
                x += 50;
                if (x >= 400) {
                    x = 0;
                    y += 50;
                }
            }
            this.characterInfo.name = 'characterInfo';
            this.characterInfoCloseButtonGroup = this.scene.createCloseButton(380, this.scene.windowHeight - 510, this.characterInfo);

            var experienceText = this.scene.add.text(220, this.scene.windowHeight - 470,
                'Experience: ' + charConfig.experience.current + '/' + charConfig.experience.nextLevel, { fill: '#FFF' });
            var strengthText = this.scene.add.text(220, this.scene.windowHeight - 455, 'Strength: ' + charConfig.attributes.strength, { fill: '#FFF' });
            var dexterityText = this.scene.add.text(220, this.scene.windowHeight - 440, 'Dexterity: ' + charConfig.attributes.dexterity, { fill: '#FFF' });
            var intelligenceText = this.scene.add.text(220, this.scene.windowHeight - 425, 'Intelligence: ' + charConfig.attributes.intelligence, { fill: '#FFF' });
            this.characterInfo.add(experienceText);
            this.characterInfo.add(strengthText);
            this.characterInfo.add(dexterityText);
            this.characterInfo.add(intelligenceText);

            this.showAttributePointSelection(character);
        } else {
            if (this.attributesInfo) {
                this.attributesInfo.destroy(true);
                this.attributesInfoBox.destroy(true);
            }
            this.isCharacterInfoMenuOpen = false;
            this.characterInfo.destroy(true);
            this.characterInfoCloseButtonGroup.destroy(true);
        }
    };
    this.showAttributePointSelection = function (character) {
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
            var attributePointsText = this.scene.add.text(220, this.scene.windowHeight - 485, 'Attribute points: ' + charConfig.experience.attributePoints, { fill: '#FFF' });
            this.attributesInfo.add(attributePointsText);
            for (let i = 0; i < 3; i++) {
                var attributeBox = this.scene.add.graphics();
                attributeBox.fillStyle(0xFFD700, 0.8);
                attributeBox.fillRect(200, this.scene.windowHeight - 455 + (i * 15), 15, 15);
                attributeBox.objectToSend = i + 1;
                var attributeButtonText = this.scene.add.text(203, this.scene.windowHeight - 455 + (i * 15), '+', { fill: '#FFF' });
                attributeButtonText.objectToSend = i + 1;
                this.attributesInfoBox.add(attributeBox);
                this.attributesInfoBox.add(attributeButtonText);
            }
            this.scene.input.setHitArea(this.attributesInfoBox.getChildren());
            _.each(this.attributesInfoBox.getChildren(), function (item) {
                item.on('pointerdown', function () {
                    self.scene.events.emit('addAttributePoint', item.objectToSend);
                });
            });
        }
    };

    this._addCharacterStatusGroups = function () {
        if (!this.characterBar) {
            this.characterBar = this.scene.add.group();
        } else {
            this.characterBar.destroy(true);
            this.characterBar = this.scene.add.group();
        }
        if (!this.characterBarImages) {
            this.characterBarImages = this.scene.add.group();
        } else {
            this.characterBarImages.destroy(true);
            this.characterBarImages = this.scene.add.group();
        }
        if (!this.characterMainAttack) {
            this.characterMainAttack = this.scene.add.group();
        } else {
            this.characterMainAttack.destroy(true);
            this.characterMainAttack = this.scene.add.group();
        }
    };
    this._createCharacterImage = function (character, x, y) {
        var characterImage = this.scene.add.image(x, y, character.characterConfig.image).setOrigin(0, 0);
        characterImage.displayWidth = 75;
        characterImage.displayHeight = 75;
        characterImage.objectToSend = character;
        this.characterBarImages.add(characterImage);
    };
    this._createCharacterLifeBar = function (character, x, y) {
        var charConfig = character.characterConfig,
            percentageOfLife = (100 * charConfig.life.current) / charConfig.life.max,
            lifeWidth = (75 * percentageOfLife) / 100,
            lifeBar = this.scene.add.graphics(),
            lifeText = this.scene.add.text(x + 35,
                y + 75,
                (charConfig.life.current + '/' + charConfig.life.max),
                { fill: '#FFF', fontSize: '9px' });
        lifeBar.fillStyle(0x990000, 0.8);
        lifeBar.fillRect(x, y + 75, lifeWidth, 10);
        this.characterBar.add(lifeBar);
        this.characterBar.add(lifeText);
    };
    this._createCharacterManaBar = function (character, x, y) {
        var charConfig = character.characterConfig,
            percentageOfMana = (100 * (charConfig.mana.max - charConfig.mana.spent)) / charConfig.mana.max,
            manaWidth = (75 * percentageOfMana) / 100,
            manaBar = this.scene.add.graphics(),
            manaText = this.scene.add.text(x + 35,
                y + 85,
                ((charConfig.mana.max - charConfig.mana.spent) + '/' + charConfig.mana.max),
                { fill: '#FFF', fontSize: '9px' });
        manaBar.fillStyle(0x000099, 0.8);
        manaBar.fillRect(x, y + 85, manaWidth, 10);
        this.characterBar.add(manaBar);
        this.characterBar.add(manaText);
    };
    this._createCharacterMovementBar = function (character, x, y) {
        var charConfig = character.characterConfig,
            percentageOfMovement = (100 * (charConfig.movement.max - charConfig.movement.spent)) /
                charConfig.movement.max,
            movementWidth = (75 * percentageOfMovement) / 100,
            movementBar = this.scene.add.graphics(),
            movementText = this.scene.add.text(x + 35,
                y + 95,
                ((charConfig.movement.max - charConfig.movement.spent) + '/' + charConfig.movement.max),
                { fill: '#FFF', fontSize: '9px' });
        movementBar.fillStyle(0x999900, 0.8);
        movementBar.fillRect(x, y + 95, movementWidth, 10);
        this.characterBar.add(movementBar);
        this.characterBar.add(movementText);
    };
    this._createCharacterArmorBox = function (character, x, y) {
        var charConfig = character.characterConfig,
            armorBox = this.scene.add.graphics(),
            armorText = this.scene.add.text(x + 75, y, charConfig.armor, { fill: '#FFF', fontSize: '18px' });
        armorBox.fillStyle(0xcccccc, 0.8);
        armorBox.fillRect(x + 75, y, 25, 25);
        this.characterBar.add(armorBox);
        this.characterBar.add(armorText);
    };
    this._createCharacterMinorActionBox = function (character, x, y) {
        var charConfig = character.characterConfig,
            minorActionsBox = this.scene.add.graphics(),
            minorActionsText = this.scene.add.text(x + 75,
                y + 50,
                (charConfig.energy.max - charConfig.energy.spent),
                { fill: '#FFF', fontSize: '18px' });
        minorActionsBox.fillStyle(0xcccccc, 0.8);
        minorActionsBox.fillRect(x + 75, y + 50, 25, 25);
        this.characterBar.add(minorActionsBox);
        this.characterBar.add(minorActionsText);
    };
    this._createMainAttackImage = function (character, x, y) {
        var charConfig = character.characterConfig,
            mainAttackImage = charConfig.energy.selectedAction
                ? charConfig.energy.selectedAction.image
                : charConfig.inventory.mainHand.image,
            mainAttack = this.scene.add.image(x + 75, y + 75, mainAttackImage).setOrigin(0, 0);
        mainAttack.displayWidth = 25;
        mainAttack.displayHeight = 25;
        mainAttack.objectToSend = character;
        this.characterMainAttack.add(mainAttack);
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