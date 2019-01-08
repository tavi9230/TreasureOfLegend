export const AssetLoader = function (game) {
    const AssetFolder = 'Assets/';
    this.game = game;

    this.loadImages = function() {
        game.load.image('sky', AssetFolder + 'sky.png');
        game.load.image('ground', AssetFolder + 'platform.png');
        game.load.image('star', AssetFolder + 'star.png');
        game.load.image('bomb', AssetFolder + 'bomb.png');
        game.load.spritesheet('dude', AssetFolder + 'dude.png', { frameWidth: 32, frameHeight: 48 });
    };
};