import Phaser from 'phaser'
import MainScene from './main'
const dat = require('dat.gui')

const gui = new dat.GUI()
window.guiLevel = gui.addFolder('GameState')
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
  scene: MainScene
}


window.game = new Phaser.Game(config)
