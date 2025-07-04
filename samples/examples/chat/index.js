const $ = (s, p = document) => p.querySelector(s)
const $$ = (s) => document.querySelectorAll(s)
const on = (el, ev, cb) => el.addEventListener(ev, cb)
const html = (content) => {
  const div = document.createElement("div")
  div.innerHTML = content
  return div
}
const escHtml = (html) => new Option(html).innerHTML

// UI
const body = document.body
const form = $("form")
const textInput = $("input", form)
const messages = $("#messages")
const connectionStatus = $("#status")

// my shared data
let me = {}

// server info
const serverUrl = "wss://vanilla-party.luizbills.com/"
const appName = "chat"
const room = "main"

// connect
partyConnect(serverUrl, appName, room, (data) => {
  // get your shared data
  partyLoadMyShared({}, (data) => {
    me = data

    // ask your nickname
    const u = "user" + Math.floor(Math.random() * 1000)
    while (!me.username) {
      const name = prompt("Type your username:", u)?.trim()
      if (!name || name.length > 16) {
        alert("Error: invalid username. Please try again.")
        continue
      }
      me.username = name
    }

    // send your presence
    partyEmit("presence", {
      sender: me.username,
    })

    // enable the inputs
    $$("form [disabled]").forEach((el) => {
      el.disabled = false
    })

    // update status
    connectionStatus.textContent = `Welcone ${me.username}! You are connected now.`
    connectionStatus.style.color = "darkgreen"

    // remove status after 3 seconds
    setTimeout(() => {
      connectionStatus.remove()
    }, 3000)
  })

  // handle presence events
  partySubscribe("presence", (data) => {
    messages.append(
      html(
        `<em>The ${escHtml(data.sender)} connected to the room...
        Currently the chat has ${partyCountGuests()} connected users.</em>`
      )
    )
  })

  // handle received messages
  partySubscribe("message", (data) => {
    messages.append(
      html(
        `<strong>escHtml${escHtml(data.sender)}</strong>:
        ${escHtml(data.text)}`
      )
    )
  })

  // handle message sending
  on(form, "submit", (ev) => {
    ev.preventDefault()

    if (!me.username) return

    const text = textInput.value

    // don't accept empty messages
    if (!text) return

    // send the message to other users
    partyEmit("message", {
      sender: me.username,
      text: text,
    })

    // reset the input
    textInput.value = ""

    // scroll the messages
    messages.scrollTop = messages.scrollHeight
  })
})
