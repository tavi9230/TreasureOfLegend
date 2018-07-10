export const CollisionManager = function (player, objects) {
	this.player = player;
	this.objects = objects;
	this.checkCollision = function () {
		//collision from down to up
		if (this.player.controls.keys.up) {
			if (this.player.y - this.player.playerHeight / 2 <= this.objects[0].y + this.objects[0].objectHeight / 2
				&& this.player.y - this.player.playerHeight / 2 >= this.objects[0].y - this.objects[0].objectHeight / 4
				&& this.player.x + this.player.playerWidth / 2 > this.objects[0].x
				&& this.player.x - this.player.playerWidth / 2 < this.objects[0].x + this.objects[0].objectWidth) {
				this.player.y = this.objects[0].y + this.objects[0].objectHeight / 2 + this.player.playerHeight / 2;
			}
		}
	};
};