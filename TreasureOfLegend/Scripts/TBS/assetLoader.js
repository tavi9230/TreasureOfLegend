export const AssetLoader = function (game) {
    const AssetFolder = 'Assets/TBS/';
    this.game = game;

    this.loadImages = function() {
        game.load.image('tiles', AssetFolder + 'Tiles/t.jpg');
        game.load.tilemapTiledJSON('map', AssetFolder + 'Maps/map1.json');
        game.load.spritesheet('character', AssetFolder + 'Characters/characters1.jpg', { frameWidth: 19, frameHeight: 19 });
    };

    this.loadSounds = function() {
    };
};