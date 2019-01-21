import {EnumHelper} from 'Aniwars/enumHelper';

export const InventoryConfig = {
    punch: {
        damage: 2,
        range: 1,
        attribute: EnumHelper.attributeEnum.strength,
        damageType: EnumHelper.damageTypeEnum.bludgeoning,
        hold: 1
    },
    bow: {
        damage: 4,
        range: 6,
        attribute: EnumHelper.attributeEnum.dexterity,
        damageType: EnumHelper.damageTypeEnum.piercing,
        hold: 2
    },
    shortsword: {
        damage: 4,
        range: 1,
        attribute: EnumHelper.attributeEnum.strength,
        damageType: EnumHelper.damageTypeEnum.slashing,
        hold: 1
    },
    firebolt: {
        damage: 4,
        range: 6,
        attribute: EnumHelper.attributeEnum.intelligence,
        damageType: EnumHelper.damageTypeEnum.fire
    }
};