import { signal, component } from "reefjs"
import * as log from "./log"
import infoCss from "./info.css"

let infoDiv
let refreshId
let infoComponent

export async function createInfo(room) {
  await room.whenConnected

  if (infoDiv) return

  // create info panel div
  infoDiv = document.createElement("div")
  infoDiv.className = "vanillaparty_info"
  document.body.append(infoDiv)

  // setup UI with reef
  const data = signal({
    auto: sessionStorage.getItem("auto") === "true",
    ...room.info(),
  })

  function template() {
    // experimental auto reload
    const { auto } = data
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

        <a href="https://www.notion.so/justinbakse/The-Info-Panel-193b1bb21cec80aaafd8f341f044b3fc">?</a>
        `
    } else {
      return `
        <style>${infoCss}</style>
        <div class="error">disconnected</div>
        `
    }
  }

  infoComponent = component(infoDiv, template)

  document.addEventListener("click", (event) => {
    let action = event.target.getAttribute("data-party")

    if (!action) return
    if (action === "reload-others") {
      log.log("reload-others")
      room.emit("partyEvent", {
        action: "reload-others",
        sender: room.info().guestName,
      })
    }
    if (action === "disconnect-others") {
      log.log("disconnect-others")
      room.emit("partyEvent", {
        action: "disconnect-others",
        sender: room.info().guestName,
      })
    }
  })

  // update UI
  refreshId = setInterval(() => {
    Object.assign(data, room.info())
  }, 100)
}

export function destroyInfo() {
  if (infoDiv) {
    infoDiv.remove()
    infoDiv = null
  }
  if (infoComponent) infoComponent.stop()

  clearInterval(refreshId)
}
