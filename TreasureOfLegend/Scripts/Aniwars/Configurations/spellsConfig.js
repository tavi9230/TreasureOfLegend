import {EnumHelper} from 'Aniwars/Helpers/enumHelper';

export const SpellsConfig = {
    firebolt: {
        damage: [
            {
                type: EnumHelper.damageTypeEnum.fire,
                value: 4
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.intelligence,
        image: 'firebolt',
        description: 'Fire for fools',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true
    }
};