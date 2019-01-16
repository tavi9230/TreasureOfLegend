﻿export const AssetLoader = function (game) {
    const AssetFolder = 'Assets/Aniwars/';
    this.game = game;

    this.loadImages = function() {
        game.load.image('tile1', AssetFolder + 'tile1.png');
        game.load.image('tile2', AssetFolder + 'tile2.png');
        game.load.image('tile3', AssetFolder + 'tile3.png');
        game.load.image('tile4', AssetFolder + 'tile4.png');
        game.load.image('tile5', AssetFolder + 'tile5.png');
        game.load.image('wallTile', AssetFolder + 'wallTile.jpg');
        game.load.image('doorTile', AssetFolder + 'doorTile.png');
        game.load.image('character', AssetFolder + 'character.jpg');
    };

    this.loadSounds = function() {
    };
};