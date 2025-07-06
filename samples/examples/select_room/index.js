let roomSelect = document.querySelector("#room")
let connectButton = document.querySelector("#connect")
let sketch

connectButton.addEventListener("click", () => {
  if (sketch) {
    sketch.remove()
    partyToggleInfo(false)
    partyDisconnect()
  }
  let room = roomSelect.value
  start(room)
})

function start(room) {
  let shared

  sketch = new p5((p) => {
    p.setup = function () {
      partyConnect("wss://vanilla-party.luizbills.com", "hello_party", room)
      partyLoadShared("shared", { x: 100, y: 100 }, (data) => {
        shared = data
      })

      partyToggleInfo(true)

      p.createCanvas(400, 400)
      p.noStroke()
    }

    p.mousePressed = function () {
      // wait the connection
      if (!shared) return

      // write shared data
      shared.x = p.mouseX
      shared.y = p.mouseY
    }

    p.draw = function () {
      p.background("white")

      // wait the connection
      if (!shared) {
        p.textSize(20)
        p.text("connecting...", 50, 50)
        return
      }

      p.fill("#000066")

      // read shared data
      p.ellipse(shared.x, shared.y, 100, 100)
    }
  })
}
