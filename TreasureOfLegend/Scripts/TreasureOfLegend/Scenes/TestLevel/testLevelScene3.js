import { SceneManager } from 'TreasureOfLegend/Managers/sceneManager';
import { MapConfig } from 'TreasureOfLegend/Configurations/mapConfig';
import { EnemyConfig } from 'TreasureOfLegend/Configurations/enemyConfig';
import { InventoryConfig } from 'TreasureOfLegend/Configurations/inventoryConfig';

export const TestLevelScene3 = function () {
    return new Phaser.Class({
        Extends: Phaser.Scene,
        initialize: function TestLevelScene3() {
            Phaser.Scene.call(this, { key: 'TestLevelScene3' });
        },
        preload() {
            this.debugMode = true;
            this.sceneManager = new SceneManager(this);
            this.sceneManager.createMap(MapConfig.level1);
            this.sceneManager.createCharacter({ x: 3, y: 5 }, 'character1');
            this.sceneManager.createEnemy({ x: 5, y: 5 }, EnemyConfig.test, true);
            this.sceneManager.addHUDSceneEvents();
        },
        create() {
            var character = this.characters.characters.getChildren()[0];
            character.characterConfig.inventory.mainHand = lodash.cloneDeep(InventoryConfig.weapons.javelin);
            character.characterConfig.inventory.offHand = lodash.cloneDeep(InventoryConfig.weapons.handaxe);
            character.characterConfig.inventory.mainHand.isEquipped = true;
            character.characterConfig.inventory.offHand.isEquipped = true;
            character.characterConfig.inventory.slots.items.push(lodash.cloneDeep(InventoryConfig.head.cap));
            character.characterConfig.inventory.slots.items.push(lodash.cloneDeep(InventoryConfig.head.helm));

            character = this.enemies.characters.getChildren()[0];
            character.characterConfig.inventory.mainHand = lodash.cloneDeep(InventoryConfig.weapons.lightCrossbow);
            character.characterConfig.inventory.offHand = lodash.cloneDeep(InventoryConfig.weapons.dagger);
            character.characterConfig.inventory.mainHand.isEquipped = true;
            character.characterConfig.inventory.offHand.isEquipped = true;

            this.cursors = this.input.keyboard.createCursorKeys();
            this.initiative = this.sceneManager.getInitiativeArray();
            this.activeCharacter = this.initiative[0];
            this.initiativeIndex = 0;
            this.sceneManager.createCamera();
            this.input.mouse.capture = true;
            this.sceneManager.createKeys();
            this.events.emit('showCharacterInitiative', this.initiative);

            this.cameras.main.startFollow(this.activeCharacter, true, 0.09, 0.09);
            this.cameras.main.stopFollow();
        },
        update() {
            this.sceneManager.checkManager();
        }
    });
};