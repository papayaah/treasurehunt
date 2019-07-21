import Multiplayer from './multiplayer'
import Player from './player'
import MessageLog from './messagelog'

export default class extends Phaser.Scene {
  constructor() {
    super('MainScene')

    this.cursors
    this.other
    this.worldLayer
    this.multiplayer
    this.players
    this.messageLog
    this.player
  }

  preload() {
    this.load.image("tiles", "src/assets/tileset.png")
    this.load.multiatlas('atlas', 'src/assets/atlas.json', 'src/assets')
    this.load.tilemapTiledJSON("map", "src/assets/tilemap.json")
    this.load.bitmapFont('CelticTime12', 'src/assets/fonts/CelticTime12.png', 'src/assets/fonts/CelticTime12.xml')
  }

  create() {
    this.players = this.add.group()
    game.emitter = new Phaser.Events.EventEmitter()

    this.cursors = this.input.keyboard.createCursorKeys()
    this.multiplayer = new Multiplayer(this.players, this.cursors)

    this.messageLog = new MessageLog(this)
    game.emitter.on('connected', (session) => {
      this.messageLog.addMessage(`Connected ${session.username}`)
      this.player.userId = session.user_id
    })

    game.emitter.on('createMatch', params => {
      this.messageLog.addMessage(`Created match: ${params.match_id}`)
      this.multiplayer.initListeners()
    })
    game.emitter.on('joinMatch', params => {
      params.presences.forEach(presence => {
        let other = new Player(this, 240, 48, this.multiplayer)
        other.userId = presence.user_id
        this.players.add(other)

        //this.physics.add.collider(other, this.worldLayer)
      })
      this.messageLog.addMessage(`Joined match: ${params.match_id}`)
      this.multiplayer.initListeners(params)
    })
    game.emitter.on('alreadyInMatch', params => this.messageLog.addMessage(`Already in match: ${params.match_id}`))
    game.emitter.on('joins', params => {
      if(this.player.userId == params.updatedPlayer.user_id) {}
      if(this.player.userId != params.updatedPlayer.user_id) {
        this.messageLog.addMessage(`${params.updatedPlayer.username} has joined`)
        let other = new Player(this, 240, 48, this.multiplayer)
        other.userId = params.updatedPlayer.user_id
        this.players.add(other)
        //console.log('new player count:', this.players.length, other.scene)
        //this.physics.add.collider(other, this.worldLayer)
      }
    })
    game.emitter.on('leaves', params => {
      this.messageLog.addMessage(`${params.updatedPlayer.username} has left`)
      this.removePlayer(params.updatedPlayer)
      // let player = this.players.find(player => player.userId == params.updatedPlayer.user_id)
      // player.destroy()

      // this.players = this.players.filter(player => player.userId != params.updatedPlayer.user_id)
      // console.log('new player count:', this.players.length, player)
    })

    const map = this.make.tilemap({ key: "map" })
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage('tileset', 'tiles')

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createStaticLayer("Background", tileset, 0, 0)
    this.worldLayer = map.createDynamicLayer("Blocks", tileset, 0, 0)

    this.worldLayer.setCollisionByProperty({ collides: true })
    const debugGraphics = this.add.graphics().setAlpha(0.75)
    // worldLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // })

    this.player = new Player(this, 240, 48, this.multiplayer)
    this.players.add(this.player)
    guiLevel.add(this.player, 'x', 0, 320).name('Player X').listen()
    guiLevel.add(this.player.body.velocity, 'y', 0, 240).name('Player Y').listen()
    this.physics.add.collider(this.players, this.worldLayer)
    //this.physics.add.collider(this.players, worldLayer)
  }

  update() {
    if(this.player.moving())
      return

    const worldLayer = this.worldLayer
    const cursors = this.cursors

    if (cursors.left.isDown) {
      let tile = worldLayer.getTileAtWorldXY(this.player.x - 1, this.player.y)
      if(tile) {
        return worldLayer.removeTileAt(tile.x, tile.y)
      }
      this.player.moveLeft(cursors)
    } else if (cursors.right.isDown) {
      let tile = worldLayer.getTileAtWorldXY(this.player.x + 16, this.player.y)
      if(tile) {
        return worldLayer.removeTileAt(tile.x, tile.y)
      }
      this.player.moveRight(cursors)
    } else if(cursors.down.isDown) {
      let tile = worldLayer.getTileAtWorldXY(this.player.x, this.player.y + 16)
      if(tile) {
        worldLayer.removeTileAt(tile.x, tile.y)
      }
    }
  }

  removePlayer(playerToRemove) {
    this.players.children.each(player => {
      if(player.userId == playerToRemove.user_id) {
        this.players.remove(player, true, true)
      }
    })
  }
}