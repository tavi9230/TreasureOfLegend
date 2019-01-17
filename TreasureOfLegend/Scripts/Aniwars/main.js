import {AssetLoader} from 'Aniwars/assetLoader';
import {BattleMap} from 'Aniwars/map';
import {Character} from 'Aniwars/character';

export const AniwarsGame = function () { 
    var BootScene = new Phaser.Class({
        Extends: Phaser.Scene,

        initialize: function BootScene () {
            Phaser.Scene.call(this, { key: 'BootScene' });
        },
 
        preload() {
            var assetLoader = new AssetLoader(this);
            assetLoader.loadImages();
            assetLoader.loadSounds();
        },
 
        create() {
            this.scene.start('WorldScene');
        }
    });
 
    var WorldScene = new Phaser.Class({
        Extends: Phaser.Scene,
 
        initialize: function WorldScene () {
            Phaser.Scene.call(this, { key: 'WorldScene' });
        },

        preload() {
        
        },
        create() {
            this.hudScene = this.scene.get('HUDScene');
            this.activeMap = new BattleMap(this);
            this.activeMap.generateMap();
            var self = this;
            _.each(this.activeMap.tiles.getChildren(), function(tile) {
                //mouse input on clicking game tiles and hovering over them
                tile.on('pointerdown', _.bind(self._moveCharacterOnClick, self, tile));
                tile.on('pointerover', _.bind(self._highlightPathToThis, self, tile));
            });
            _.each(this.activeMap.objects.getChildren(), function(object) {
                //mouse input on clicking game objects
                object.on('pointerdown', _.bind(self._interactWithObject, self, object));
                object.on('pointerover', _.bind(self._showDescription, self, object));
            });

            //party characters
            this.characters = new Character(this, this.add.group());
            this.characters.addNewCharacter(600, 350, 'character');
            
            this.activeCharacter = this.characters.characters.getChildren()[0];
            this.activeMap.showMovementGrid();

            //enemy characters
            this.enemies = new Character(this, this.add.group());
            this.enemies.addNewCharacter(1100, 350, 'character');

            //mouse input on clicking game objects and hovering over them
            //this.input.on('gameobjectdown', _.bind(this._moveCharacterOnClick, this));
            //this.input.on('pointerover', _.bind(this._highlightPathToThis, this));

            //main camera
            this.cameras.main.setBounds(0, 0, this.activeMap.levelMap.length * 50, this.activeMap.levelMap.length * 50 + 100);
            this.cameras.main.startFollow(this.activeCharacter, true, 0.09, 0.09);
            //this.cameras.main.setZoom(1.2);

            this.cursors = this.input.keyboard.createCursorKeys();

            this.events.emit('activeCharacterChanged', this.activeCharacter);
            this.events.emit('activeCharacterPositionModified', this.activeCharacter);

            this.hudScene.events.on('endTurn', function() {
                if (self.activeCharacter.characterConfig.path.length === 0 && !self.activeCharacter.characterConfig.isMoving) {
                    self.activeCharacter.characterConfig.movementSpent = 0;
                    self.activeCharacter.characterConfig.minorActionsSpent = 0;
                    self.activeCharacter.characterConfig.actionsSpent = 0;
                    self.events.emit('activeCharacterChanged', self.activeCharacter);
                    self.activeMap.showMovementGrid();
                }
            });
        },
        update() {
            this._checkManager();
            this._moveCamera();
        },
        _checkManager() {
            if (this.activeCharacter.characterConfig.isMoving) {
                this.events.emit('activeCharacterPositionModified', this.activeCharacter);
                this.characters.stopActiveCharacter();
            } else if (!this.activeCharacter.characterConfig.isMoving && this.activeCharacter.characterConfig.path.length > 0) {
                this.characters.keepMovingActiveCharacter();
            }
        },
        _moveCharacterOnClick(tile) {
            this.characters.moveActiveCharacter(tile);
        },
        _highlightPathToThis(tile) {
            this.events.emit('showObjectDescription', tile);
            this.activeMap.highlightPathToThis(tile);
        },
        _moveCamera() {
            //camera movement not done correctly
            if (this.cursors.left.isDown) {
                this.cameras.main.x += 10;
                if (this.cameras.main.x > 0) {
                    this.cameras.main.x = 0;
                }
                    
            }
            
            if (this.cursors.right.isDown) {
                this.cameras.main.x -= 10;
                if (this.cameras.main.x < this.activeMap.levelMap[0].length * 50) {
                    this.cameras.main.x = this.activeMap.levelMap[0].length * 50;
                }
            }
            
            if (this.cursors.up.isDown) {
                this.cameras.main.y += 10;
                if (this.cameras.main.y > 0) {
                    this.cameras.main.y = 0;
                }
                    
            }
            if (this.cursors.down.isDown) {
                this.cameras.main.y -= 10;
                if (this.cameras.main.y < -100) {
                    this.cameras.main.y = -100;
                }
            }
        },
        _interactWithObject: function(object) {
            this.characters.interactWithObject(object);
        },
        _showDescription: function(object) {
            this.events.emit('showObjectDescription', object);
        }
    });

    var HUDScene = new Phaser.Class({
        Extends: Phaser.Scene,

        initialize: function HUDScene () {
            Phaser.Scene.call(this, { key: 'HUDScene', active: true });
            this.activeCharacterPosition = { x: 0, y: 0 };
        },
 
        preload() {
            var assetLoader = new AssetLoader(this);
            assetLoader.loadHUDImages();
        },
 
        create() {
            //create player hud
            var self = this;
            this.hudbuttons = this.add.group();
            this.hudbackground = this.add.image(0, 700, 'hudbackground').setOrigin(0, 0);
            var endTurnButton = this.add.image(1100, 710, 'hourglass').setOrigin(0, 0);
            endTurnButton.on('pointerdown', _.bind(this._endTurn, this));
            this.hudbuttons.add(endTurnButton);
            this.input.setHitArea(this.hudbuttons.getChildren());

            this.locationText = this.add.text(1080, 780, 'X:0, Y:0', { fill: '#000' });
            this.hpText = this.add.text(500, 710, 'HP: 0', { fill: '#000' });
            this.manaText = this.add.text(500, 730, 'Mana: 0', { fill: '#000' });
            this.armorText = this.add.text(500, 750, 'Armor: 0', { fill: '#000' });
            this.movementText = this.add.text(500, 770, 'Movement: 0', { fill: '#000' });
            this.actionsText = this.add.text(610, 710, 'Actions: 0', { fill: '#000' });
            this.minorActionsText = this.add.text(610, 730, 'Minor Actions: 0', { fill: '#000' });
            this.descriptionsText = this.add.text(10, 710, '', { fill: '#000' });

            this.turn = 1;
            this.turnText = this.add.text(1150, 750, this.turn, { fill: '#000' });

            this.worldScene = this.scene.get('WorldScene');

            this.worldScene.events.on('activeCharacterChanged', _.bind(this._setTexts, this));
            this.worldScene.events.on('activeCharacterActed', _.bind(this._setTexts, this));
            this.worldScene.events.on('activeCharacterPositionModified', function (activeCharacter) {
                self._setPositionText(activeCharacter);
            });
            this.worldScene.events.on('showObjectDescription', function(object) {
                self.descriptionsText.setText(object.objectConfig.description);
            });
        },
        _setTexts: function (activeCharacter) {
            this._setHpText(activeCharacter);
            this._setManaText(activeCharacter);
            this._setMovementText(activeCharacter);
            this._setArmorText(activeCharacter);
            this._setActionsText(activeCharacter);
            this._setMinorActionsText(activeCharacter);
        },
        _setPositionText: function(activeCharacter) {
            this.locationText.setText('X:'+ Math.floor(activeCharacter.x / 50) + ', Y:' + Math.floor(activeCharacter.y / 50));
        },
        _setHpText: function(activeCharacter) {
            this.hpText.setText('HP: ' + activeCharacter.characterConfig.life);
        },
        _setManaText: function(activeCharacter) {
            this.manaText.setText('Mana: ' + activeCharacter.characterConfig.mana);
        },
        _setMovementText: function(activeCharacter) {
            this.movementText.setText('Movement: ' + (activeCharacter.characterConfig.movement - activeCharacter.characterConfig.movementSpent));
        },
        _setArmorText: function(activeCharacter) {
            this.armorText.setText('Armor: ' + activeCharacter.characterConfig.armor);
        },
        _setActionsText: function(activeCharacter) {
            this.actionsText.setText('Actions: ' + (activeCharacter.characterConfig.actions - activeCharacter.characterConfig.actionsSpent));
        },
        _setMinorActionsText: function(activeCharacter) {
            this.minorActionsText.setText('Minor Actions: ' + (activeCharacter.characterConfig.minorActions - activeCharacter.characterConfig.minorActionsSpent));
        },
        _endTurn: function() {
            this.events.emit('endTurn');
            this.turn++;
            this.turnText.setText(this.turn);
        }
    });

    this.game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: 'content',
        width: 1200,
        height: 800,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }
            }
        },
        scene: [
            BootScene,
            WorldScene,
            HUDScene
        ]
    });
};