import { JSONObject, UserData } from "./validate"
import { SubscriptionCallback } from "@deepstream/client/dist/src/record/record"

import { version } from "../version"
import * as log from "./log"
import { Room } from "./Room"
import { Record } from "./Record"

log.styled("font-weight: bold", `Vanilla Party v${version}`)

let room: Room | null = null

/// partyConnect
export const partyConnect = (
  host: string,
  appName: string,
  roomName = "main",
  cb?: () => void
) => {
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

    // finish up
    log.log("partyConnect() done!")
    cb?.()
  }
  void load()
}

/// partyDisconnect
export const partyDisconnect = () => {
  if (!room) {
    log.error("partyDisconnect() called before partyConnect()")
    return
  }
  room.disconnect()
}

/// partyLoadShared
export const partyLoadShared = (
  name: string,
  initObject?: UserData,
  cb?: (shared: JSONObject) => void
): JSONObject | undefined => {
  if (!room) {
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
export const partyLoadMyShared = (
  initObject = {},
  cb?: (shared: JSONObject) => void
) => {
  if (!room) {
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
export const partyLoadGuestShareds = () => {
  if (!room) {
    log.error("partyLoadGuestShareds() called before partyConnect()")
    return undefined
  }
  return room.guestShareds
}

export const partyLoadParticipantShareds = function () {
  log.warn(
    "partyLoadParticipantShareds is deprecated. Use partyLoadGuestShareds instead."
  )
  if (!room) {
    log.error("partyLoadParticipantShareds() called before partyConnect()")
    return undefined
  }
  return room.guestShareds
}

/// partyIsHost
export const partyIsHost = (): boolean => {
  if (!room) {
    log.error("partyIsHost() called before partyConnect()")
    return false
  }
  return room.isHost()
}

/// partySetShared
export const partySetShared = (
  shared: JSONObject,
  object: JSONObject
): void => {
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
export const partyWatchShared = (
  shared: JSONObject,
  a: any,
  b: any,
  c: any
): void => {
  if (!Record.recordForShared(shared)) {
    log.warn(
      "partyWatchShared() expected shared (argument 1) to be shared object.",
      shared
    )
    return
  }
  Record.recordForShared(shared)?.watchShared(a, b, c)
}

/// partySubscribe
export const partySubscribe = (
  event: string,
  cb: SubscriptionCallback
): void => {
  if (!room) {
    log.error("partySubscribe() called before partyConnect()")
    return
  }
  room.subscribe(event, cb)
}

/// partyUnsubscribe
export const partyUnsubscribe = (
  event: string,
  cb?: SubscriptionCallback
): void => {
  if (!room) {
    log.error("partyUnsubscribe() called before partyConnect()")
    return
  }
  room.unsubscribe(event, cb)
}

/// partyEmit
export const partyEmit = (event: string, data?: UserData): void => {
  if (!room) {
    log.error("partyEmit() called before partyConnect()")
    return
  }
  room.emit(event, data)
}

/// partyGetRoom
export const partyGetRoom = () => {
  if (!room) {
    log.error("partyGetRoom() called before partyConnect()")
  }
  return room
}

export { Room as PartyRoom, Record as PartyRecord }
