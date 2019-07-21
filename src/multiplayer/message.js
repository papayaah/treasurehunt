chimport * as nakamajs from '../../nakama-js.umd'

export default class {
  constructor(client, socket, matchId) {
    this.client = client
    this.socket = socket
    this.matchId = matchId

    this.socket.onmatchdata = (data) => {
      let content = data.data
      // console.log('opcode', data.op_code)
      switch (data.op_code) {
        case 100:
          game.eventDispatcher.dispatch('updateOtherPlayer', { data: data.data })
          break;
        case 101:
          //console.log("A custom opcode.")
          game.eventDispatcher.dispatch('updateGender', { data: data.data })
          break;
        case 102:
          game.eventDispatcher.dispatch('otherPlayerRevive',{data: data.data})
        default: {
          //console.log("User handle %o data %o", data.presence, content)
          game.eventDispatcher.dispatch('data', { senderHandle: data.presence.handle, opCode: data.opCode, data: content })
        }
      }
    }
  }

  sendData(opCode, data = {}) {
    //console.log('sendData match id:', this.matchId)
    // let opCode = opCode

    this.socket.send({ match_data_send: { match_id: this.matchId, op_code: opCode, data: data } })
    .then(() => {
      //console.log("Successfully sent data message.")
    }).catch(error => {
      //console.log("MatchDataSendRequest error occured: %o", error)
    })

    // let message = new nakamajs.MatchDataSendRequest()
    // message.matchId = this.matchId
    // message.opCode = opCode
    // message.data = data
    // //message.presences = presences;
    // //console.log('sending message', message)
    // this.client.send(message).then(() => {
    //   console.log("Successfully sent data message.")
    // }).catch(error => {
    //   console.log("MatchDataSendRequest error occured: %o", error)
    // })
  }
}
