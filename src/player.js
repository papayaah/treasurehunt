export default class extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'atlas', 'elf_m_hit_anim_f0.png')
      .setOrigin(0, 0.5)

    scene.add.existing(this)
    scene.physics.world.enable(this)

    this.scene = scene
    this.createAnimation('f_idle', 'elf_f_idle_anim_f', 0, 3)
    this.createAnimation('m_idle', 'elf_m_idle_anim_f', 0, 3)
    this.createAnimation('m_run', 'elf_m_run_anim_f', 0, 3)
    this.anims.play('m_run')
  }

  createAnimation(key, prefix, start, end) {
    const frameNames = this.scene.anims.generateFrameNames('atlas', {
      start: start, end: end, zeroPad: 0,
      prefix: prefix, suffix: '.png'
    })
    this.scene.anims.create({ key: key, frames: frameNames, frameRate: 10, repeat: -1 })
  }
}