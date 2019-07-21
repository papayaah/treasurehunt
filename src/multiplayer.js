const nakama = require('@heroiclabs/nakama-js')
import Session from './multiplayer/session'

const OP_CODES = {
  MOVE_LEFT: 1,
  MOVE_RIGHT: 2
}

export default class {
  constructor(players, cursors) {
    // if(SINGLE_PLAYER) return

    this.client = new nakama.Client('defaultkey', '127.0.0.1', 7350)
    this.session = new Session(this.client, 'treasurehunt')
    this.players = players
    this.cursors = cursors
  }

  initListeners(params) {
    this.socket = this.session.socket
    this.match = this.session.match
    // console.log('initListeners', params, this.match.matchId, this.socket)
    if(params) this.match.matchId = params.match_id
    this.socket.onmatchdata = (result) => {
      // console.log('opcode', result, this.players)
      let content = result.data
      const player = this.players.getChildren().find(player => player.userId == result.data.userId)
      console.log(player)
      switch (result.op_code) {
        case OP_CODES.MOVE_RIGHT:
          player.moveRight(this.cursors)
        break
        case OP_CODES.MOVE_LEFT:
          player.moveLeft(this.cursors)
        break;
        default: {
        }
      }
    }
  }

  playerMoveLeft(userId) {
    this.match.send(OP_CODES.MOVE_LEFT, userId)
  }

  playerMoveRight(userId) {
    this.match.send(OP_CODES.MOVE_RIGHT, userId)
  }
}