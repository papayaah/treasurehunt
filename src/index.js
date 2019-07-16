import Phaser from "phaser"
import logoImg from "./assets/logo.png"
import atlasJson from './assets/atlas.json'

const config = {
  type: Phaser.AUTO,
  scale: {
    parent: "phaser-example",
    width: 320,
    height: 240,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 300 },
        debug: true
    }
  },
  pixelArt: true,
  zoom: 1,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config)
var cursors
var player
var movingLeft = false
var movingRight = false
var worldLayer
function preload() {
  this.load.image("logo", logoImg)
  this.load.image("tiles", "src/assets/tileset.png")
  this.load.multiatlas('atlas', 'src/assets/atlas.json', 'src/assets')
  this.load.tilemapTiledJSON("map", "src/assets/tilemap.json")
}

function create() {
  // const logo = this.add.image(400, 150, "logo")

  // this.tweens.add({
  //   targets: logo,
  //   y: 450,
  //   duration: 2000,
  //   ease: "Power2",
  //   yoyo: true,
  //   loop: -1
  // })

  const map = this.make.tilemap({ key: "map" })
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage('tileset', 'tiles')

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createStaticLayer("Background", tileset, 0, 0)
  worldLayer = map.createDynamicLayer("Blocks", tileset, 0, 0)

  worldLayer.setCollisionByProperty({ collides: true })
  const debugGraphics = this.add.graphics().setAlpha(0.75)
  // worldLayer.renderDebug(debugGraphics, {
  //   tileColor: null, // Color of non-colliding tiles
  //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
  //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
  // })

  player = this.physics.add.sprite(48, 48, 'atlas', 'elf_m_hit_anim_f0.png')

  createAnimation('f_idle', 'elf_f_idle_anim_f', 0, 3)
  createAnimation('m_idle', 'elf_m_idle_anim_f', 0, 3)
  createAnimation('m_run', 'elf_m_run_anim_f', 0, 3)
  player.anims.play('m_run')

  cursors = this.input.keyboard.createCursorKeys()

  this.physics.add.collider(player, worldLayer)
}

function createAnimation(key, prefix, start, end) {
  const frameNames = game.anims.generateFrameNames('atlas', {
    start: start, end: end, zeroPad: 0,
    prefix: prefix, suffix: '.png'
  })
  game.anims.create({ key: key, frames: frameNames, frameRate: 10, repeat: -1 })
}

function update() {
  if (cursors.left.isDown) {
    if(!movingLeft) {
      this.tweens.add({
        targets: player,
        x: '-= 16',
        duration: 200,
        onStart() {
          movingLeft = true
          player.flipX = true
          player.anims.play('m_run', true)
        },
        onComplete() {
          movingLeft = false
          if(!cursors.left.isDown && !cursors.right.isDown)
            player.anims.play('m_idle', true)
        }
      })
    }
  } else if (cursors.right.isDown) {
    if(!movingRight) {
      this.tweens.add({
        targets: player,
        x: '+=16',
        duration: 200,
        //paused: true,
        onStart() {
          movingRight = true
          player.flipX = false
          player.anims.play('m_run', true)
        },
        onComplete() {
          movingRight = false
          if(!cursors.left.isDown && !cursors.right.isDown)
            player.anims.play('m_idle', true)
        }
      })
    }
  }

  if(cursors.down.isDown) {
    var tile = worldLayer.getTileAtWorldXY(player.x, player.y + 16)
    if(tile) {
      worldLayer.removeTileAt(tile.x, tile.y)
    }
  }
}