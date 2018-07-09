export const CollisionManager = function (player, objects) {
    this.player = player;
    this.objects = objects;
    this.checkCollision = function() {
        //collision from down to up
        if (Game.controls.controls.up) {
            if (this.player.y - this.player.wHeight / 2 <= this.objects[0].y + this.objects[0].wHeight / 2
                && this.player.y - this.player.wHeight / 2 >= this.objects[0].y - this.objects[0].wHeight / 4
                && this.player.x + this.player.wWidth / 2 > this.objects[0].x
                && this.player.x - this.player.wWidth / 2 < this.objects[0].x + this.objects[0].wWidth) {
                this.player.y = this.objects[0].y + this.objects[0].wHeight / 2 + this.player.wHeight / 2;
            }
        }
    };
};