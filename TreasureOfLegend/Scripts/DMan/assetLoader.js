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

    this.loadSounds = function() {
        game.load.audio('background', [AssetFolder + 'Audio/background.mp3']);
        game.load.audio('coin', [AssetFolder + 'Audio/coin.mp3']);
        game.load.audio('death', [AssetFolder + 'Audio/death.mp3']);
    };
};