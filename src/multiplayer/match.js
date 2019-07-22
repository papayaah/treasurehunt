const nakama = require('@heroiclabs/nakama-js')

export default class {
  constructor(client, socket, session, idPrefix) {
    this.client = client
    this.socket = socket
    this.session = session
    this.connectedOpponents = []
    this.matchId = null
    this.idPrefix = idPrefix

    let self = this
    socket.onmatchpresence = function(presences) {
      // Remove all users who left.
      if(presences.leaves) {
        self.connectedOpponents = self.connectedOpponents.filter(function(co) {
          var stillConnectedOpponent = true;
          presences.leaves.forEach(function(leftOpponent) {
              // removePlayer(leftOpponent.userId);
            if (leftOpponent.user_id == co.user_id) {
              stillConnectedOpponent = false;
            }
          })

          return stillConnectedOpponent;
        })

        game.emitter.emit('leaves', { players: self.connectedOpponents, updatedPlayer: presences.leaves[0] })
      }
      if(presences.joins) {
        // Add all users who joined.
        presences.joins.forEach(function(presence) {
          // spawnPlayer(presence.userId);
        })

        self.connectedOpponents = self.connectedOpponents.concat(presences.joins)

        game.emitter.emit('joins', { players: self.connectedOpponents, updatedPlayer: presences.joins[0] })
      }
    }

    /**
     * Other events that can be handled. Should be handled on per-game instance.
     * */
      socket.ondisconnect = (event) => {
          console.info("Disconnected from the server. Event:", event);
      };
      socket.onnotification = (notification) => {
          console.info("Received notification:", notification);
      };
      socket.onchannelpresence = (presence) => {
          console.info("Received presence update:", presence);
      };
      socket.onchannelmessage = (message) => {
          console.info("Received new chat message:", message);
      };
      socket.onmatchdata = (matchdata) => {
          // console.info("Received match data: %o", matchdata);
      };
      socket.onmatchmakermatched = (matchmakerMatched) => {
          console.info("Received matchmaker update:", matchmakerMatched);
      };
      socket.onstatuspresence = (statusPresence) => {
          console.info("Received status presence update:", statusPresence);
      };
      socket.onstreampresence = (streamPresence) => {
          console.info("Received stream presence update:", streamPresence);
      };
      socket.onstreamdata = (streamdata) => {
          console.info("Received stream data:", streamdata);
      };

  }

  findExistingMatch(callback, cursor = null) {
    this.client.listStorageObjects(this.session, `${this.idPrefix}-matches`, null, 100, cursor)
    .then(res => {
      if(res.cursor && res.objects.length == 100) {
        return this.findExistingMatch(callback, res.cursor)
      }
      let records = res.objects
      let data = records.map(record => record.value)
      let sortedMatches = data.sort(function(a, b) {
        // console.log("Record value '%o'", record.value);
        // console.log("Record permissions read '%o' write '%o'",record.permissionRead, record.permissionWrite);
        if(!a.created || !b.created) return 1;
        if(a.created < b.created) return 1;
        if(a.created > b.created) return -1;
        return 0;
      })

      let foundMatchId = null;
      if(sortedMatches.length > 0) {
        foundMatchId = sortedMatches[0].id
      }
      callback(foundMatchId)
    }).catch(err => {
      console.log(err)
    })
  }

  writeMatch(matchId) {
    let value = { id: matchId, created: (+ new Date())}
    let key = (+ new Date()) + '_' + matchId
    this.client.writeStorageObjects(this.session, [
    {
      "collection": `${this.idPrefix}-matches`,
      "key": key,
      "value": value,
      "permission_read": 2,
      "permission_write": 0
    }
    ])
  }

  joinMatch(matchId, callback) {
    const message = { match_join: {
      match_id: matchId
    }};
    this.socket.send(message)
    .then(res => {
      let match = res.match
      this.connectedOpponents = match.presences.filter(presence=>{
        // Remove your own user from list.
        return presence.user_id != match.self.user_id;
      })
      this.connectedOpponents.forEach(opponent => {
        // spawnPlayer(opponent.userId)
        console.log("Username %o.", opponent.username)
      })
      callback(match)
    }).catch(err => {
      console.log('joinMatch err', err)
      if(err.code == 3) {
        // invalid match token"
      } else if(err.code == 4) {
        // match id not found
        this.createMatch(callback)
      }
    })
  }

  createMatch(callback) {
    this.socket.send({ match_create: {} })
    .then(result => {
      this.matchId = result.match.match_id
      callback(result.match)
      this.writeMatch(this.matchId)
    }).catch(err => {
      console.log("Create match error occured: %o", err);
    })
  }

  createOrJoinMatch() {
    this.findExistingMatch(existingMatchId => {
          if(!existingMatchId) {
            this.createMatch(match => {
              game.emitter.emit('createMatch', match)
            })
          } else {
            this.joinMatch(existingMatchId, match => {
              this.matchId = match.match_id
              if(existingMatchId == match.match_id) {
                if(this.playerInMatch(match)) {
                  game.emitter.emit('alreadyInMatch', match)
                } else {
                  game.emitter.emit('joinMatch', match)
                }
              } else {
                game.emitter.emit('createMatch', match)
              }
            })
          }
        })
  }

  send(opCode, data) {
    this.socket.send({ match_data_send: { match_id: this.matchId, op_code: opCode, data: data } })
      .then(() => {
        // console.log("Successfully sent data message.")
      }).catch(error => {
        console.log("MatchDataSendRequest error occured: %o", error)
      })
  }

  playerInMatch(match) {
    return match.presences.find(obj => obj.user_id == match.self.user_id)
  }
}
