import {EnumHelper} from 'Aniwars/enumHelper';

export const InventoryConfig = {
    punch: {
        type: EnumHelper.inventoryEnum.defaultEquipment,
        damage: 2,
        range: 1,
        attribute: EnumHelper.attributeEnum.strength,
        damageType: EnumHelper.damageTypeEnum.bludgeoning,
        hold: 1,
        image: 'punch',
        description: 'Powerful punch',
        slots: 0
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
    }
};