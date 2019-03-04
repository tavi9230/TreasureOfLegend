export const StatusIconConfig = {
    showMovementIcon: (scene, enemy, text) => {
        var textStyle = {
            fontSize: 20,
            wordWrap: { width: 96, useAdvancedWrap: true }
        },
            movementIcon = scene.physics.add.sprite(enemy.x + 17, enemy.y - 35, 'movementIcon').setOrigin(0, 0),
            movementText = scene.add.text(movementIcon.x + 7, movementIcon.y + 3, -text, textStyle);
        movementIcon.displayHeight = 30;
        movementIcon.displayWidth = 30;
        setTimeout(function () {
            movementIcon.destroy();
            movementText.destroy();
        }, 850);
    },
    showArmorIcon: (scene, enemy, text) => {
        var textStyle = {
            fontSize: 20,
            wordWrap: { width: 96, useAdvancedWrap: true }
        },
            armorIcon = scene.physics.add.sprite(enemy.x + 17, enemy.y - 35, 'armorIcon').setOrigin(0, 0),
            armorText = scene.add.text(armorIcon.x + 7, armorIcon.y + 3, -text, textStyle);
        armorIcon.displayHeight = 30;
        armorIcon.displayWidth = 30;
        //this.game.physics.moveTo(armorIcon, enemy.x + 17, enemy.y - 80, 2, 2000);
        setTimeout(function () {
            armorIcon.destroy();
            armorText.destroy();
        }, 850);
    },
    showLifeIcon: (scene, enemy, text) => {
        var textStyle = {
            fontSize: 20,
            wordWrap: { width: 96, useAdvancedWrap: true }
        },
            healthIcon = scene.physics.add.sprite(enemy.x + 50, enemy.y - 35, 'healthIcon').setOrigin(0, 0),
            healthText = scene.add.text(healthIcon.x + 7, healthIcon.y + 3, -text, textStyle);
        healthIcon.displayHeight = 30;
        healthIcon.displayWidth = 30;
        setTimeout(function () {
            healthIcon.destroy();
            healthText.destroy();
        }, 850);
    },
    showManaIcon: (scene, enemy, text) => {
        var textStyle = {
            fontSize: 20,
            wordWrap: { width: 96, useAdvancedWrap: true }
        },
            healthIcon = scene.physics.add.sprite(enemy.x + 50, enemy.y - 35, 'manaIcon').setOrigin(0, 0),
            healthText = scene.add.text(healthIcon.x + 7, healthIcon.y + 3, -text, textStyle);
        healthIcon.displayHeight = 30;
        healthIcon.displayWidth = 30;
        setTimeout(function () {
            healthIcon.destroy();
            healthText.destroy();
        }, 850);
    },
    showEnergyIcon: (scene, enemy, text) => {
        var textStyle = {
            fontSize: 20,
            wordWrap: { width: 96, useAdvancedWrap: true }
        },
            healthIcon = scene.physics.add.sprite(enemy.x + 50, enemy.y - 35, 'energyIcon').setOrigin(0, 0),
            healthText = scene.add.text(healthIcon.x + 7, healthIcon.y + 3, -text, textStyle);
        healthIcon.displayHeight = 30;
        healthIcon.displayWidth = 30;
        setTimeout(function () {
            healthIcon.destroy();
            healthText.destroy();
        }, 850);
    }
};