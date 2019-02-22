export const EnumHelper = {
    idEnum: {
        tile: {
            id: 0,
            type: {}
        },
        wall: {
            id: 1,
            type: {
                top: 1.1,
                side: 1.2,
                topLeft: 1.3,
                topRight: 1.4,
                bottomLeft: 1.5,
                bottomRight: 1.6
            }
        },
        door: {
            id: 2,
            type: {
                up: 2.1,
                right: 2.2,
                down: 2.3,
                left: 2.4
            }
        },
        lootbag: {
            id: 3,
            type: {}
        },
        well: {
            id: 4,
            type: {
                health: 4.1,
                mana: 4.2,
                movement: 4.3,
                energy: 4.4
            }
        }
    },
    attributeEnum: {
        strength: 1,
        dexterity: 2,
        intelligence: 3
    },
    damageTypeEnum: {
        slashing: 1,
        piercing: 2,
        bludgeoning: 3,
        fire: 4,
        cold: 5,
        poison: 6,
        acid: 7,
        lightning: 8,
        necrotic: 9,
        radiant: 10,
        thunder: 11,
        psychic: 12,
        force: 13
    },
    conditionsEnum: {
        blinded: 1,
        charmed: 2,
        deafened: 3,
        frightened: 4,
        invisible: 5,
        paralyzed: 6,
        petrified: 7,
        poisoned: 8,
        stunned: 9,
        unconscious: 10,
        prone: 11,
        incapacitated: 12,
        grappled: 13
    },
    traitEnum: {
        standard: 0,
        magic: 1
    },
    actionEnum: {
        attackMainHand: 1,
        attackSpell: 2,
        inspect: 3,
        attackOffHand: 4
    },
    inventoryEnum: {
        defaultEquipment: 0,
        mainHand: 1,
        offHand: 2,
        head: 3,
        body: 4,
        feet: 5,
        hands: 6,
        inventory: 7,
        utility: 8
    },
    movementEnum: {
        walk: 1,
        swim: 2,
        climb: 3,
        fly: 4
    },
    weaponPropertiesEnum: {
        finesse: 1,
        loading: 2,
        // TODO: Implement
        thrown: 3,
        versatile: 4,
        // TODO: Implement
        silvered: 5,
        // TODO: Implement
        magical: 6,
        light: 7,
        // TODO: Implement
        reach: 8
    },
    ammunitionEnum: {
        arrows: 1,
        bolts: 2
    }
};