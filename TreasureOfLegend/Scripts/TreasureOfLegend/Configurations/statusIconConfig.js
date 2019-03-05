var showIcon = function (scene, x, y, text, iconName) {
    var textStyle = {
        fontSize: 20,
        wordWrap: { width: 96, useAdvancedWrap: true }
    },
        icon = scene.physics.add.sprite(x, y, iconName).setOrigin(0, 0),
        displayText = scene.add.text(icon.x + 7, icon.y + 3, -text, textStyle);
    icon.displayHeight = 30;
    icon.displayWidth = 30;
    icon.setDepth(99998);
    displayText.setDepth(99999);
    //scene.physics.moveTo(armorIcon, enemy.x + 17, enemy.y - 80, 2, 2000);
    setTimeout(function () {
        icon.destroy();
        displayText.destroy();
    }, 850);
};

export const StatusIconConfig = {
    showMovementIcon: (scene, enemy, text) => {
        showIcon(scene, enemy.x + 17, enemy.y - 35, text, 'movementIcon');
    },
    showArmorIcon: (scene, enemy, text) => {
        showIcon(scene, enemy.x + 17, enemy.y - 35, text, 'armorIcon');
    },
    showLifeIcon: (scene, enemy, text) => {
        showIcon(scene, enemy.x + 50, enemy.y - 35, text, 'healthIcon');
    },
    showManaIcon: (scene, enemy, text) => {
        showIcon(scene, enemy.x + 50, enemy.y - 35, text, 'manaIcon');
    },
    showEnergyIcon: (scene, enemy, text) => {
        showIcon(scene, enemy.x + 50, enemy.y - 35, text, 'energyIcon');
    }
};