import { SceneManager } from 'Aniwars/Managers/sceneManager';
import { MapConfig } from 'Aniwars/Configurations/mapConfig';
import { EnemyConfig } from 'Aniwars/Configurations/enemyConfig';

export const TestLevelScene2 = function () {
    return new Phaser.Class({
        Extends: Phaser.Scene,
        initialize: function TestLevelScene2() {
            Phaser.Scene.call(this, { key: 'TestLevelScene2' });
        },
        preload() { },
        create() {
            this.debugMode = true;
            this.sceneManager = new SceneManager(this);
            this.sceneManager.createMap(MapConfig.level1);
            this.sceneManager.createCharacter(600, 350, 'character1');
            this.sceneManager.createCharacter(600, 400, 'character2');
            this.sceneManager.createEnemy(750, 300, EnemyConfig.test);
            this.sceneManager.addHUDSceneEvents();
            this.cursors = this.input.keyboard.createCursorKeys();
            this.initiative = this.sceneManager.getInitiativeArray();
            this.activeCharacter = this.initiative[0];
            this.initiativeIndex = 0;
            this.sceneManager.createCamera();
            this.input.mouse.capture = true;
            this.sceneManager.createKeys();
            this.events.emit('showCharacterInitiative', this.initiative);
        },
        update() {
            this.sceneManager.checkManager();
        }
    });
};