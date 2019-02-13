import {EnumHelper} from 'Aniwars/Helpers/enumHelper';
import {InventoryConfig} from 'Aniwars/Configurations/inventoryConfig';

var mainHandArray = [InventoryConfig.defaultMainHand, InventoryConfig.shortsword, InventoryConfig.bow];
var offHandArray = [InventoryConfig.defaultMainHand, InventoryConfig.shield];
var headArray = [InventoryConfig.defaultHead, InventoryConfig.head];
var bodyArray = [InventoryConfig.defaultBody, InventoryConfig.chainmail];
var handsArray = [InventoryConfig.defaultHands, InventoryConfig.hand];
var feetArray = [InventoryConfig.defaultFeet, InventoryConfig.feet];
var _getItem = (array) =>
{
    var rand = Math.floor(Math.random() * array.length);
    rand = rand === 0 ? 0 : rand === array.length ? rand - 1 : rand;
    return lodash.cloneDeep(array[rand]);
};
var inventoryGetter = {
    getRandomResistances: function(number) {
        var array = [];
        while (number > 0) {
            array.push(Math.floor(Math.random() * 4) + 1);
            number--;
        }
        return _.uniq(array);
    },
    getMainHandItem: function() {
        return _getItem(mainHandArray);
    },
    getOffHandItem: function() {
        return _getItem(offHandArray);
    },
    getHeadItem: function() {
        return _getItem(headArray);
    },
    getBodyItem: function() {
        return _getItem(bodyArray);
    },
    getHandsItem: function() {
        return _getItem(handsArray);
    },
    getFeetItem: function() {
        return _getItem(feetArray);
    },
    getRandomInventoryItem: function() {
        var rand = Math.random() * 6;
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
            default:
                return _getItem(mainHandArray);
        }
    }
};

export const EnemyConfig = {
    test: {
        name: 'Test',
        height: 50,
        width: 50,
        level: 1,
        naturalArmor: 0,
        life: '1d1',
        energy: 3,
        mana: '0d4',
        movement: 6,
        attributes: {
            strength: 0,
            dexterity: 0,
            intelligence: 0
        },
        image: 'character',
        experience: 500,
        souls: 200,
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
    },
    thug: {
        name: 'Thug',
        height: 50,
        width: 50,
        level: 1,
        naturalArmor: 2,
        life: '2d1',
        energy: 3,
        mana: '0d4',
        movement: 6,
        attributes: {
            strength: 2,
            dexterity: 2,
            intelligence: 0
        },
        image: 'character',
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
            getMoney: function() {
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