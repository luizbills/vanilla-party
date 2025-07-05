let shared
let ping = false

function setup() {
  // const url = "ws://0.0.0.0:6020"
  const url = "wss://vanilla-party.luizbills.com"

  partyConnect(url, "test_ping", "main")

  partyTrackPing((value) => {
    ping = value
  })

  createCanvas(400, 400)
  noStroke()
  partyToggleInfo(true)
}

function draw() {
  background("white")

  textSize(20)
  text(
    "PING: " +
      (ping !== false ? `${ping} ms (${(ping / 1000).toFixed(2)} s)` : "..."),
    50,
    50
  )
}

/**
 * @param {(ping: number, oldPing: number) => void} cb
 * @param {number} interval
 */
async function partyTrackPing(cb, interval = 1000) {
  const room = partyGetRoom()
  if (!room) {
    console.error("partyTrackPing() called before partyConnect()")
    return
  }

  await room.whenConnected

  const id = Math.random()

  let currentPing = 0

  const onPing = function (data) {
    if (partyIsHost()) {
      partyEmit("pong", data)
    }
  }

  const onPong = function (data) {
    if (data.sender === id) {
      setTimeout(emitPing, interval)
      const prev = currentPing
      currentPing = Math.round(performance.now() - data.time)
      cb(currentPing, prev)
    }
  }

  const emitPing = function () {
    partyEmit("ping", {
      sender: id,
      time: performance.now(),
    })
  }

  partySubscribe("ping", onPing)
  partySubscribe("pong", onPong)

  setTimeout(emitPing, 1000)
}
