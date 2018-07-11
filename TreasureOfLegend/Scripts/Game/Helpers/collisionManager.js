export const CollisionManager = function (player, objects) {
    this.player = player;
    this.objects = objects;
    this.checkCollision = function () {
        for (var i = 0; i < this.objects.wallTop.length; i++) {
            if (this.player.x >= this.objects.wallTop[i].left &&
                this.player.x <= this.objects.wallTop[i].right &&
                this.player.y >= this.objects.wallTop[i].top + this.player.playerHeight / 4 &&
                this.player.y <= this.objects.wallTop[i].bottom - this.player.playerHeight / 4) {
                if (this.player.controls.keys.up) {
                    if (this.player.y < this.objects.wallLeft[i].top + this.player.playerHeight / 4) {
                        this.player.y = this.objects.wallTop[i].bottom - this.player.playerHeight / 4;
                    }
                }
                else if (this.player.controls.keys.down) {
                    if (this.player.y > this.objects.wallLeft[i].bottom - this.player.playerHeight / 4) {
                        this.player.y = this.objects.wallTop[i].top + this.player.playerHeight / 4;
                    }
                }
            }
        }
        for (var i = 0; i < this.objects.wallLeft.length; i++) {
            if (this.player.x >= this.objects.wallLeft[i].left - this.player.playerWidth / 4 &&
                this.player.x <= this.objects.wallLeft[i].right + this.player.playerWidth / 4 &&
                this.player.y >= this.objects.wallLeft[i].top &&
                this.player.y <= this.objects.wallLeft[i].bottom) {
                if (this.player.controls.keys.left) {
                    if (this.player.x > this.objects.wallLeft[i].left - this.player.playerWidth / 4) {
                        this.player.x = this.objects.wallLeft[i].right + this.player.playerWidth / 4;
                    }
                }
                else if (this.player.controls.keys.right) {
                    if (this.player.x < this.objects.wallLeft[i].right + this.player.playerWidth / 4) {
                        this.player.x = this.objects.wallLeft[i].left - this.player.playerWidth / 4;
                    }
                }
            }
        }
    };
};