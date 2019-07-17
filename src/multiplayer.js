const nakama = require('@heroiclabs/nakama-js')
import Session from './multiplayer/session'

export default class {
  constructor() {
    // if(SINGLE_PLAYER) return

    this.client = new nakama.Client("defaultkey", '127.0.0.1', 7350)
    this.session = new Session(this.client, 'treasurehunt')
  }
}