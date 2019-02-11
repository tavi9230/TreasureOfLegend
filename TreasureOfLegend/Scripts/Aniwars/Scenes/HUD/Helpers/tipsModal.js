export const TipsModal = function (scene) {
    var scene = scene,
        tipsPanel = null,
        tipsText = null;
    this.showTips = function (x, y, width, height, textToShow) {
        tipsPanel = scene.add.graphics();
        tipsPanel.fillStyle(0x111111, 1);
        tipsPanel.fillRect(x, y, width, height);
        tipsText = scene.add.text(x + 5, y + 2, textToShow, { fill: '#FFF' });
    };
    this.hideTips = function () {
        if (tipsText) {
            tipsText.destroy();
            tipsText = null;
            tipsPanel.destroy();
            tipsPanel = null;
        }
    };
};