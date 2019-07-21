export default class extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, multiplayer) {
    super(scene, x, y, 'atlas', 'elf_m_hit_anim_f0.png')
      .setOrigin(0, 0.5)

    scene.add.existing(this)
    //scene.physics.world.enable(this)
    scene.physics.add.existing(this)
    this.body.setCollideWorldBounds(true)

    this.scene = scene
    this.createAnimation('f_idle', 'elf_f_idle_anim_f', 0, 3)
    this.createAnimation('m_idle', 'elf_m_idle_anim_f', 0, 3)
    this.createAnimation('m_run', 'elf_m_run_anim_f', 0, 3)
    this.anims.play('m_run')

    this.movingRight = false
    this.movingLeft = false
    this.multiplayer = multiplayer
    this.userId = null
    this.moveQueue = []
    this.dying = false
  }

  preUpdate(time, delta) {
    if(this.dying) return
    super.preUpdate(time, delta)
    if(this.moving()) return

    if(this.moveQueue.length > 0) {
      if(this.moveQueue[0].action == 'moveRight') {
        this.moveRight()
      } else if (this.moveQueue[0].action == 'moveLeft') {
        this.moveLeft()
      }
      this.moveQueue.shift()
    }
  }

  createAnimation(key, prefix, start, end) {
    const frameNames = this.scene.anims.generateFrameNames('atlas', {
      start: start, end: end, zeroPad: 0,
      prefix: prefix, suffix: '.png'
    })
    this.scene.anims.create({ key: key, frames: frameNames, frameRate: 10, repeat: -1 })
  }

  moving() {
    return this.movingLeft || this.movingRight || this.body.velocity.y != 0
  }

  moveRight(cursors) {
    if(!this.movingRight) {
      this.scene.tweens.add({
        targets: this,
        x: '+=16',
        duration: 200,
        //paused: true,
        onStart(tween, targets) {
          const player = targets[0]
          player.movingRight = true
          player.flipX = false
          player.anims.play('m_run', true)

          if(cursors)
            player.multiplayer.playerMoveRight(player.userId)
        },
        onComplete(tween, targets) {
          const player = targets[0]
          player.movingRight = false
          if(!cursors) {
            console.log(player)
            player.anims.play('m_idle', true)
          }
          else if(!cursors.left.isDown && !cursors.right.isDown) {
            console.log(player)
            player.anims.play('m_idle', true)
          }
        }
      })
    }
  }

  moveLeft(cursors) {
    if(!this.movingLeft) {
      this.scene.tweens.add({
        targets: this,
        x: '-= 16',
        duration: 200,
        onStart(tween, targets) {
          const player = targets[0]
          player.movingLeft = true
          player.flipX = true
          player.anims.play('m_run', true)

          if(cursors)
            player.multiplayer.playerMoveLeft(player.userId)
        },
        onComplete(tween, targets) {
          const player = targets[0]
          player.movingLeft = false
          if(!cursors) {
            console.log(player)
            player.anims.play('m_idle', true)
          }
          else if(!cursors.left.isDown && !cursors.right.isDown)
            console.log(player)
            player.anims.play('m_idle', true)
        }
      })
    }
  }
}