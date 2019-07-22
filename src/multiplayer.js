const nakama = require('@heroiclabs/nakama-js')
import Session from './multiplayer/session'
import Player from './player'
import { Game } from 'phaser';

const OP_CODES = {
  MOVE_LEFT: 1,
  MOVE_RIGHT: 2,
  PLAYERS: 3,
  STATE: 4,
  REMOVE_TILE: 5
}

export default class {
  constructor(players, cursors) {
    // if(SINGLE_PLAYER) return

    //this.client = new nakama.Client('defaultkey', '127.0.0.1', 7350)
    this.client = new nakama.Client('defaultkey', 'nakama.programmingmind.net', 80)
    this.session = new Session(this.client, 'treasurehunt')
    this.players = players
    this.cursors = cursors
    this.worldLayer
    this.removedTiles = []
  }

  initListeners(params) {
    this.socket = this.session.socket
    this.match = this.session.match
    // console.log('initListeners', params, this.match.matchId, this.socket)
    if(params) this.match.matchId = params.match_id
    this.socket.onmatchdata = (result) => {
      let data = result.data
      const player = this.players.getChildren().find(player => player.userId == result.data.userId)
      //console.log(player)
      switch (result.op_code) {
        case OP_CODES.MOVE_RIGHT:
          player.moveQueue.push({action: 'moveRight'})
        break
        case OP_CODES.MOVE_LEFT:
          player.moveQueue.push({action: 'moveLeft'})
        break;
        case OP_CODES.STATE:
          data.players.forEach(player => {
            if(player.userId != this.session.userId) {
              let other = new Player(game.scene.scenes[0], player.x, player.y, this)
              other.userId = player.userId
              this.players.add(other)
            }
          })
          this.removedTiles = data.removedTiles
          data.removedTiles.forEach(tile => {
            this.worldLayer.removeTileAt(tile.x, tile.y)
          })
          break;
        case OP_CODES.REMOVE_TILE:
          this.removedTiles.push({x: data.x, y: data.y})
          this.worldLayer.removeTileAt(data.x, data.y)
          break;
        default: {
        }
      }
    }
  }

  playerMoveLeft(userId) {
    this.match.send(OP_CODES.MOVE_LEFT, { userId: userId })
  }

  playerMoveRight(userId) {
    this.match.send(OP_CODES.MOVE_RIGHT, { userId: userId })
  }

  sendState() {
    let data = { players: [], removedTiles: this.removedTiles }
    console.log('sendState removedTiles.length', this.removedTiles.length)
    this.players.children.each(player => {
      data.players.push({
        userId: player.userId,
        x: player.x,
        y: player.y
      })
    })
    this.match.send(OP_CODES.STATE, data)
  }

  removeTile(x, y) {
    this.removedTiles.push({x: x, y: y})
    this.match.send(OP_CODES.REMOVE_TILE, { x: x, y: y })
  }
}