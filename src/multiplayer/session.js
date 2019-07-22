const nakama = require('@heroiclabs/nakama-js')
import Match from './match'

export default class {
  constructor(client, idPrefix) {
    this.client = client
    this.idPrefix = idPrefix
    this.tokenName = `${this.idPrefix}-token`
    let url = new URL(window.location.href)
    this.matchId = url.searchParams.get('match') || null

    let self = this
    let sessionHandler = (session) => {
      // console.info("session connected id:", session.user_id, "username:", session.username);
      // console.info("Session expired?", session.isexpired(Date.now() / 1000));
      this.userId = session.user_id
      this.username = session.username
      let verbose = false
      let useSSL = false
      this.socket = client.createSocket(useSSL, verbose)
      this.socket.connect(session).then(session => {
        this.match = new Match(client, this.socket, session, idPrefix)
        game.emitter.emit('connected', session)
        this.match.findExistingMatch(existingMatchId => {
          if(!existingMatchId) {
            this.match.createMatch(match => {
              this.matchId = match.match_id
              game.emitter.emit('createMatch', match)
            })
          } else {
            this.match.joinMatch(existingMatchId, match => {
              this.matchId = match.match_id
              if(existingMatchId == match.match_id) {
                if(self.playerInMatch(match)) {
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

        this.username = session.username
        // Store session for quick reconnects.
        localStorage.setItem(this.tokenName, session.token)

      }).catch(error => {
        console.log("An error occured during session connection: %o", error)
        game.emitter.emit('errorConnection')
      })
    }

    let errorHandler = function(error) {
      console.log("General error occured: %o", error)
      game.emitter.dispatch('errorConnection')
    }

    /* player sessions */
    let restoreSessionAndConnect = () => {
      let sessionString = localStorage.getItem(this.tokenName)

      // Lets check if we can restore a cached session.
      if(!sessionString || sessionString == "") {
        return
      }

      let session = nakama.Session.restore(sessionString)
      var currentTimeInSec = new Date() / 1000
      if (session.isexpired(currentTimeInSec)) {
        console.log('session expired')
        return
      }

      sessionHandler(session)
      return true
    }

    //var message = nakama.AuthenticateRequest.email("hello@world.com", "password");
    if(!restoreSessionAndConnect()) {
      const customId = this.dropinId()

      this.client.authenticateCustom({ id: customId, create: true, username: this.guestName() })
      .then(sessionHandler).catch(errorHandler)
    }
  }

  playerInMatch(match) {
    return match.presences.find(obj => obj.user_id == match.self.user_id)
  }
  // drop-in id generator
  dropinId() {
    return `${this.idPrefix}-` + (+new Date).toString(36)
  }
  guestName() {
    return `guest${Math.floor(Math.random()*9000) + 1000}`
  }
  startMatch(){
    this.match.createOrJoinMatch()
  }
}
