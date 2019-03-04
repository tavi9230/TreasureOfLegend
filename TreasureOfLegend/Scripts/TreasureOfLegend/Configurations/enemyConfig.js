﻿import { EnumHelper } from 'TreasureOfLegend/Helpers/enumHelper';
import { InventoryConfig } from 'TreasureOfLegend/Configurations/inventoryConfig';
import { SpellsConfig } from 'TreasureOfLegend/Configurations/spellsConfig';

var mainHandArray = [
    InventoryConfig.weapons.defaultEquipment,
    InventoryConfig.weapons.club,
    InventoryConfig.weapons.dagger,
    InventoryConfig.weapons.greatclub,
    InventoryConfig.weapons.handaxe,
    InventoryConfig.weapons.javelin,
    InventoryConfig.weapons.lightHammer,
    InventoryConfig.weapons.mace,
    InventoryConfig.weapons.quarterstaff,
    InventoryConfig.weapons.sickle,
    InventoryConfig.weapons.spear,
    InventoryConfig.weapons.lightCrossbow,
    InventoryConfig.weapons.balancedKnife,
    InventoryConfig.weapons.shortBow,
    InventoryConfig.weapons.battleaxe,
    InventoryConfig.weapons.flail,
    InventoryConfig.weapons.glaive,
    InventoryConfig.weapons.greataxe,
    InventoryConfig.weapons.greatsword,
    InventoryConfig.weapons.halberd,
    InventoryConfig.weapons.lance,
    InventoryConfig.weapons.longsword,
    InventoryConfig.weapons.maul,
    InventoryConfig.weapons.morningstar,
    InventoryConfig.weapons.pike,
    InventoryConfig.weapons.rapier,
    InventoryConfig.weapons.scimitar,
    InventoryConfig.weapons.shortSword,
    InventoryConfig.weapons.trident,
    InventoryConfig.weapons.warPick,
    InventoryConfig.weapons.warhammer,
    InventoryConfig.weapons.whip,
    InventoryConfig.weapons.handCrossbow,
    InventoryConfig.weapons.heavyCrossbow,
    InventoryConfig.weapons.longbow
];
var offHandArray = [
    InventoryConfig.weapons.defaultEquipment,
    InventoryConfig.shields.buckler,
    InventoryConfig.shields.largeShield,
    InventoryConfig.shields.kiteShield,
    InventoryConfig.shields.spikedShield,
    InventoryConfig.shields.towerShield
];
var headArray = [
    InventoryConfig.head.defaultEquipment,
    InventoryConfig.head.cap,
    InventoryConfig.head.helm,
    InventoryConfig.head.basinet,
    InventoryConfig.head.greatHelm,
    InventoryConfig.head.warCrown
];
var bodyArray = [
    InventoryConfig.body.defaultEquipment,
    InventoryConfig.body.leatherArmor,
    InventoryConfig.body.studdedArmor,
    InventoryConfig.body.chainMail,
    InventoryConfig.body.splintMail,
    InventoryConfig.body.plateMail
];
var handsArray = [
    InventoryConfig.hands.defaultEquipment,
    InventoryConfig.hands.leatherGloves,
    InventoryConfig.hands.heavyGloves,
    InventoryConfig.hands.chainGloves,
    InventoryConfig.hands.lightGauntlets,
    InventoryConfig.hands.gauntlets
];
var feetArray = [
    InventoryConfig.feet.defaultEquipment,
    InventoryConfig.feet.boots,
    InventoryConfig.feet.heavyBoots,
    InventoryConfig.feet.chainBoots,
    InventoryConfig.feet.platedBoots,
    InventoryConfig.feet.greaves
];
var utilityArray = [
    InventoryConfig.utility.arrows,
    InventoryConfig.utility.bolts
];
var _getItem = (array) => {
    // TODO https://www.npmjs.com/package/random
    var rand = Math.floor(Math.random() * array.length);
    rand = rand === 0 ? 0 : rand === array.length ? rand - 1 : rand;
    return lodash.cloneDeep(array[rand]);
};
var inventoryGetter = {
    getRandomResistances: function (number) {
        var array = [];
        while (number > 0) {
            array.push(Math.floor(Math.random() * 4) + 1);
            number--;
        }
        return _.uniq(array);
    },
    getMainHandItem: function () {
        return _getItem(mainHandArray);
    },
    getOffHandItem: function () {
        return _getItem(offHandArray);
    },
    getHeadItem: function () {
        return _getItem(headArray);
    },
    getBodyItem: function () {
        return _getItem(bodyArray);
    },
    getHandsItem: function () {
        return _getItem(handsArray);
    },
    getFeetItem: function () {
        return _getItem(feetArray);
    },
    getRandomInventoryItem: function () {
        var rand = 6;
        //Math.random() * 7;
        switch (Math.floor(rand)) {
            case 0:
                return _getItem(mainHandArray);
            case 1:
                return _getItem(offHandArray);
            case 2:
                return _getItem(headArray);
            case 3:
                return _getItem(bodyArray);
            case 4:
                return _getItem(handsArray);
            case 5:
                return _getItem(feetArray);
            case 6:
                return _getItem(utilityArray);
            default:
                return _getItem(utilityArray);
        }
    },
    getSpells: function (spellsToGet) {
        var spells = [];
        _.each(spellsToGet, function (spell) {
            var s = lodash.cloneDeep(spell);
            s.level++;
            spells.push(s);
        });
        return spells;
    }
};

export const EnemyConfig = {
    test: {
        name: 'Test',
        height: 50,
        width: 50,
        lineOfSight: 10,
        level: 1,
        life: '6d1',
        energy: 3,
        mana: '1d4',
        movement: 6,
        attributes: {
            strength: 0,
            dexterity: 0,
            intelligence: 0
        },
        image: 'enemy',
        experience: 500,
        souls: 200,
        traits: [EnumHelper.traitEnum.magic],
        resistances: [],
        vulnerabilities: [],
        invulnerabilities: [],
        getRandomInventoryItem: inventoryGetter.getRandomInventoryItem,
        getRandomResistances: inventoryGetter.getRandomResistances,
        inventory: {
            slots: {
                max: 2,
                items: []
            },
            getMoney: function () {
                var rand = Math.random() * 20;
                return Math.floor(rand);
            },
            spells: inventoryGetter.getSpells,
            spellsToGet: [SpellsConfig.firebolt],
            mainHand: inventoryGetter.getMainHandItem,
            offHand: inventoryGetter.getOffHandItem,
            head: inventoryGetter.getHeadItem,
            body: inventoryGetter.getBodyItem,
            hands: inventoryGetter.getHandsItem,
            feet: inventoryGetter.getFeetItem
        }
    },
    thug: {
        name: 'Thug',
        height: 50,
        width: 50,
        level: 1,
        life: '2d1',
        energy: 3,
        mana: '0d4',
        movement: 6,
        attributes: {
            strength: 2,
            dexterity: 2,
            intelligence: 0
        },
        image: 'enemy',
        experience: 50,
        souls: 2,
        traits: [EnumHelper.traitEnum.standard],
        resistances: [],
        vulnerabilities: [],
        invulnerabilities: [],
        getRandomInventoryItem: inventoryGetter.getRandomInventoryItem,
        getRandomResistances: inventoryGetter.getRandomResistances,
        inventory: {
            slots: {
                max: 2,
                items: []
            },
            getMoney: function () {
                var rand = Math.random() * 20;
                return Math.floor(rand);
            },
            spells: [],
            mainHand: inventoryGetter.getMainHandItem,
            offHand: inventoryGetter.getOffHandItem,
            head: inventoryGetter.getHeadItem,
            body: inventoryGetter.getBodyItem,
            hands: inventoryGetter.getHandsItem,
            feet: inventoryGetter.getFeetItem
        }
    }
};