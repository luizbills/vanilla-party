const defaults = {
  host: "wss://demoserver.p5party.org",
  appName: "",
  room: "main",
}

window.pluginVanillaParty = (engine, config) => {
  config = Object.assign({}, defaults, config)

  if (!config.appName) {
    throw 'Missing "appName" in pluginVanillaParty'
  }

  partyConnect(config.host, config.app, config.room, () => {
    engine.emit("party-connected")
  })
}
