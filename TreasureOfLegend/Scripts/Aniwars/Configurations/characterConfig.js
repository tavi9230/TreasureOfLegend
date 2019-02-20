﻿import { InventoryConfig } from 'Aniwars/Configurations/inventoryConfig';
import { SpellsConfig } from 'Aniwars/Configurations/spellsConfig';

export const CharacterConfig = {
    config: {
        path: [],
        armor: 0,
        posX: 0,
        posY: 0,
        velocity: 200,
        life: {
            max: 10,
            current: 10
        },
        mana: {
            max: 10,
            spent: 0
        },
        movement: {
            max: 6,
            spent: 0,
            isMoving: false,
            usedDash: false
        },
        energy: {
            max: 20,
            spent: 0,
            actionId: -1,
            selectedAction: null,
            inProgress: null
        },
        inventory: {
            mainHand: InventoryConfig.weapons.defaultEquipment,
            offHand: InventoryConfig.weapons.defaultEquipment,
            head: InventoryConfig.head.defaultEquipment,
            body: InventoryConfig.body.defaultEquipment,
            feet: InventoryConfig.feet.defaultEquipment,
            hands: InventoryConfig.hands.defaultEquipment,
            slots: {
                max: 2,
                items: []
            },
            money: 0,
            spells: [SpellsConfig.firebolt]
        },
        attributes: {
            strength: 0,
            dexterity: 0,
            intelligence: 0
        },
        image: '',
        isPlayerControlled: true,
        statuses: [],
        resistances: [],
        vulnerabilities: [],
        invulnerabilities: [],
        experience: {
            current: 0,
            nextLevel: 12,
            attributePoints: 1,
            level: 1
        }
    }
};