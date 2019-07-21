export default class  {
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

