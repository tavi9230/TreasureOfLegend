export const AssetLoader = function (game) {
    const AssetFolder = 'Assets/Aniwars/';
    this.game = game;

    this.loadImages = function() {
        game.load.image('tile1', AssetFolder + 'tile1.png');
        game.load.image('tile2', AssetFolder + 'tile2.png');
        game.load.image('tile3', AssetFolder + 'tile3.png');
        game.load.image('tile4', AssetFolder + 'tile4.png');
        game.load.image('tile5', AssetFolder + 'tile5.png');
        game.load.image('wallTile', AssetFolder + 'wallTile.png');
        game.load.image('doorUp', AssetFolder + 'doorUp.png');
        game.load.image('doorDown', AssetFolder + 'doorDown.png');
        game.load.image('doorLeft', AssetFolder + 'doorLeft.png');
        game.load.image('doorRight', AssetFolder + 'doorRight.png');
        game.load.image('character', AssetFolder + 'character.png');

        game.load.image('arrow', AssetFolder + 'items/arrow.png');
        game.load.image('punch', AssetFolder + 'items/punch.png');
        game.load.image('shortsword', AssetFolder + 'items/shortsword.png');
        game.load.image('firebolt', AssetFolder + 'items/firebolt.png');
        game.load.image('bow', AssetFolder + 'items/bow.png');
    };

    this.loadHUDImages = function() {
        game.load.image('hudbackground', AssetFolder + 'hudbackground.png');
        game.load.image('hourglass', AssetFolder + 'hourglass.png');
        game.load.image('openMenuButton', AssetFolder + 'openMenuButton.png');
        game.load.image('spells', AssetFolder + 'spells.png');
    };

    this.loadMainMenuImages = function() {
        game.load.image('mainMenuButton', AssetFolder + 'mainMenuButton.png');
    };

    this.loadSounds = function() {
    };
};