export const AssetLoader = function (game) {
    const AssetFolder = 'Assets/Aniwars/';
    this.game = game;

    this.loadImages = function() {
        game.load.image('tile1', AssetFolder + 'tile1.png');
        game.load.image('tile2', AssetFolder + 'tile2.png');
        game.load.image('tile3', AssetFolder + 'tile3.png');
        game.load.image('tile4', AssetFolder + 'tile4.png');
        game.load.image('tile5', AssetFolder + 'tile5.png');
        game.load.image('doorLeft', AssetFolder + 'doorLeft.png');
        game.load.image('doorRight', AssetFolder + 'doorRight.png');
        game.load.image('character', AssetFolder + 'character.png');

        game.load.image('castleDoor', AssetFolder + 'castledoors.png');
        game.load.image('castleDoorVertical', AssetFolder + 'castledoorsVertical.png');

        game.load.image('characterFrame', AssetFolder + 'frame.png');
        game.load.image('character1', AssetFolder + 'char01_0000.png');
        game.load.image('character2', AssetFolder + 'char02_0000.png');
        game.load.image('character3', AssetFolder + 'char03_0000.png');
        game.load.image('character4', AssetFolder + 'char04_0000.png');

        game.load.image('wallTest', AssetFolder + 'walls/wallTest.png');
        game.load.image('wallVerticalTest', AssetFolder + 'walls/wallVerticalTest.png');
        game.load.image('wallTopLeftTest', AssetFolder + 'walls/wallTopLeft.png');
        game.load.image('wallTopRightTest', AssetFolder + 'walls/wallTopRight.png');
        game.load.image('wallBottomRightTest', AssetFolder + 'walls/wallBottomRightTest.png');
        game.load.image('wallBottomLeftTest', AssetFolder + 'walls/wallBottomLeftTest.png');

        game.load.image('movementWell', AssetFolder + 'objects/movementWell.png');
        game.load.image('healthWell', AssetFolder + 'objects/healthWell.png');
        game.load.image('manaWell', AssetFolder + 'objects/manaWell.png');
        game.load.image('energyWell', AssetFolder + 'objects/energyWell.png');
        game.load.image('emptyWell', AssetFolder + 'objects/emptyWell.png');

        game.load.image('arrow', AssetFolder + 'items/arrow.png');
        game.load.image('punch', AssetFolder + 'items/punch.png');
        game.load.image('shortsword', AssetFolder + 'items/shortsword.png');
        game.load.image('firebolt', AssetFolder + 'items/firebolt.png');
        game.load.image('bow', AssetFolder + 'items/bow.png');
        game.load.image('head', AssetFolder + 'items/head.jpg');
        game.load.image('shield', AssetFolder + 'items/shield.jpg');
        game.load.image('chainmail', AssetFolder + 'items/chainmail.jpg');
        game.load.image('hand', AssetFolder + 'items/hand.jpg');
        game.load.image('feet', AssetFolder + 'items/feet.jpg');
        game.load.image('lootbag', AssetFolder + 'items/lootbag.png');

        game.load.image('healthIcon', AssetFolder + 'characters/health.png');
        game.load.image('manaIcon', AssetFolder + 'characters/mana.png');
        game.load.image('movementIcon', AssetFolder + 'characters/movement.png');
        game.load.image('energyIcon', AssetFolder + 'characters/energy.png');
        game.load.image('armorIcon', AssetFolder + 'characters/armor.png');
    };

    this.loadHUDImages = function() {
        game.load.image('endTurnButton', AssetFolder + 'buttons/endTurnButton.png');
        game.load.image('openMenuButton', AssetFolder + 'buttons/openMenuButton.png');
        game.load.image('spellsButton', AssetFolder + 'buttons/spellsButton.png');
        game.load.image('spellsButtonActivated', AssetFolder + 'buttons/spellsButtonActivated.png');
        game.load.image('soulsButton', AssetFolder + 'buttons/soulsButton.png');
        game.load.image('walkButton', AssetFolder + 'buttons/walkButton.png');
        game.load.image('walkButtonActivated', AssetFolder + 'buttons/walkButtonActivated.png');
        game.load.image('mainHandButton', AssetFolder + 'buttons/mainHandButton.png');
        game.load.image('mainHandButtonActivated', AssetFolder + 'buttons/mainHandButtonActivated.png');
        game.load.image('offHandButton', AssetFolder + 'buttons/offHandButton.png');
        game.load.image('offHandButtonActivated', AssetFolder + 'buttons/offHandButtonActivated.png');
        game.load.image('inventoryButton', AssetFolder + 'buttons/inventoryButton.png');
        game.load.image('inventoryButtonActivated', AssetFolder + 'buttons/inventoryButtonActivated.png');
        game.load.image('inspectButton', AssetFolder + 'buttons/inspectButton.png');
        game.load.image('inspectButtonActivated', AssetFolder + 'buttons/inspectButtonActivated.png');
        game.load.image('plusButton', AssetFolder + 'buttons/plusButton.png');
        game.load.image('upgradeButton', AssetFolder + 'buttons/upgradeButton.png');
        game.load.image('closeButton', AssetFolder + 'buttons/closeButton.png');
        game.load.image('replaceButton', AssetFolder + 'buttons/replaceButton.png');
    };

    this.loadMainMenuImages = function() {
        game.load.image('mainMenuButton', AssetFolder + 'mainMenuButton.png');
    };

    this.loadSounds = function() {
    };
};