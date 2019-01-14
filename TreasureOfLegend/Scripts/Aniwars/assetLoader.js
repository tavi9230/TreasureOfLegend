export const AssetLoader = function (game) {
    const AssetFolder = 'Assets/Aniwars/';
    this.game = game;

    this.loadImages = function() {
        game.load.image('tile', AssetFolder + 'tile.png');
        game.load.image('character', AssetFolder + 'character.jpg');
    };

    this.loadSounds = function() {
    };
};