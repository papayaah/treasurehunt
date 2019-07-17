import Phaser from 'phaser'
import Multiplayer from './multiplayer'
import Player from './player'
import { textChangeRangeIsUnchanged } from 'typescript';
const dat = require('dat.gui')

const gui = new dat.GUI()
const guiLevel = gui.addFolder('GameState')
guiLevel.open()
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
}

window.game = new Phaser.Game(config)
var cursors
var player
var movingLeft = false
var movingRight = false
var worldLayer
function preload() {
  this.load.image("tiles", "src/assets/tileset.png")
  this.load.multiatlas('atlas', 'src/assets/atlas.json', 'src/assets')
  this.load.tilemapTiledJSON("map", "src/assets/tilemap.json")
  this.load.bitmapFont('CelticTime12', 'src/assets/fonts/CelticTime12.png', 'src/assets/fonts/CelticTime12.xml');
}

function create() {
  this.players = []
  this.multiplayer = new Multiplayer()

  this.messageLog = new MessageLog(game.scene.scenes[0])

  game.emitter = new Phaser.Events.EventEmitter()
  game.emitter.on('connected', (session) => {
    this.messageLog.addMessage('Connected')
  })

  game.emitter.on('createMatch', params => this.messageLog.addMessage(`Created match: ${params.match_id}`))
  game.emitter.on('joinMatch', params => this.messageLog.addMessage(`Joined match: ${params.match_id}`))

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

  player = new Player(game.scene.scenes[0], 240, 48)
  this.players.push(player)
  guiLevel.add(player, 'x', 0, 320).name('Player X').listen()
  guiLevel.add(player.body.velocity, 'y', 0, 240).name('Player Y').listen()

  cursors = this.input.keyboard.createCursorKeys()

  this.physics.add.collider(this.players, worldLayer)
}

function createAnimation(key, prefix, start, end) {
  const frameNames = game.anims.generateFrameNames('atlas', {
    start: start, end: end, zeroPad: 0,
    prefix: prefix, suffix: '.png'
  })
  game.anims.create({ key: key, frames: frameNames, frameRate: 10, repeat: -1 })
}

function update() {
  if(movingLeft || movingRight || player.body.velocity.y != 0)
    return

  if (cursors.left.isDown) {
    let tile = worldLayer.getTileAtWorldXY(player.x - 1, player.y)
    if(tile) {
      return worldLayer.removeTileAt(tile.x, tile.y)
    }
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
    let tile = worldLayer.getTileAtWorldXY(player.x + 16, player.y)
    if(tile) {
      return worldLayer.removeTileAt(tile.x, tile.y)
    }
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
  } else if(cursors.down.isDown) {
    let tile = worldLayer.getTileAtWorldXY(player.x, player.y + 16)
    if(tile) {
      worldLayer.removeTileAt(tile.x, tile.y)
    }
  }
}


class MessageLog {
  constructor(scene) {
    this.scene = scene
    this.bitmapTexts = []
  }

  addMessage(str) {
    str = str.substr(0, 28)
    this.bitmapTexts.push(
      this.scene.add.bitmapText(2, 0, 'CelticTime12', str)
    )

    this.bitmapTexts.forEach((bitmapText, idx) => {
      bitmapText.y = (this.bitmapTexts.length - idx) * 10 - 10
    })

    this.truncate()
  }

  truncate() {
    if(this.bitmapTexts.length > 3) {
      let bitmapText = this.bitmapTexts.shift()
      this.scene.tweens.add({
        targets: bitmapText,
        alpha: 0,
        duration: 1500,
        ease: 'Power2'
      })
    }
  }
}

