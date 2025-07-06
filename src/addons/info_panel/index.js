import { signal, component } from "reefjs"
import * as log from "../../log"
import infoCss from "./info.css"
import { partyGetRoom } from "../../core"

let infoDiv
let refreshId
let infoComponent
let eventsReady = false
let isInfoShown = false

// show/hide the Info Panel with F1 key
document.addEventListener(
  "keyup",
  (e) => {
    if (e.key === "F1") {
      partyToggleInfo()
    }
  },
  false
)

/// partyToggleInfo
/**
 * @param {boolean} show
 */
export function partyToggleInfo(show) {
  const room = partyGetRoom()

  if (!room) {
    log.error("partyToggleInfo() called before partyConnect()")
    return
  }

  isInfoShown = show ?? !isInfoShown

  if (isInfoShown) {
    createInfo(room)
  } else {
    destroyInfo()
  }
}

async function createInfo(room) {
  await room.whenConnected

  if (infoDiv) return

  // create info panel div
  infoDiv = document.createElement("div")
  infoDiv.className = "vanillaparty_info"
  document.body.append(infoDiv)

  // setup UI with reef
  const data = signal({
    ...room.info(),
  })

  function template() {
    const { appName, roomName, guestNames, isHost, isConnected } = data

    if (isConnected) {
      return `
        <style>${infoCss}</style>
        <div>${appName}</div>
        <div>${roomName}</div>
        <div>guests: ${guestNames.length}</div>
        <div>${isHost ? "hosting" : ""}</div>
        <button data-party="reload-others">reload others</button>
        <button data-party="disconnect-others">disconnect others</button>
        <a href="https://www.notion.so/justinbakse/The-Info-Panel-193b1bb21cec80aaafd8f341f044b3fc">?</a>`
    } else {
      return `
        <style>${infoCss}</style>
        <div class="error">disconnected</div>`
    }
  }

  infoComponent = component(infoDiv, template)

  if (!eventsReady) {
    eventsReady = true

    document.addEventListener("click", (event) => {
      let action = event.target.getAttribute("data-party")

      if (!action) return
      const sender = room.info().guestName
      if (action === "reload-others") {
        room.emit("party:reload-others", { sender })
      }
      if (action === "disconnect-others") {
        room.emit("party:disconnect-others", { sender })
      }
    })

    // install party events
    room.subscribe("party:reload-others", (data) => {
      if (!room) return
      if (data.sender !== room.info().guestName) {
        log.warn('Received "reload-others" event. Reloading...')
        window.location.reload()
      }
    })

    room.subscribe("party:disconnect-others", (data) => {
      if (!room) return
      if (data.sender != room.info().guestName) {
        log.warn('Received "disconnect-others" event. Disconnecting...')
        room.disconnect()
        createInfo(room)
      }
    })
  }

  // update UI
  refreshId = window.setInterval(() => {
    Object.assign(data, room.info())
  }, 100)
}

function destroyInfo() {
  if (infoDiv) {
    infoDiv.remove()
    infoDiv = null
  }
  if (infoComponent) infoComponent.stop()

  clearInterval(refreshId)
}
