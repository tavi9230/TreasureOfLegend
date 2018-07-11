export const CollisionManager = function (player, objects) {
    this.player = player;
    this.objects = objects;
    this.checkCollision = function () {
        //collision from down to up
        for (var i = 0; i < this.objects.length; i++) {
            if (Math.abs(this.player.y - this.objects[i].y) <= this.player.playerHeight && Math.abs(this.player.x - this.objects[i].x) <= this.player.playerWidth) {
                if (this.player.controls.keys.up) {
                    if (this.player.y - this.player.playerHeight / 2 >= this.objects[i].y) {
                        if (this.player.y <= this.objects[i].y + this.objects[i].objectHeight - this.player.playerHeight / 4) {
                            this.player.y = this.objects[i].y + this.objects[i].objectHeight - this.player.playerHeight / 4;
                        }
                    }
                }
                if (this.player.controls.keys.down) {
                    if (this.player.y - this.player.playerHeight / 2 <= this.objects[i].y) {
                        if (this.player.y >= this.objects[i].y) {
                            this.player.y = this.objects[i].y;
                        }
                    }
                }
            }
        }
    };
};