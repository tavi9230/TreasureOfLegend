export const HUDLowerPanel = function (scene) {
    var game = scene,
        hudbuttons = null,
        _createButton = function (coords, imageName, displayDimensions, callbacks) {
            var button = game.add.image(coords.x, coords.y, imageName).setOrigin(0, 0);
            button.displayHeight = displayDimensions.height;
            button.displayWidth = displayDimensions.width;
            button.name = imageName;
            button.on('pointerdown', callbacks.pointerdown);
            button.on('pointerover', callbacks.pointerover);
            button.on('pointerout', callbacks.pointerout);
            hudbuttons.add(button);
        },
        _createButtons = _.bind(function () {
            _createButton(
                { x: game.windowWidth - 170, y: game.windowHeight - 150 },
                'endTurnButton',
                { height: 100, width: 100 },
                {
                    pointerdown: _.bind(function () {
                        this.endTurn();
                    }, this),
                    pointerover: function () {
                        game.tipsModal.showTips(game.windowWidth - 170, game.windowHeight - 175, 87, 20, 'End Turn (?)');
                    },
                    pointerout: function () {
                        game.tipsModal.hideTips();
                    }
                }
            );
            _createButton(
                { x: game.windowWidth - 80, y: game.windowHeight - 60 },
                'openMenuButton',
                { height: 50, width: 50 },
                {
                    pointerdown: _.bind(function () {
                        this.openMainMenu();
                    }, this),
                    pointerover: function () {
                        game.tipsModal.showTips(game.windowWidth - 130, game.windowHeight - 85, 97, 20, 'Open Menu (ESC)');
                    },
                    pointerout: function () {
                        game.tipsModal.hideTips();
                    }
                }
            );
            _createButton(
                { x: game.windowWidth - 210, y: game.windowHeight - 180 },
                'spellsButton',
                { height: 50, width: 50 },
                {
                    pointerdown: _.bind(function () {
                        this.openSpellBook(game.activeScene.activeCharacter);
                    }, this),
                    pointerover: function () {
                        game.tipsModal.showTips(game.windowWidth - 255, game.windowHeight - 205, 97, 20, 'Open Spell Book (S)');
                    },
                    pointerout: function () {
                        game.tipsModal.hideTips();
                    }
                }
            );
            _createButton(
                { x: game.windowWidth - 210, y: game.windowHeight - 60 },
                'soulsButton',
                { height: 50, width: 50 },
                {
                    pointerdown: _.bind(function () {
                        this.openSpellBook(game.activeScene.activeCharacter);
                    }, this),
                    pointerover: function () {
                        game.tipsModal.showTips(game.windowWidth - 255, game.windowHeight - 85, 97, 20, 'Total Souls');
                    },
                    pointerout: function () {
                        game.tipsModal.hideTips();
                    }
                }
            );
            _createButton(
                { x: game.windowWidth - 80, y: game.windowHeight - 180 },
                'walkButton',
                { height: 50, width: 50 },
                {
                    pointerdown: _.bind(function () {
                        this.useDash();
                    }, this),
                    pointerover: function () {
                        game.tipsModal.showTips(game.windowWidth - 80, game.windowHeight - 205, 97, 20, 'Dash (W)');
                    },
                    pointerout: function () {
                        game.tipsModal.hideTips();
                    }
                }
            );
            _createButton(
                { x: game.windowWidth - 145, y: game.windowHeight - 210 },
                'mainHandButton',
                { height: 50, width: 50 },
                {
                    pointerdown: _.bind(function () {
                        this.useMainHand();
                    }, this),
                    pointerover: function () {
                        game.tipsModal.showTips(game.windowWidth - 175, game.windowHeight - 235, 97, 20, 'Use Main Hand (A)');
                    },
                    pointerout: function () {
                        game.tipsModal.hideTips();
                    }
                }
            );
            _createButton(
                { x: game.windowWidth - 145, y: game.windowHeight - 270 },
                'offHandButton',
                { height: 50, width: 50 },
                {
                    pointerdown: _.bind(function () {
                        this.useMainHand();
                    }, this),
                    pointerover: function () {
                        game.tipsModal.showTips(game.windowWidth - 175, game.windowHeight - 295, 97, 20, 'Use Offhand (D)');
                    },
                    pointerout: function () {
                        game.tipsModal.hideTips();
                    }
                }
            );
            _createButton(
                { x: game.windowWidth - 230, y: game.windowHeight - 120 },
                'inventoryButton',
                { height: 50, width: 50 },
                {
                    pointerdown: _.bind(function () {
                        this.openCharacterInventory();
                    }, this),
                    pointerover: function () {
                        game.tipsModal.showTips(game.windowWidth - 260, game.windowHeight - 145, 97, 20, 'Open Inventory (TAB)');
                    },
                    pointerout: function () {
                        game.tipsModal.hideTips();
                    }
                }
            );
            _createButton(
                { x: game.windowWidth - 60, y: game.windowHeight - 120 },
                'inspectButton',
                { height: 50, width: 50 },
                {
                    pointerdown: _.bind(function () {
                        this.selectInspectAction();
                    }, this),
                    pointerover: function () {
                        game.tipsModal.showTips(game.windowWidth - 80, game.windowHeight - 145, 97, 20, 'Inspect (E)');
                    },
                    pointerout: function () {
                        game.tipsModal.hideTips();
                    }
                }
            );
        }, this);

    this.createLowerPanel = function () {
        game.turn = 1;
        hudbuttons = game.add.group();
        _createButtons();
        game.soulsText = game.add.text(game.windowWidth - 193, game.windowHeight - 30, '0', { fill: '#D22' });
        this.turnText = game.add.text(game.windowWidth - 125, game.windowHeight - 92, game.turn, { fill: '#FFF' });
        this.turn = 1;
        game.input.setHitArea(hudbuttons.getChildren());
    };
    this.changeTurn = function () {
        this.turn++;
        this.turnText.setText(this.turn);
    };
    this.endTurn = function () {
        game.events.emit('endTurn');
    };
    this.useDash = function () {
        game.events.emit('useDash');
    };
    this.useMainHand = function () {
        game.events.emit('useMainHand');
    };
    this.toggleActionButtons = function (isVisible) {
        var buttons = hudbuttons.getChildren().filter(function (btn) {
            return btn.name === 'mainHandButton'
                || btn.name === 'offHandButton'
                || btn.name === 'inspectButton'
                || btn.name === 'walkButton'
                || btn.name === 'soulsButton'
                || btn.name === 'spellsButton'
                || btn.name === 'inventoryButton';
        });
        _.each(buttons, function (button) {
            button.visible = isVisible;
        });

        buttons = hudbuttons.getChildren().filter(function (btn) {
            return btn.name === 'soulsButton';
        });
        buttons[0].visible = isVisible;
        game.soulsText.visible = isVisible;
    };
    this.setButtonTint = function (buttonName) {
        if (buttonName) {
            var button = hudbuttons.getChildren().filter(function (button) {
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
            _.each(hudbuttons.getChildren(), function (button) {
                button.clearTint();
            });
        }
    };
    this.selectInspectAction = function () {
        game.events.emit('inspectSelected');
    };
    this.openMainMenu = function () {
        game.scene.sleep('HUDScene');
        game.scene.sleep(game.sceneName);
        game.scene.wake('MainMenuScene');
    };
    this.openCharacterInventory = function (character) {
        // TODO: Split this method into two: one for clicking the button, the other for clicking a character
        var char = character && character.type === 'Sprite' ? character : game.activeScene.activeCharacter;
        game.characterStatus.toggleCharacterInventory(char);
    };
    this.openSpellBook = function (character) {
        var x = character.characterConfig.isPlayerControlled ? 0 : game.windowWidth - 440,
            y = 0;
        // TODO: Implement a toggle system
        game.characterStatus._showCharacterAbilities(character, x, y);
    };
};