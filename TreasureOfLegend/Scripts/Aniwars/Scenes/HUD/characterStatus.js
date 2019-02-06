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
            this.whosInventory = character;
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
            if ((this.whosInventory && (this.whosInventory.x !== character.x || this.whosInventory.y !== character.y)) || forceRemainOpen) {
                this.toggleCharacterInfo(character);
            }
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