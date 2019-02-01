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
        fire: 4
    },
    traitEnum: {
        standard: 0
    },
    actionEnum: {
        attackMainHand: 1,
        attackSpell: 2
    },
    inventoryEnum: {
        defaultEquipment: 0,
        mainHand: 1,
        offHand: 2,
        head: 3,
        body: 4,
        feet: 5,
        hands: 6
    }
};