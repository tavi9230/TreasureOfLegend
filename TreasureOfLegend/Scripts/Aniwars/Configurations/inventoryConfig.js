import { EnumHelper } from 'Aniwars/Helpers/enumHelper';

export const InventoryConfig = {
    head: {
        defaultEquipment: {
            type: EnumHelper.inventoryEnum.defaultEquipment,
            image: 'punch',
            description: 'No head gear',
            slots: 0,
            armor: 0,
            durability: {
                max: 0,
                current: 0
            }
        },
        cap: {
            name: 'Cap',
            type: EnumHelper.inventoryEnum.head,
            image: 'cap',
            description: 'Leather cap',
            slots: 1,
            armor: 1,
            durability: {
                max: 5,
                current: 5
            }
        },
        helm: {
            name: 'Helm',
            type: EnumHelper.inventoryEnum.head,
            image: 'helm',
            description: 'Metal Helm',
            slots: 1,
            armor: 2,
            durability: {
                max: 10,
                current: 10
            }
        },
        basinet: {
            name: 'Basinet',
            type: EnumHelper.inventoryEnum.head,
            image: 'basinet',
            description: 'Metal Helm',
            slots: 1,
            armor: 3,
            durability: {
                max: 15,
                current: 15
            }
        },
        greatHelm: {
            name: 'Great Helm',
            type: EnumHelper.inventoryEnum.head,
            image: 'greatHelm',
            description: 'Great Helm',
            slots: 1,
            armor: 4,
            durability: {
                max: 20,
                current: 20
            }
        },
        warCrown: {
            name: 'War Crown',
            type: EnumHelper.inventoryEnum.head,
            image: 'warCrown',
            description: 'Protective crown',
            slots: 1,
            armor: 5,
            durability: {
                max: 25,
                current: 25
            }
        }
    },
    body: {
        defaultEquipment: {
            type: EnumHelper.inventoryEnum.defaultEquipment,
            image: 'punch',
            description: 'No body gear',
            slots: 0,
            armor: 0,
            durability: {
                max: 0,
                current: 0
            }
        },
        leatherArmor: {
            name: 'Leather armor',
            type: EnumHelper.inventoryEnum.body,
            image: 'leatherArmor',
            description: 'Leather armor',
            slots: 1,
            armor: 1,
            durability: {
                max: 5,
                current: 5
            }
        },
        studdedArmor: {
            name: 'Studded armor',
            type: EnumHelper.inventoryEnum.body,
            image: 'studdedArmor',
            description: 'Studded armor',
            slots: 1,
            armor: 2,
            durability: {
                max: 10,
                current: 10
            }
        },
        chainMail: {
            name: 'Chain Mail',
            type: EnumHelper.inventoryEnum.body,
            image: 'chainMail',
            description: 'Chain Mail',
            slots: 1,
            armor: 3,
            durability: {
                max: 15,
                current: 15
            }
        },
        splintMail: {
            name: 'Splint Mail',
            type: EnumHelper.inventoryEnum.body,
            image: 'splintMail',
            description: 'Splint Mail',
            slots: 1,
            armor: 4,
            durability: {
                max: 20,
                current: 20
            }
        },
        plateMail: {
            name: 'Plate Mail',
            type: EnumHelper.inventoryEnum.body,
            image: 'plateMail',
            description: 'Plate Mail',
            slots: 1,
            armor: 5,
            durability: {
                max: 25,
                current: 25
            }
        }
    },
    hands: {
        defaultEquipment: {
            type: EnumHelper.inventoryEnum.defaultEquipment,
            image: 'punch',
            description: 'No hand gear',
            slots: 0,
            armor: 0,
            durability: {
                max: 0,
                current: 0
            }
        },
        leatherGloves: {
            name: 'Leather Gloves',
            type: EnumHelper.inventoryEnum.hands,
            image: 'leatherGloves',
            description: 'Leather Gloves',
            slots: 1,
            armor: 1,
            durability: {
                max: 5,
                current: 5
            }
        },
        heavyGloves: {
            name: 'Heavy Gloves',
            type: EnumHelper.inventoryEnum.hands,
            image: 'heavyGloves',
            description: 'Heavy Gloves',
            slots: 1,
            armor: 2,
            durability: {
                max: 10,
                current: 10
            }
        },
        chainGloves: {
            name: 'Chain Gloves',
            type: EnumHelper.inventoryEnum.hands,
            image: 'chainGloves',
            description: 'Chain Gloves',
            slots: 1,
            armor: 3,
            durability: {
                max: 15,
                current: 15
            }
        },
        lightGauntlets: {
            name: 'Light Gauntlets',
            type: EnumHelper.inventoryEnum.hands,
            image: 'lightGauntlets',
            description: 'Light Gauntlets',
            slots: 1,
            armor: 4,
            durability: {
                max: 20,
                current: 20
            }
        },
        gauntlets: {
            name: 'Gauntlets',
            type: EnumHelper.inventoryEnum.hands,
            image: 'gauntlets',
            description: 'Gauntlets',
            slots: 1,
            armor: 5,
            durability: {
                max: 25,
                current: 25
            }
        }
    },
    feet: {
        defaultEquipment: {
            type: EnumHelper.inventoryEnum.defaultEquipment,
            image: 'punch',
            description: 'No feet gear',
            slots: 0,
            armor: 0,
            durability: {
                max: 0,
                current: 0
            }
        },
        boots: {
            name: 'Boots',
            type: EnumHelper.inventoryEnum.feet,
            image: 'boots',
            description: 'Simple boots',
            slots: 1,
            armor: 1,
            durability: {
                max: 5,
                current: 5
            }
        },
        heavyBoots: {
            name: 'Heavy Boots',
            type: EnumHelper.inventoryEnum.feet,
            image: 'heavyBoots',
            description: 'Heavy boots',
            slots: 1,
            armor: 2,
            durability: {
                max: 10,
                current: 10
            }
        },
        chainBoots: {
            name: 'Chain Boots',
            type: EnumHelper.inventoryEnum.feet,
            image: 'chainBoots',
            description: 'Chain boots',
            slots: 1,
            armor: 3,
            durability: {
                max: 15,
                current: 15
            }
        },
        platedBoots: {
            name: 'Plated Boots',
            type: EnumHelper.inventoryEnum.feet,
            image: 'platedBoots',
            description: 'Plated boots',
            slots: 1,
            armor: 4,
            durability: {
                max: 20,
                current: 20
            }
        },
        greaves: {
            name: 'Greaves',
            type: EnumHelper.inventoryEnum.feet,
            image: 'greaves',
            description: 'Greaves',
            slots: 1,
            armor: 5,
            durability: {
                max: 25,
                current: 25
            }
        }
    },
    shields: {
        buckler: {
            name: 'Buckler',
            type: EnumHelper.inventoryEnum.offHand,
            image: 'buckler',
            description: 'Buckler',
            slots: 1,
            armor: 1,
            hold: 1,
            durability: {
                max: 5,
                current: 5
            }
        },
        largeShield: {
            name: 'Large Shield',
            type: EnumHelper.inventoryEnum.offHand,
            image: 'largeShield',
            description: 'Large Shield',
            slots: 1,
            armor: 2,
            hold: 1,
            durability: {
                max: 10,
                current: 10
            }
        },
        kiteShield: {
            name: 'Kite Shield',
            type: EnumHelper.inventoryEnum.offHand,
            image: 'kiteShield',
            description: 'Kite Shield',
            slots: 1,
            armor: 3,
            hold: 1,
            durability: {
                max: 15,
                current: 15
            }
        },
        spikedShield: {
            name: 'Spiked Shield',
            type: EnumHelper.inventoryEnum.offHand,
            image: 'spikedShield',
            description: 'Spiked Shield',
            slots: 1,
            armor: 4,
            hold: 1,
            durability: {
                max: 20,
                current: 20
            }
        },
        towerShield: {
            name: 'Tower Shield',
            type: EnumHelper.inventoryEnum.offHand,
            image: 'towerShield',
            description: 'Tower Shield',
            slots: 1,
            armor: 5,
            hold: 1,
            durability: {
                max: 25,
                current: 25
            }
        }
    },
    weapons: {
        // simple ---------------------------------------------------
        defaultEquipment: {
            type: EnumHelper.inventoryEnum.defaultEquipment,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.bludgeoning,
                    value: '1d4',
                    initialValue: '1d4'
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
                current: 0
            }
        },
        club: {
            name: 'Club',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.bludgeoning,
                    value: '1d4',
                    initialValue: '1d4'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'club',
            description: 'Club',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        dagger: {
            name: 'Dagger',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d4',
                    initialValue: '1d4'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'dagger',
            description: 'Dagger',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        greatclub: {
            name: 'Greatclub',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.bludgeoning,
                    value: '1d8',
                    initialValue: '1d8'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 2,
            image: 'greatclub',
            description: 'Greatclub',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        handaxe: {
            name: 'Handaxe',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.slashing,
                    value: '1d6',
                    initialValue: '1d6'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'handaxe',
            description: 'Handaxe',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        javelin: {
            name: 'Javelin',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d6',
                    initialValue: '1d6'
                }
            ],
            range: 6,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'javelin',
            description: 'Javelin',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        lightHammer: {
            name: 'Light Hammer',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.bludgeoning,
                    value: '1d4',
                    initialValue: '1d4'
                }
            ],
            range: 4,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'lightHammer',
            description: 'Light Hammer',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        mace: {
            name: 'Mace',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.bludgeoning,
                    value: '1d6',
                    initialValue: '1d6'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'mace',
            description: 'Mace',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        quarterstaff: {
            name: 'Quarterstaff',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.bludgeoning,
                    value: '1d6',
                    initialValue: '1d6'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'quarterstaff',
            description: 'Quarterstaff',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        sickle: {
            name: 'Sickle',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.slashing,
                    value: '1d4',
                    initialValue: '1d4'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'sickle',
            description: 'Sickle',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        spear: {
            name: 'Spear',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d6',
                    initialValue: '1d6'
                }
            ],
            range: 4,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'spear',
            description: 'Spear',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        // simple ranged---------------------------------------------------
        lightCrossbow: {
            name: 'Light Crossbow',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d8',
                    initialValue: '1d8'
                }
            ],
            range: 16,
            attribute: EnumHelper.attributeEnum.dexterity,
            hold: 2,
            image: 'lightCrossbow',
            description: 'Light Crossbow',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        balancedKnife: {
            name: 'Balanced Knife',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d4',
                    initialValue: '1d4'
                }
            ],
            range: 4,
            attribute: EnumHelper.attributeEnum.dexterity,
            hold: 1,
            image: 'balancedKnife',
            description: 'Balanced Knife',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        shortBow: {
            name: 'Short bow',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d6',
                    initialValue: '1d6'
                }
            ],
            range: 16,
            attribute: EnumHelper.attributeEnum.dexterity,
            hold: 2,
            image: 'shortBow',
            description: 'Short bow',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        // special ---------------------------------------------------
        battleaxe: {
            name: 'Battleaxe',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.slashing,
                    value: '1d8',
                    initialValue: '1d8'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'battleaxe',
            description: 'Battleaxe',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        flail: {
            name: 'Flail',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.bludgeoning,
                    value: '1d8',
                    initialValue: '1d8'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'flail',
            description: 'Flail',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        glaive: {
            name: 'Glaive',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.bludgeoning,
                    value: '1d10',
                    initialValue: '1d10'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 2,
            image: 'glaive',
            description: 'Glaive',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        greataxe: {
            name: 'Greataxe',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.slashing,
                    value: '1d12',
                    initialValue: '1d12'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 2,
            image: 'greataxe',
            description: 'Greataxe',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        greatsword: {
            name: 'Greatsword',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.slashing,
                    value: '2d6',
                    initialValue: '2d6'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 2,
            image: 'greatsword',
            description: 'Greatsword',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        halberd: {
            name: 'Halberd',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.slashing,
                    value: '1d10',
                    initialValue: '1d10'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 2,
            image: 'halberd',
            description: 'Halberd',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        lance: {
            name: 'Lance',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d12',
                    initialValue: '1d12'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'lance',
            description: 'Lance',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        longsword: {
            name: 'Longsword',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.slashing,
                    value: '1d8',
                    initialValue: '1d8'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'longsword',
            description: 'Longsword',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        maul: {
            name: 'Maul',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.bludgeoning,
                    value: '2d6',
                    initialValue: '2d6'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 2,
            image: 'maul',
            description: 'Maul',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        morningstar: {
            name: 'Morningstar',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d8',
                    initialValue: '1d8'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'morningstar',
            description: 'Morningstar',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        pike: {
            name: 'Pike',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d10',
                    initialValue: '1d10'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 2,
            image: 'pike',
            description: 'Pike',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        rapier: {
            name: 'Rapier',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d8',
                    initialValue: '1d8'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'rapier',
            description: 'Rapier',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        scimitar: {
            name: 'Scimitar',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.slashing,
                    value: '1d6',
                    initialValue: '1d6'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'scimitar',
            description: 'Scimitar',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        shortSword: {
            name: 'Short Sword',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d6',
                    initialValue: '1d6'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'shortSword',
            description: 'Short sword',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        trident: {
            name: 'Trident',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d6',
                    initialValue: '1d6'
                }
            ],
            range: 4,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'trident',
            description: 'Trident',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        warPick: {
            name: 'War Pick',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d8',
                    initialValue: '1d8'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'warPick',
            description: 'War Pick',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        warhammer: {
            name: 'Warhammer',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.bludgeoning,
                    value: '1d8',
                    initialValue: '1d8'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'warhammer',
            description: 'Warhammer',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        whip: {
            name: 'Whip',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.slashing,
                    value: '1d4',
                    initialValue: '1d4'
                }
            ],
            range: 1,
            attribute: EnumHelper.attributeEnum.strength,
            hold: 1,
            image: 'whip',
            description: 'whip',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        // special ranged ---------------------------------------------------
        handCrossbow: {
            name: 'Hand Crossbow',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d6',
                    initialValue: '1d6'
                }
            ],
            range: 6,
            attribute: EnumHelper.attributeEnum.dexterity,
            hold: 2,
            image: 'handCrossbow',
            description: 'Hand Crossbow',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        heavyCrossbow: {
            name: 'Heavy Crossbow',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d10',
                    initialValue: '1d10'
                }
            ],
            range: 15,
            attribute: EnumHelper.attributeEnum.dexterity,
            hold: 2,
            image: 'heavyCrossbow',
            description: 'Heavy Crossbow',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        },
        longbow: {
            name: 'Longbow',
            type: EnumHelper.inventoryEnum.mainHand,
            damage: [
                {
                    type: EnumHelper.damageTypeEnum.piercing,
                    value: '1d8',
                    initialValue: '1d8'
                }
            ],
            range: 20,
            attribute: EnumHelper.attributeEnum.dexterity,
            hold: 2,
            image: 'longbow',
            description: 'Longbow',
            slots: 1,
            sound: {
                hittingArmor: 'sword_clang',
                hittingFlesh: 'sword_flesh'
            },
            durability: {
                max: 20,
                current: 20
            }
        }
    },
    utility: {
        arrows: {
            name: 'Bow arrows',
            type: EnumHelper.inventoryEnum.offHand,
            image: 'arrows',
            description: 'Bow arrows',
            slots: 1,
            hold: 1,
            quantity: 20
        },
        bolts: {
            name: 'Crossbow bolts',
            type: EnumHelper.inventoryEnum.offHand,
            image: 'bolts',
            description: 'Crossbow bolts',
            slots: 1,
            hold: 1,
            quantity: 20
        }
    }
};