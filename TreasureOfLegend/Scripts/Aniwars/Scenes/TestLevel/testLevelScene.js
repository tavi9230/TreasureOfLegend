import { SceneManager } from 'Aniwars/Managers/sceneManager';
import { MapConfig } from 'Aniwars/Configurations/mapConfig';
import { EnemyConfig } from 'Aniwars/Configurations/enemyConfig';

export const TestLevelScene = function () {
    return new Phaser.Class({
        Extends: Phaser.Scene,
        initialize: function TestLevelScene() {
            Phaser.Scene.call(this, { key: 'TestLevelScene' });
        },
        preload() { },
        create() {
            this.backgroundMusic = this.sound.add('background_combat_1', { volume: 0.1 });
			// TODO: Loop does not work?
            this.backgroundMusic.setLoop(true);
            this.debugMode = true;
            this.sceneManager = new SceneManager(this);
            this.sceneManager.createMap(MapConfig.level0);
            this.sceneManager.createItems();
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
            //this.backgroundMusic.play();
        },
        update() {
            this.sceneManager.checkManager();
        }
    });
};