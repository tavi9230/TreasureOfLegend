/*eslint-disable */
import { WindowEvents } from 'Shared/windowEvents';

export const LandingContainer = {
	template:
	'<div id="landing">' +
	'<div>' + Resources.TreasureOfLegend + '</div>' +
	'<div v-on:click="_getRope">Click to toggle rope, to touch objects from 3 spaces away</div>' +
	'<div v-on:click="_endTurn">Click to end turn</div>' +
	'<div>Movement left: {{movement}}</div>' +
	'<img src="https://thumbs.dreamstime.com/b/goblin-warrior-25301249.jpg" usemap="#goblinMap" ref="testImage">' +
	'<map name="goblinMap">' +
	'<area shape="circle" coords="286,198,50" alt="Nose" v-on:click="_attack">' +
	'<area shape="circle" coords="285,185,200" alt="Head" v-on:click="_attack">' +
	'<area shape="circle" coords="50,420,50" alt="Right Hand" v-on:click="_attack">' +
	'<area shape="rect" coords="399,732,580,816" alt="Left foot" v-on:click="_attack">' +
	'</map>' +
	'<img :src="_getImageSrc()" usemap="#worldMap" ref="worldMap" id="worldMap">' +
	'<map name="worldMap">' +
	'<area v-for="(value, index) in 80" shape="rect" :coords="_returnCoords(index)" :alt="_returnName(index)" v-on:click="_moveToLocation">' +
	'</map>' +
	'<div class="character" ref="character">' +
	'</div>' +
	'<div class="character2" ref="character2"></div>' +
	'<div class="obstacle" ref="obstacle1" v-on:click="_doAction(1)" data-name="obstacle 1"></div>' +
	'<div class="obstacle2" ref="obstacle2" v-on:click="_doAction(2)" data-name="obstacle 2"></div>' +
	'</div>',
	created: function () {
		WindowEvents.add('keyup', this._moveCharacter);
	},
	beforeDestroy: function () {
		WindowEvents.remove('keyup', this._moveCharacter);
	},
	data: function () {
		return {
			hasRope: false,
			movement: 6
		};
	},
	methods: {
		_attack: function (e) {
			alert('attacked -> ' + e.target.alt);
		},
		_getImageSrc: function () {
			return '/api/image/WorldMap';
		},
		_returnCoords: function (index) {
			var x1Index = index % 10;
			var y1Index = parseInt(index / 10);
			var x2Index = (index % 10) + 1;
			var y2Index = parseInt((index + 10) / 10);
			var x1 = x1Index * 102;
			var y1 = y1Index * 102;
			var x2 = x2Index * 102;
			var y2 = y2Index * 102;
			return x1.toString() + ' ' + y1.toString() + ' ' + x2.toString() + ' ' + y2.toString();
			//0, 0; 102, 102       102, 0; 204, 102      204, 0; 306, 102.............    918, 0; 1020, 102
			//0, 102; 102,204     102, 102; 204, 204    204, 102; 306; 204............   918, 102; 1020; 204
			//0, 204     102, 204     204, 204............    918, 204
			//	.
			//0, 918     102, 918     204, 918...........     918,918
		},
		_returnName: function (index) {
			return 'MapSquare' + (index + 1);
		},
		_moveToLocation: function (e) {
			var coords = e.target.coords.split(' ');
			this.$refs.character.style.top = this.$refs.worldMap.offsetTop + 25.5 + parseInt(coords[1]) + 'px';
			this.$refs.character.style.left = this.$refs.worldMap.offsetLeft + 25.5 + parseInt(coords[0]) + 'px';
		},
		_getRope: function () {
			this.hasRope = !this.hasRope;
		},
		_endTurn: function () {
			this.movement = 6;
		},
		_moveCharacter: function (e) {
			if (this.movement === 0) {
				alert('End turn to regain movement');
				return;
			}
			var canMove = true;
			var character = this.$refs.character2;
			var characterPosition = character.getBoundingClientRect();
			if (character.style.top === '') {
				character.style.top = character.getBoundingClientRect().x + 'px';
			}
			if (character.style.left === '') {
				character.style.left = character.getBoundingClientRect().y + 'px';
			}
			for (var i = 1; i <= 2; i++) {
				var obstaclePosition = this.$refs['obstacle' + i].getBoundingClientRect();
				if (e.key === 'w') {
					if (characterPosition.left !== obstaclePosition.left) {
						canMove = true;
					} else if (characterPosition.top - 50 !== obstaclePosition.top) {
						canMove = true;
					} else {
						canMove = false;
						return;
					}
				} else if (e.key === 'a') {
					if (characterPosition.top !== obstaclePosition.top) {
						canMove = true;
					} else if (characterPosition.left - 50 !== obstaclePosition.left) {
						canMove = true;
					} else {
						canMove = false;
						return;
					}
				} else if (e.key === 's') {
					if (characterPosition.left !== obstaclePosition.left) {
						canMove = true;
					} else if (characterPosition.bottom + 50 !== obstaclePosition.bottom) {
						canMove = true;
					} else {
						canMove = false;
						return;
					}
				} else if (e.key === 'd') {
					if (characterPosition.top !== obstaclePosition.top) {
						canMove = true;
					} else if (characterPosition.right + 50 !== obstaclePosition.right) {
						canMove = true;
					} else {
						canMove = false;
						return;
					}
				}
			}
			if (canMove) {
				if (e.key === 'w') {
					character.style.top = parseInt(character.style.top) - 50 + 'px';
				} else if (e.key === 'a') {
					character.style.left = parseInt(character.style.left) - 50 + 'px';
				} else if (e.key === 's') {
					character.style.top = parseInt(character.style.top) + 50 + 'px';
				} else if (e.key === 'd') {
					character.style.left = parseInt(character.style.left) + 50 + 'px';
				}
				this.movement -= 1;
			}
		},
		_doAction: function (obstacleIndex) {
			var range = 50;
			if (this.hasRope) {
				range = 150;
			}
			var character = this.$refs.character2;
			var characterPosition = character.getBoundingClientRect();
			var obstaclePosition = this.$refs['obstacle' + obstacleIndex].getBoundingClientRect();
			if (Math.abs(obstaclePosition.top - characterPosition.top) <= range &&
				Math.abs(obstaclePosition.bottom - characterPosition.bottom) <= range &&
				Math.abs(obstaclePosition.left - characterPosition.left) <= range &&
				Math.abs(obstaclePosition.right - characterPosition.right) <= range) {
				alert('clicked object ' + this.$refs['obstacle' + obstacleIndex].dataset.name);
			}
		}
	}
};