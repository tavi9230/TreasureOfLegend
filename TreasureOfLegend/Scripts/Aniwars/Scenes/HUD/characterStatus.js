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

    this.toggleCharacterInfo = function (character, forceRemainOpen) {
        // TODO: Show character inventory if player controlled otherwise show enemy info
        if (!this.isCharacterInfoMenuOpen) {
            var x = character.characterConfig.isPlayerControlled ? 0 : this.scene.windowWidth - 440,
                y = 0;
            this._createInventory(character, x, y);
            this._createCharacterInfoScreen(character, x, y);
        } else {
            if (this.attributesInfo) {
                this.attributesInfo.destroy(true);
                this.attributesInfoBox.destroy(true);
            }
            this.isCharacterInfoMenuOpen = false;
            this.characterInfo.destroy(true);
            this.characterInfoCloseButtonGroup.destroy(true);
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
                var attributeButton = this.scene.add.image(x + 200, y + 50 + (i * 15), 'plusButton');
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
            startX = x;
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
        if (isPlayerControlled) {
            y += 220;
            for (let i = 0; i < charConfig.inventory.slots.max; i++) {
                this._createInventorySlot(x, y, 50, 50, character, charConfig.inventory.slots.items[i]);
                x += 55;
                if (x >= startX + 440) {
                    x = isPlayerControlled ? 0 : this.scene.windowWidth - 440;
                    y += 55;
                }
            }
        }
        x = isPlayerControlled ? 0 : this.scene.windowWidth - 440;
        y = 0;
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
                fill: '#FFF'
            };
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
        if (isPlayerControlled) {
            this.showAttributePointSelection(character, x, y);
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