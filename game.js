var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  backgroundColor: "#808080",
};

var player;
var cursors;
var healthText;
var points;
var game = new Phaser.Game(config);
var health = 10;

function preload() {
  this.load.image("background", "/staff_1024.jpg!w1024_new_0");
  this.load.image("player", "/player.png");
  this.load.image("smoke", "/smoke.png");
  this.load.image("radiation", "/radiation.png");
  this.load.image("toxic", "/poison.png");
  this.load.image("chest", "/treasure-chest.png");
}

function create() {
  this.background = this.add
    .tileSprite(0, 0, 800, 600, "background")
    .setOrigin(0, 0);

  player = this.physics.add
    .sprite(40, 300, "player")
    .setScale(0.2)
    .setOrigin(0.5);

  points = this.physics.add.group();

  var positions = [
    { x: 100, y: 100 },
    { x: 200, y: 500 },
    { x: 400, y: 150 },
    { x: 600, y: 450 },
    { x: 750, y: 550 },
  ];

  positions.forEach((pos, index) => {
    var key = index === 4 ? "chest" : index % 2 === 0 ? "radiation" : "toxic";
    var hiddenItem = this.physics.add
      .sprite(pos.x, pos.y, key)
      .setScale(0.1)
      .setVisible(false)
      .setData("isCollected", false);
    var smoke = this.physics.add.sprite(pos.x, pos.y, "smoke").setScale(0.1);
    smoke.setData("hidden", hiddenItem);
    points.add(hiddenItem);
    points.add(smoke);
  });

  this.physics.add.overlap(player, points, revealItem, null, this);

  healthText = this.add.text(16, 16, "Health: " + health, {
    fontSize: "32px",
    fill: "#fff",
  });

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    this.background.tilePositionX -= 2;
    player.flipX = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    this.background.tilePositionX += 2;
    player.flipX = false;
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-160);
    this.background.tilePositionY -= 2;
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
    this.background.tilePositionY += 2;
  }
}

function revealItem(player, smoke) {
  var hiddenItem = smoke.getData("hidden");
  if (hiddenItem) {
    hiddenItem.setVisible(true);
    smoke.destroy();
    this.physics.world.enable(hiddenItem);
    this.physics.add.overlap(
      player,
      hiddenItem,
      collectPoint.bind(this),
      null,
      this
    );
  }
}

function collectPoint(player, item) {
  if (!item.getData("isCollected")) {
    item.setData("isCollected", true);
    let message = "";
    if (item.texture.key === "radiation") {
      message =
        "You encountered an abandoned nuclear plant, you are irradiated, health -1";
      health--;
    } else if (item.texture.key === "toxic") {
      message =
        "You encountered a destroyed chemical plant, you are poisoned, health -1";
      health--;
    } else if (item.texture.key === "chest") {
      message = "You found the treasure! Game over.";
      this.physics.pause();
    }

    if (health <= 0) {
      health = 0;
      message = "Game Over";
      player.setTint(0xff0000);
      this.physics.pause();
    }

    healthText.setText("Health: " + health + " " + message);
  }
}

game.scene.start("default", { health: 10 });
