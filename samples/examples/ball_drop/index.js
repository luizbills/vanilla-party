let host
let shared

litecanvas({
  width: 400,
  autoscale: false,
})

function init() {
  use(pluginVanillaParty, {
    appName: "ball_drop",
  })

  partyLoadShared("shared", {}, (data) => {
    shared = data
    // set initial values
    if (partyIsHost()) {
      shared.click = {
        x: W * 0.5,
        y: H * 0.5,
      }
    }
  })

  partyLoadShared("host", {}, (data) => {
    host = data
    // set initial values
    if (partyIsHost()) {
      host.ball = {
        x: W * 0.5,
        y: 0,
        dX: 0,
        dY: 0,
      }
    }
  })
}

function tapped(x, y) {
  if (!ready()) return
  // write shared data
  shared.click.x = x
  shared.click.y = y
}

function draw() {
  cls(0)

  textfont("Courier New")
  textsize(20)

  if (!ready()) {
    return text(10, 30, "Connecting...")
  }

  if (partyIsHost()) {
    text(10, 30, "Hosting!")
  }

  // read shared data
  if (partyIsHost()) {
    // apply momentum
    host.ball.x += host.ball.dX
    host.ball.y += host.ball.dY

    // apply gravity
    host.ball.dY += 0.6

    // respawn
    if (host.ball.y > H + 50) {
      host.ball = {
        x: W * 0.5,
        y: -50,
        dX: 0,
        dY: 0,
      }
    }

    // handle collisions
    if (
      utils.dist(host.ball.x, host.ball.y, shared.click.x, shared.click.y) < 40
    ) {
      // move out of penetration
      const collision_vector = utils.vec(
        host.ball.x - shared.click.x,
        host.ball.y - shared.click.y
      )
      utils.vecNorm(collision_vector)
      host.ball.x = shared.click.x + collision_vector.x * 40
      host.ball.y = shared.click.y + collision_vector.y * 40

      // bounce
      const velocityVector = utils.vec(host.ball.dX, host.ball.dY)
      utils.vecReflect(velocityVector, collision_vector)
      utils.vecMult(velocityVector, 0.5)
      host.ball.dX = velocityVector.x
      host.ball.dY = velocityVector.y
    }
  }

  // draw
  ovalfill(host.ball.x, host.ball.y, 40, 40, 3)
  ovalfill(shared.click.x, shared.click.y, 40, 40, 6)
}

function ready() {
  return host && shared
}

function ovalfill(x, y, radiusX, radiusY, color) {
  const _ctx = ctx()
  _ctx.beginPath()
  _ctx.ellipse(~~x, ~~y, ~~radiusX, radiusY, 0, 0, TWO_PI)
  fill(color)
}
