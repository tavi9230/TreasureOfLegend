import {EnumHelper} from 'Aniwars/enumHelper';

export const InventoryConfig = {
    defaultMainHand: {
        type: EnumHelper.inventoryEnum.defaultEquipment,
        damage: 2,
        range: 1,
        attribute: EnumHelper.attributeEnum.strength,
        damageType: EnumHelper.damageTypeEnum.bludgeoning,
        hold: 1,
        image: 'punch',
        description: 'Default attack',
        slots: 0
    },
    defaultHead: {
        type: EnumHelper.inventoryEnum.defaultEquipment,
        image: 'punch',
        description: 'No head gear',
        slots: 0,
        armor: 0
    },
    defaultBody: {
        type: EnumHelper.inventoryEnum.defaultEquipment,
        image: 'punch',
        description: 'No body gear',
        slots: 0,
        armor: 0
    },
    defaultHands: {
        type: EnumHelper.inventoryEnum.defaultEquipment,
        image: 'punch',
        description: 'No hand gear',
        slots: 0,
        armor: 0
    },
    defaultFeet: {
        type: EnumHelper.inventoryEnum.defaultEquipment,
        image: 'punch',
        description: 'No feet gear',
        slots: 0,
        armor: 0
    },
    bow: {
        type: EnumHelper.inventoryEnum.mainHand,
        damage: 4,
        range: 6,
        attribute: EnumHelper.attributeEnum.dexterity,
        damageType: EnumHelper.damageTypeEnum.piercing,
        hold: 2,
        image: 'bow',
        description: 'Good bow',
        slots: 2
    },
    shortsword: {
        type: EnumHelper.inventoryEnum.mainHand,
        damage: 4,
        range: 1,
        attribute: EnumHelper.attributeEnum.strength,
        damageType: EnumHelper.damageTypeEnum.slashing,
        hold: 1,
        image: 'shortsword',
        description: 'Good ol\' shortsword',
        slots: 2
    },
    head: {
        type: EnumHelper.inventoryEnum.head,
        image: 'head',
        description: 'Head item',
        slots: 1,
        armor: 2
    },
    shield: {
        type: EnumHelper.inventoryEnum.offHand,
        image: 'shield',
        description: 'Shield item',
        slots: 1,
        armor: 2
    },
    chainmail: {
        type: EnumHelper.inventoryEnum.body,
        image: 'chainmail',
        description: 'Chainmail item',
        slots: 2,
        armor: 4
    },
    hand: {
        type: EnumHelper.inventoryEnum.hands,
        image: 'hand',
        description: 'Hand item',
        slots: 1,
        armor: 1
    },
    feet: {
        type: EnumHelper.inventoryEnum.feet,
        image: 'feet',
        description: 'Feet item',
        slots: 1,
        armor: 1
    }
};