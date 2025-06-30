let shared

function setup() {
  partyConnect("wss://demoserver.p5party.org", "hello_party")
  partyLoadShared("shared", { x: 100, y: 100 }, (data) => {
    shared = data
  })

  createCanvas(400, 400)
  noStroke()
  partyToggleInfo(true)
}

function mousePressed() {
  // wait the connection
  if (!shared) return

  // write shared data
  shared.x = mouseX
  shared.y = mouseY
}

function draw() {
  background("white")

  // wait the connection
  if (!shared) {
    textSize(20)
    text("connecting...", 50, 50)
    return
  }

  fill("#000066")

  // read shared data
  ellipse(shared.x, shared.y, 100, 100)
}
