import {AssetLoader} from 'DMan/assetLoader';

export const DManGame = function () {
    var assetLoader,
        platforms,
        player,
        cursors,
        stars,
        score = 0,
        scoreText,
        bombs,
        gameOver = false,
        lives = 3,
        livesText,
        testText,
        isJumpActive = true;

    function preload () {
        assetLoader = new AssetLoader(this);
        assetLoader.loadImages();
        assetLoader.loadSounds();
    }

    function create ()
    {
        //add sound
        this.sound.add('background', {volume: 0.1});
        this.sound.add('coin');
        this.sound.add('death');
        //this.sound.play('background', {name: 'background'});

        //add camera
        this.cameras.main.setBounds(0, 0, 1600, 600);
        this.physics.world.bounds.width = 1600;
        this.physics.world.bounds.height = 600;

        //add background
        this.add.image(400, 300, 'sky');
        this.add.image(1200, 300, 'sky');
        
        //add platforms
        platforms = this.physics.add.staticGroup();

        platforms.create(400, 568, 'ground').setScale(6).refreshBody();
        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(350, 400, 'groundVertical');
        platforms.create(930, 350, 'groundVertical');
        platforms.create(750, 280, 'ground');

        //add player
        player = this.physics.add.sprite(100, 450, 'dude');
        //player.setBounce(0.1); //don't bounce after landing
        player.setCollideWorldBounds(true); //collide with edges
        player.body.gravity.y = 400;
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        //add collisions between player and platforms
        this.physics.add.collider(player, platforms);

        //get keyboard input in this variable
        cursors = this.input.keyboard.createCursorKeys();

        //add stars
        stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        this.physics.add.collider(stars, platforms);
        this.physics.add.overlap(player, stars, collectStar, null, this);

        //add score
        scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        livesText = this.add.text(520, 16, 'Lives:' + lives, { fontSize: '32px', fill: '#000' });
        testText = this.add.text(16, 64, 'isJumpActive: ' + isJumpActive, { fontSize: '32px', fill: '#000' });

        //add bombs
        bombs = this.physics.add.group();
        this.physics.add.collider(bombs, platforms);
        this.physics.add.collider(player, bombs, hitBomb, null, this);

        this.cameras.main.startFollow(player, true, 0.09, 0.09);

        this.cameras.main.setZoom(1);
    }

    function update() {
        scoreText.setX(this.cameras.main.scrollX + 16);
        livesText.setX(this.cameras.main.scrollX + 520);

        if (gameOver) {
            scoreText.setX(this.cameras.main.scrollX + (800 - scoreText.width) / 2);
            scoreText.setY(this.cameras.main.scrollY + (600 - scoreText.height) / 2);
            scoreText.setText('You died. Final score: ' + score);
        } else {
            if (!player.body.touching.left && !player.body.touching.right) {
                if (cursors.left.isDown && cursors.shift.isDown) {
                    player.setVelocityX(-250);
                    player.anims.play('left', true);
                } else if (cursors.right.isDown && cursors.shift.isDown) {
                    player.setVelocityX(250);
                    player.anims.play('right', true);
                } else if (cursors.left.isDown) {
                    player.setVelocityX(-200);
                    player.anims.play('left', true);
                } else if (cursors.right.isDown) {
                    player.setVelocityX(200);
                    player.anims.play('right', true);
                } else {
                    player.setVelocityX(0);
                    player.anims.play('turn');
                }
            }

            if (cursors.up.isDown && isJumpActive) {
                isJumpActive = false;
                if (cursors.left.isDown && (player.body.touching.left || player.body.wasTouching.left)) {
                    player.setVelocityY(-300);
                    player.setVelocityX(50);
                }
                if (cursors.left.isDown &&  (player.body.touching.left || player.body.wasTouching.left) && cursors.shift.isDown) {
                    player.setVelocityY(-370);
                    player.setVelocityX(100);
                }
                if (cursors.right.isDown && (player.body.touching.right || player.body.wasTouching.right)) {
                    player.setVelocityY(-300);
                    player.setVelocityX(-50);
                }
                if (cursors.right.isDown && (player.body.touching.right || player.body.wasTouching.right) && cursors.shift.isDown) {
                    player.setVelocityY(-370);
                    player.setVelocityX(-100);
                } else if (cursors.shift.isDown && player.body.touching.down) {
                    player.setVelocityY(-370);
                } else if (player.body.touching.down) {
                    player.setVelocityY(-300);
                }
            } else if(cursors.up.isUp) {
                isJumpActive = true;
            }

            if (cursors.down.isDown && !player.body.touching.down) {
                player.setVelocityY(300);
            }

            testText.setText('isJumpActive: ' + isJumpActive);
        }
    }

    var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 400 },
                debug: false
            }
        }
    };

    var game = new Phaser.Game(config);

    function collectStar (player, star)
    {
        this.sound.play('coin', { name: 'coin'});
        star.disableBody(true, true);
        score += 10;
        scoreText.setText('Score: ' + score);
        if (stars.countActive(true) === 0) {
            stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
        }
    }

    function hitBomb(player, bomb) {
        this.sound.play('death', { name: 'death', start:1, duration: 3.0, config: {}});
        lives--;
        livesText.setText('Lives: ' + lives);
        bomb.setVelocityX(-1 * 5 * (player.y - bomb.y));
        if (lives === 0) {
            this.physics.pause();
            player.setTint(0xff0000);
            player.anims.play('turn');
            this.sound.stopAll();
            gameOver = true;
        }
    }
};