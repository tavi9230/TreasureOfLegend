﻿import {EnumHelper} from 'Aniwars/enumHelper';

export const SpellsConfig = {
    firebolt: {
        id: 1,
        damage: 4,
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.intelligence,
        damageType: EnumHelper.damageTypeEnum.fire,
        image: 'firebolt',
        description: 'Fire for fools'
    }
};