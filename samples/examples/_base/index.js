litecanvas({
  width: 480,
  autoscale: false,
})

const DEFAULT_STATE = {
  x: W / 2,
  y: H / 2,
}
let shared

function init() {
  use(pluginVanillaParty, {
    appName: "hello_party",
  })

  partyLoadShared("shared", DEFAULT_STATE, (data) => {
    shared = data
  })
}

function tapped(x, y) {
  if (!shared) return
  // write shared data
  shared.x = x
  shared.y = y
}

function draw() {
  cls("0")
  if (!shared) {
    text(10, 10, "Connecting...")
    return
  }
  circfill(shared.x, shared.y, 48, 4)
}
