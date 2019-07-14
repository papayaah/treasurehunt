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

function preload() {
  this.load.image("logo", logoImg)

  this.load.multiatlas('atlas', 'src/assets/atlas.json', 'src/assets')
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

  player = this.add.sprite(40, 40, 'atlas', 'elf_m_hit_anim_f0.png')

  createAnimation('f_idle', 'elf_f_idle_anim_f', 0, 3)
  createAnimation('m_run', 'elf_m_run_anim_f', 0, 3)
  player.anims.play('m_run')

  cursors = this.input.keyboard.createCursorKeys();
}

function createAnimation(key, prefix, start, end) {
  const frameNames = game.anims.generateFrameNames('atlas', {
    start: start, end: end, zeroPad: 0,
    prefix: prefix, suffix: '.png'
  })
  game.anims.create({ key: key, frames: frameNames, frameRate: 10, repeat: -1 })
}

function update() {
  if (cursors.left.isDown)
  {
      player.x -= 10
      player.flipX = true
      player.anims.play('m_run', true);
  }
  else if (cursors.right.isDown)
  {
      player.x += 10
      player.flipX = false
      player.anims.play('m_run', true);
  }
}