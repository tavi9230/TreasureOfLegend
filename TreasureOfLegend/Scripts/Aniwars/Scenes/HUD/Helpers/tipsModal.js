export const TipsModal = function (scene) {
    var scene = scene,
        tipsPanel = null,
        tipsText = null;
    this.showTips = function (x, y, textToShow) {
        tipsPanel = scene.add.graphics();
        tipsPanel.fillStyle(0x111111, 1);
        tipsText = scene.add.text(x + 5, y + 2, textToShow, { fill: '#FFF', wordWrap: { width: 100 } });
        var width = tipsText.width,
            height = tipsText.height;
        tipsPanel.fillRect(x, y, width + 10, height + 4);
        tipsText.destroy();
        tipsText = scene.add.text(x + 5, y + 2, textToShow, { fill: '#FFF', wordWrap: { width: 100 } });
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