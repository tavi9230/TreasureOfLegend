import {EnumHelper} from 'Aniwars/Helpers/enumHelper';

export const SpellsConfig = {
    firebolt: {
        name: 'Firebolt',
        damage: [
            {
                type: EnumHelper.damageTypeEnum.fire,
                value: '1d6',
                initialValue: '1d6'
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.dexterity,
        image: 'firebolt',
        description: 'Fire for fools',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        area: {
            shape: EnumHelper.areaEnum.point,
            targets: 1
        }
    },
    frostbolt: {
        name: 'Frost bolt',
        damage: [
            {
                type: EnumHelper.damageTypeEnum.cold,
                value: '1d6',
                initialValue: '1d6'
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.dexterity,
        image: 'firebolt',
        description: 'Cold damage',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        area: {
            shape: EnumHelper.areaEnum.point,
            targets: 1
        }
    },
    poisonbolt: {
        name: 'Poison bolt',
        damage: [
            {
                type: EnumHelper.damageTypeEnum.poison,
                value: '1d6',
                initialValue: '1d6'
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.dexterity,
        image: 'firebolt',
        description: 'Poison damage',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        area: {
            shape: EnumHelper.areaEnum.point,
            targets: 1
        }
    },
    acidbolt: {
        name: 'Acid bolt',
        damage: [
            {
                type: EnumHelper.damageTypeEnum.acid,
                value: '1d6',
                initialValue: '1d6'
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.dexterity,
        image: 'firebolt',
        description: 'Acid damage',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        area: {
            shape: EnumHelper.areaEnum.point,
            targets: 1
        }
    },
    lightningbolt: {
        name: 'Lightning bolt',
        damage: [
            {
                type: EnumHelper.damageTypeEnum.lightning,
                value: '1d6',
                initialValue: '1d6'
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.dexterity,
        image: 'firebolt',
        description: 'Lightning damage',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        area: {
            shape: EnumHelper.areaEnum.point,
            targets: 1
        }
    },
    necroticbolt: {
        name: 'Necrotic bolt',
        damage: [
            {
                type: EnumHelper.damageTypeEnum.necrotic,
                value: '1d6',
                initialValue: '1d6'
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.dexterity,
        image: 'firebolt',
        description: 'Necrotic damage',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        area: {
            shape: EnumHelper.areaEnum.point,
            targets: 1
        }
    },
    radiantbolt: {
        name: 'Radiant bolt',
        damage: [
            {
                type: EnumHelper.damageTypeEnum.radiant,
                value: '1d6',
                initialValue: '1d6'
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.dexterity,
        image: 'firebolt',
        description: 'Radiant damage',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        area: {
            shape: EnumHelper.areaEnum.point,
            targets: 1
        }
    },
    thunderbolt: {
        name: 'Thunder bolt',
        damage: [
            {
                type: EnumHelper.damageTypeEnum.thunder,
                value: '1d6',
                initialValue: '1d6'
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.dexterity,
        image: 'firebolt',
        description: 'Thunder damage',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        area: {
            shape: EnumHelper.areaEnum.point,
            targets: 1
        }
    },
    psychicbolt: {
        name: 'Psychic bolt',
        damage: [
            {
                type: EnumHelper.damageTypeEnum.psychic,
                value: '1d6',
                initialValue: '1d6'
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.dexterity,
        image: 'firebolt',
        description: 'Psychic damage',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        area: {
            shape: EnumHelper.areaEnum.point,
            targets: 1
        }
    },
    forcebolt: {
        name: 'Force bolt',
        damage: [
            {
                type: EnumHelper.damageTypeEnum.force,
                value: '1d6',
                initialValue: '1d6'
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.dexterity,
        image: 'firebolt',
        description: 'Force damage',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        area: {
            shape: EnumHelper.areaEnum.point,
            targets: 1
        }
    },
    fireline: {
        name: 'Fireline',
        damage: [
            {
                type: EnumHelper.damageTypeEnum.fire,
                value: '1d6',
                initialValue: '1d6'
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.dexterity,
        image: 'firebolt',
        imageLeftover: 'fire',
        description: 'Fireline',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        area: {
            shape: EnumHelper.areaEnum.line,
            targets: -1,
            length: 6,
            startPoint: 0
        }
    },
    firecube: {
        name: 'Firecube',
        damage: [
            {
                type: EnumHelper.damageTypeEnum.fire,
                value: '1d6',
                initialValue: '1d6'
            }
        ],
        range: 6,
        cost: 2,
        attribute: EnumHelper.attributeEnum.dexterity,
        image: 'firebolt',
        imageLeftover: 'fire',
        description: 'Firecube',
        level: 0,
        maxLevel: 1,
        isPassive: false,
        isSpell: true,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        area: {
            shape: EnumHelper.areaEnum.cube,
            targets: -1,
            length: 2,
            startPoint: 1
        }
    }
};