export const AssetLoader = function (scene) {
    const AssetFolder = 'Assets/TreasureOfLegend/';
    //const KenneyNLPack = 'KenneyNL/Isometric/';
    var game = scene;

    this.loadImages = function () {
        // tiles --------------------------------------------------------------------
        //game.load.image('stoneTile1', AssetFolder + KenneyNLPack + 'stone_N - Copy.png');
        //game.load.image('stoneTile2', AssetFolder + KenneyNLPack + 'stoneMissingTiles_N - Copy.png');
        game.load.image('stoneTile1', AssetFolder + 'testassets/floor.png');
        game.load.image('stoneTile2', AssetFolder + 'testassets/floor.png');

        game.load.image('stoneWallE', AssetFolder + 'testassets/isometric_0100.png');
        game.load.image('stoneWallN', AssetFolder + 'testassets/isometric_0100.png');
        game.load.image('stoneWallS', AssetFolder + 'testassets/isometric_0100.png');
        game.load.image('stoneWallW', AssetFolder + 'testassets/isometric_0100.png');
        game.load.image('stoneWallCornerE', AssetFolder + 'testassets/isometric_0100.png');
        game.load.image('stoneWallCornerN', AssetFolder + 'testassets/isometric_0100.png');
        game.load.image('stoneWallCornerS', AssetFolder + 'testassets/isometric_0100.png');
        game.load.image('stoneWallCornerW', AssetFolder + 'testassets/isometric_0100.png');

        //game.load.image('stoneWallE', AssetFolder + KenneyNLPack + 'stoneWall_E - Copy.png');
        //game.load.image('stoneWallN', AssetFolder + KenneyNLPack + 'stoneWall_N - Copy.png');
        //game.load.image('stoneWallS', AssetFolder + KenneyNLPack + 'stoneWall_S - Copy.png');
        //game.load.image('stoneWallW', AssetFolder + KenneyNLPack + 'stoneWall_W - Copy.png');

        //game.load.image('stoneWallCornerE', AssetFolder + KenneyNLPack + 'stoneWallCorner_E - Copy.png');
        //game.load.image('stoneWallCornerN', AssetFolder + KenneyNLPack + 'stoneWallCorner_N - Copy.png');
        //game.load.image('stoneWallCornerS', AssetFolder + KenneyNLPack + 'stoneWallCorner_S - Copy.png');
        //game.load.image('stoneWallCornerW', AssetFolder + KenneyNLPack + 'stoneWallCorner_W - Copy.png');

        //game.load.image('stoneWallDoorClosedE', AssetFolder + KenneyNLPack + 'stoneWallDoorClosed_E.png');
        //game.load.image('stoneWallDoorClosedN', AssetFolder + KenneyNLPack + 'stoneWallDoorClosed_N.png');
        //game.load.image('stoneWallDoorClosedS', AssetFolder + KenneyNLPack + 'stoneWallDoorClosed_S.png');
        //game.load.image('stoneWallDoorClosedW', AssetFolder + KenneyNLPack + 'stoneWallDoorClosed_W.png');
        //game.load.image('stoneWallDoorOpenE', AssetFolder + KenneyNLPack + 'stoneWallDoorOpen_E.png');
        //game.load.image('stoneWallDoorOpenN', AssetFolder + KenneyNLPack + 'stoneWallDoorOpen_N.png');
        //game.load.image('stoneWallDoorOpenS', AssetFolder + KenneyNLPack + 'stoneWallDoorOpen_S.png');
        //game.load.image('stoneWallDoorOpenW', AssetFolder + KenneyNLPack + 'stoneWallDoorOpen_W.png');
        game.load.image('stoneWallDoorClosedE', AssetFolder + 'testassets/doorClosedE.png');
        game.load.image('stoneWallDoorClosedN', AssetFolder + 'testassets/doorClosedN.png');
        game.load.image('stoneWallDoorClosedS', AssetFolder + 'testassets/doorClosedN.png');
        game.load.image('stoneWallDoorClosedW', AssetFolder + 'testassets/doorClosedE.png');
        game.load.image('stoneWallDoorOpenE', AssetFolder + 'testassets/doorOpenE.png');
        game.load.image('stoneWallDoorOpenN', AssetFolder + 'testassets/doorOpenN.png');
        game.load.image('stoneWallDoorOpenS', AssetFolder + 'testassets/doorOpenN.png');
        game.load.image('stoneWallDoorOpenW', AssetFolder + 'testassets/doorOpenE.png');

        game.load.image('characterFrame', AssetFolder + 'frame.png');
        game.load.image('character1', AssetFolder + 'KenneyNL/Characters/Male/Male_3_Idle0 - Copy.png');

        // rechargeable objects --------------------------------------------------------------------
        game.load.image('movementWell', AssetFolder + 'objects/movementWell.png');
        game.load.image('healthWell', AssetFolder + 'objects/healthWell.png');
        game.load.image('manaWell', AssetFolder + 'objects/manaWell.png');
        game.load.image('energyWell', AssetFolder + 'objects/energyWell.png');
        game.load.image('emptyWell', AssetFolder + 'objects/emptyWell.png');

        // inventory --------------------------------------------------------------------
        // weapons
        game.load.image('balancedKnife', AssetFolder + 'items/weapons/balancedKnife.gif');
        game.load.image('battleaxe', AssetFolder + 'items/weapons/battleaxe.gif');
        game.load.image('club', AssetFolder + 'items/weapons/club.gif');
        game.load.image('dagger', AssetFolder + 'items/weapons/dagger.gif');
        game.load.image('flail', AssetFolder + 'items/weapons/flail.gif');
        game.load.image('glaive', AssetFolder + 'items/weapons/glaive.gif');
        game.load.image('greataxe', AssetFolder + 'items/weapons/greataxe.gif');
        game.load.image('greatclub', AssetFolder + 'items/weapons/greatclub.gif');
        game.load.image('greatsword', AssetFolder + 'items/weapons/greatsword.gif');
        game.load.image('halberd', AssetFolder + 'items/weapons/halberd.gif');
        game.load.image('handaxe', AssetFolder + 'items/weapons/handaxe.gif');
        game.load.image('handCrossbow', AssetFolder + 'items/weapons/handCrossbow.gif');
        game.load.image('heavyCrossbow', AssetFolder + 'items/weapons/heavyCrossbow.gif');
        game.load.image('javelin', AssetFolder + 'items/weapons/javelin.gif');
        game.load.image('lance', AssetFolder + 'items/weapons/lance.gif');
        game.load.image('lightCrossbow', AssetFolder + 'items/weapons/lightCrossbow.gif');
        game.load.image('lightHammer', AssetFolder + 'items/weapons/lightHammer.gif');
        game.load.image('longbow', AssetFolder + 'items/weapons/longbow.gif');
        game.load.image('longsword', AssetFolder + 'items/weapons/longsword.gif');
        game.load.image('mace', AssetFolder + 'items/weapons/mace.gif');
        game.load.image('maul', AssetFolder + 'items/weapons/maul.gif');
        game.load.image('morningstar', AssetFolder + 'items/weapons/morningstar.gif');
        game.load.image('pike', AssetFolder + 'items/weapons/pike.gif');
        game.load.image('quarterstaff', AssetFolder + 'items/weapons/quarterstaff.gif');
        game.load.image('rapier', AssetFolder + 'items/weapons/rapier.gif');
        game.load.image('scimitar', AssetFolder + 'items/weapons/scimitar.gif');
        game.load.image('shortBow', AssetFolder + 'items/weapons/shortBow.gif');
        game.load.image('shortSword', AssetFolder + 'items/weapons/shortSword.gif');
        game.load.image('sickle', AssetFolder + 'items/weapons/sickle.gif');
        game.load.image('spear', AssetFolder + 'items/weapons/spear.gif');
        game.load.image('trident', AssetFolder + 'items/weapons/trident.gif');
        game.load.image('warhammer', AssetFolder + 'items/weapons/warhammer.gif');
        game.load.image('warPick', AssetFolder + 'items/weapons/warPick.gif');
        game.load.image('whip', AssetFolder + 'items/weapons/whip.gif');

        game.load.image('arrows', AssetFolder + 'items/weapons/arrows.gif');
        game.load.image('bolts', AssetFolder + 'items/weapons/bolts.gif');
        game.load.image('arrow', AssetFolder + 'items/weapons/arrow.png');

        // spells
        game.load.image('firebolt', AssetFolder + 'items/spells/firebolt.png');
        game.load.image('fire', AssetFolder + 'items/spells/fire.png');

        // head
        game.load.image('cap', AssetFolder + 'items/head/cap.gif');
        game.load.image('helm', AssetFolder + 'items/head/helm.gif');
        game.load.image('basinet', AssetFolder + 'items/head/basinet.gif');
        game.load.image('greatHelm', AssetFolder + 'items/head/greatHelm.gif');
        game.load.image('warCrown', AssetFolder + 'items/head/warCrown.gif');

        // shields
        game.load.image('buckler', AssetFolder + 'items/shields/buckler.gif');
        game.load.image('largeShield', AssetFolder + 'items/shields/largeShield.gif');
        game.load.image('kiteShield', AssetFolder + 'items/shields/kiteShield.gif');
        game.load.image('spikedShield', AssetFolder + 'items/shields/spikedShield.gif');
        game.load.image('towerShield', AssetFolder + 'items/shields/towerShield.gif');

        // body
        game.load.image('leatherArmor', AssetFolder + 'items/body/leatherArmor.gif');
        game.load.image('studdedArmor', AssetFolder + 'items/body/studdedArmor.gif');
        game.load.image('chainMail', AssetFolder + 'items/body/chainMail.gif');
        game.load.image('splintMail', AssetFolder + 'items/body/splintMail.gif');
        game.load.image('plateMail', AssetFolder + 'items/body/plateMail.gif');

        // hands
        game.load.image('leatherGloves', AssetFolder + 'items/hands/leatherGloves.gif');
        game.load.image('heavyGloves', AssetFolder + 'items/hands/heavyGloves.gif');
        game.load.image('chainGloves', AssetFolder + 'items/hands/chainGloves.gif');
        game.load.image('lightGauntlets', AssetFolder + 'items/hands/lightGauntlets.gif');
        game.load.image('gauntlets', AssetFolder + 'items/hands/gauntlets.gif');

        // boots
        game.load.image('boots', AssetFolder + 'items/feet/boots.gif');
        game.load.image('heavyBoots', AssetFolder + 'items/feet/heavyBoots.gif');
        game.load.image('chainBoots', AssetFolder + 'items/feet/chainBoots.gif');
        game.load.image('platedBoots', AssetFolder + 'items/feet/platedBoots.gif');
        game.load.image('greaves', AssetFolder + 'items/feet/greaves.gif');

        // items
        game.load.image('lootbag', AssetFolder + 'items/lootbag.png');
        game.load.image('punch', AssetFolder + 'items/punch.png');

        // icons --------------------------------------------------------------------
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

        game.load.image('inventoryBox', AssetFolder + 'inventoryBox.png');
        game.load.image('inventoryBoxSelected', AssetFolder + 'inventoryBoxSelected.png');
    };

    this.loadMainMenuImages = function() {
        game.load.image('mainMenuButton', AssetFolder + 'mainMenuButton.png');
    };

    this.loadSounds = function () {
        game.load.audio('sword_clang', [AssetFolder + 'audio/sword_clang.wav']);
        game.load.audio('sword_flesh', [AssetFolder + 'audio/sword_flesh.wav']);
        game.load.audio('walk_stone', [AssetFolder + 'audio/walk_stone.mp3']);
        game.load.audio('background_combat_1', [AssetFolder + 'audio/background_combat_1.mp3']);
        game.load.audio('open_door', [AssetFolder + 'audio/open_door.wav']);
        game.load.audio('drink_well', [AssetFolder + 'audio/drink_well.mp3']);
        game.load.audio('pickup', [AssetFolder + 'audio/pickup.wav']);
        game.load.audio('drop_item', [AssetFolder + 'audio/drop_item.wav']);
        game.load.audio('lootbag_open', [AssetFolder + 'audio/lootbag_open.wav']);
    };
};