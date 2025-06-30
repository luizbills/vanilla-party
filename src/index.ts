/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// declare let p5: any;

import { JSONObject, UserData } from "./validate"
import { SubscriptionCallback } from "@deepstream/client/dist/src/record/record"

import { version } from "../version"
import * as log from "./log"
import { Room } from "./Room"
import { Record } from "./Record"
import { createInfo, destroyInfo } from "./info"

log.styled("font-weight: bold", `Vanilla Party v${version}`)

let room: Room | null = null

/// partyConnect (preload)

const partyConnect = function (
  host: string,
  appName: string,
  roomName = "main",
  cb?: () => void
) {
  if (room !== null) {
    log.warn("You should call partyConnect() only one time")
    return
  }
  const load = async () => {
    // connect room
    room = new Room(host, appName, roomName)
    await room.whenConnected
    window.addEventListener("beforeunload", () => {
      room?.disconnect()
    })

    // install ctrl-i inspector pane binding
    document.addEventListener(
      "keyup",
      (e) => {
        if (e.altKey && e.key === "F1") {
          partyToggleInfo()
        }
      },
      false
    )

    // install p5PartyEvents
    room.subscribe("p5PartyEvent", (data: JSONObject) => {
      // function handleAction() {
      if (!room) return

      // reload-others
      if (
        data.action === "reload-others" &&
        data.sender != room.info().guestName
      ) {
        log.log("Recieved reload-others p5PartyEvent. Reloading...")
        window.location.reload()
      }

      // disconnect-others
      if (
        data.action === "disconnect-others" &&
        data.sender != room.info().guestName
      ) {
        log.log("Recieved disconnect-others p5PartyEvent. Disconnecting...")
        room.disconnect()
        void createInfo(room)
      }
      // }
      // void handleAction();
    })

    // finish up
    log.log("partyConnect() done!")
    cb?.()
  }
  void load()
}

/// experimental auto reload
/**
      EXPERIMENTAL FEATURE: Auto reloading When developing a sketch that uses
      p5.party, it is usually best to have all connected clients reload when the
      code changes.

      When working in VS Code with Live Server, saving the code auto reloads all
      local browser tabs running the code, which is usually good enough. When
      working with the p5 web editor saving the code will reload the sketch in
      the same tab, but not in other tabs/windows.

      This feature is intended to make working in the p5 web editor (or similar
      environments) easier by reloaded all other connected clients when the
      "primary" client reloads.

      To use this you would open the info panel (ctrl-i) and enable the "auto"
      checkbox. When enabled, reloading the tab will send a message to all other
      connected clients to reload.

      Reloading happens immediately after the "auto" guest connects, making the
      "auto" guest the host before it's setup() is called.
      */

const partyDisconnect = function () {
  if (room === null) {
    log.error("partyDisconnect() called before partyConnect()")
    return
  }
  room.disconnect()
}

/// partyLoadShared (preload)

const partyLoadShared = function (
  name: string,
  initObject?: UserData,
  cb?: (shared: JSONObject) => void
): JSONObject | undefined {
  if (room === null) {
    log.error("partyLoadShared() called before partyConnect()")
    return undefined
  }
  const record = room.getRecord(name)

  const load = async () => {
    await room?.whenConnected // room null checked above

    const overwrite = room?.isHost() === true
    await record.load(initObject, overwrite)
    log.log(`partyLoadShared "${name}" done!`)
    cb?.(record.shared)
  }

  void load()

  return record.shared
}

/// partyLoadMyShared

const partyLoadMyShared = function (
  initObject = {},
  cb?: (shared: JSONObject) => void
) {
  if (room === null) {
    log.error("partyLoadMyShared() called before partyConnect()")
    return undefined
  }

  const record = room.myGuestRecord

  const load = async () => {
    await room?.whenConnected // room null checked above
    await record.whenLoaded
    await record.initData(initObject)
    log.log(`partyLoadMyShared done!`)
    cb?.(record.shared)
  }

  void load()

  return record.shared
}

/// partyLoadGuestShareds

const partyLoadGuestShareds = function () {
  if (room === null) {
    log.error("partyLoadGuestShareds() called before partyConnect()")
    return undefined
  }
  return room.guestShareds
}

const partyLoadParticipantShareds = function () {
  log.warn(
    "partyLoadParticipantShareds is deprecated. Use partyLoadGuestShareds instead."
  )
  if (room === null) {
    log.error("partyLoadParticipantShareds() called before partyConnect()")
    return undefined
  }
  return room.guestShareds
}

/// partyIsHost

const partyIsHost = function (): boolean {
  if (room === null) {
    log.error("partyIsHost() called before partyConnect()")
    return false
  }
  return room.isHost()
}

/// partySetShared

const partySetShared = function (shared: JSONObject, object: JSONObject): void {
  if (!Record.recordForShared(shared)) {
    log.warn(
      "partySetShared() doesn't recognize the provided shared object.",
      shared
    )
    return
  }
  Record.recordForShared(shared)?.setData(object)
}

/// partyWatchShared

const partyWatchShared = function (
  shared: JSONObject,
  a: any,
  b: any,
  c: any
): void {
  if (!Record.recordForShared(shared)) {
    log.warn(
      "partyWatchShared() expected shared (argument 1) to be shared object.",
      shared
    )
    return
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */
  Record.recordForShared(shared)?.watchShared(a, b, c)
}

/// partySubscribe
const partySubscribe = function (
  event: string,
  cb: SubscriptionCallback
): void {
  if (room === null) {
    log.error("partySubscribe() called before partyConnect()")
    return
  }
  room.subscribe(event, cb)
}

/// partyUnsubscribe
const partyUnsubscribe = function (
  event: string,
  cb?: SubscriptionCallback
): void {
  if (room === null) {
    log.error("partyUnsubscribe() called before partyConnect()")
    return
  }
  room.unsubscribe(event, cb)
}

/// partyEmit
const partyEmit = function (event: string, data?: UserData): void {
  if (room === null) {
    log.error("partyEmit() called before partyConnect()")
    return
  }
  room.emit(event, data)
}

let isInfoShown = false
const partyToggleInfo = function (show?: boolean) {
  if (room === null) {
    log.error("partyToggleInfo() called before partyConnect()")
    return
  }

  isInfoShown = show ?? !isInfoShown

  if (isInfoShown) {
    void createInfo(room)
  } else {
    destroyInfo()
  }
}

Object.assign(window, {
  Room,
  Record,
  partyConnect,
  partyDisconnect,
  partyEmit,
  partyIsHost,
  partyLoadGuestShareds,
  partyLoadMyShared,
  partyLoadParticipantShareds,
  partyLoadShared,
  partySetShared,
  partySubscribe,
  partyToggleInfo,
  partyUnsubscribe,
  partyWatchShared,
  partyLog: log,
})
