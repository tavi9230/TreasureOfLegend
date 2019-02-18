import {EnumHelper} from 'Aniwars/Helpers/enumHelper';

export const InventoryConfig = {
    defaultMainHand: {
        type: EnumHelper.inventoryEnum.defaultEquipment,
        damage: [
            {
                type: EnumHelper.damageTypeEnum.bludgeoning,
                value: 2
            }
        ],
        range: 1,
        attribute: EnumHelper.attributeEnum.strength,
        hold: 1,
        image: 'punch',
        description: 'Default attack',
        slots: 0,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        durability: {
            max: 0,
            spent: 0
        }
    },
    defaultHead: {
        type: EnumHelper.inventoryEnum.defaultEquipment,
        image: 'punch',
        description: 'No head gear',
        slots: 0,
        armor: 0,
        maxArmor: 0,
        durability: {
            max: 0,
            spent: 0
        }
    },
    defaultBody: {
        type: EnumHelper.inventoryEnum.defaultEquipment,
        image: 'punch',
        description: 'No body gear',
        slots: 0,
        armor: 0,
        maxArmor: 0,
        durability: {
            max: 0,
            spent: 0
        }
    },
    defaultHands: {
        type: EnumHelper.inventoryEnum.defaultEquipment,
        image: 'punch',
        description: 'No hand gear',
        slots: 0,
        armor: 0,
        maxArmor: 0,
        durability: {
            max: 0,
            spent: 0
        }
    },
    defaultFeet: {
        type: EnumHelper.inventoryEnum.defaultEquipment,
        image: 'punch',
        description: 'No feet gear',
        slots: 0,
        armor: 0,
        maxArmor: 0,
        durability: {
            max: 0,
            spent: 0
        }
    },
    bow: {
        name: 'Crude bow',
        type: EnumHelper.inventoryEnum.mainHand,
        damage: [
            {
                type: EnumHelper.damageTypeEnum.piercing,
                value: 4
            }
        ],
        range: 6,
        attribute: EnumHelper.attributeEnum.dexterity,
        hold: 2,
        image: 'bow',
        description: 'Good bow',
        slots: 1,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        durability: {
            max: 0,
            spent: 0
        }
    },
    shortsword: {
        name: 'Shortsword',
        type: EnumHelper.inventoryEnum.mainHand,
        damage: [
            {
                type: EnumHelper.damageTypeEnum.slashing,
                value: 4
            }
        ],
        range: 1,
        attribute: EnumHelper.attributeEnum.strength,
        hold: 1,
        image: 'shortsword',
        description: 'Good ol\' shortsword',
        slots: 1,
        sound: {
            hittingArmor: 'sword_clang',
            hittingFlesh: 'sword_flesh'
        },
        durability: {
            max: 0,
            spent: 0
        }
    },
    head: {
        name: 'Helmet',
        type: EnumHelper.inventoryEnum.head,
        image: 'head',
        description: 'Head item',
        slots: 1,
        armor: 2,
        maxArmor: 2,
        durability: {
            max: 0,
            spent: 0
        }
    },
    shield: {
        name: 'Shield',
        type: EnumHelper.inventoryEnum.offHand,
        image: 'shield',
        description: 'Shield item',
        slots: 1,
        armor: 2,
        maxArmor: 2,
        durability: {
            max: 0,
            spent: 0
        }
    },
    chainmail: {
        name: 'Chainmail',
        type: EnumHelper.inventoryEnum.body,
        image: 'chainmail',
        description: 'Chainmail item',
        slots: 1,
        armor: 4,
        maxArmor: 4,
        durability: {
            max: 0,
            spent: 0
        }
    },
    hand: {
        name: 'Gloves',
        type: EnumHelper.inventoryEnum.hands,
        image: 'hand',
        description: 'Hand item',
        slots: 1,
        armor: 1,
        maxArmor: 1,
        durability: {
            max: 0,
            spent: 0
        }
    },
    feet: {
        name: 'Boots',
        type: EnumHelper.inventoryEnum.feet,
        image: 'feet',
        description: 'Feet item',
        slots: 1,
        armor: 1,
        maxArmor: 1,
        durability: {
            max: 0,
            spent: 0
        }
    }
};