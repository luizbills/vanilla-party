<div align="center">

# Vanilla Party 🎉

[![NPM](https://badgen.net/npm/v/vanilla-party?scale=1.25&label=NPM&color=blue&cache=300)](https://npmjs.com/vanilla-party)

</div>

_Vanilla Party_ is a library for easily prototyping online multi-user apps with JavaScript. Quickly test ideas for multiplayer games, realtime multi-user apps, and multi-computer projects.

[Community/Discussions](https://github.com/luizbills/vanilla-party/discussions)

## Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Introduction

### Features

**No Server-Side Code**

With _Vanilla Party_ your projects are written using only client-side JavaScript. Quickly try ideas without writing server code or setting up a back-end stack.

**Real-time Data Sync**

With _Vanilla Party_ you can easily create a shared data object that is automatically synchronized between instances of your project. You can assign and read properties on these objects just like a plain old local javascript object.

**Multiple Apps and Rooms**

A single _Vanilla Party_ server can support many apps and each app can group users into rooms. _Vanilla Party_ keeps track of which clients are in each room and shares the data to the right clients.

**Client-side Hosting**

_Vanilla Party_ automatically designates one (and only one) guest in each room as the host. Your code can easily check if it is the host and take care of running the party.

### What is it good for?

**Prototyping**

_Vanilla Party_ provides a simple, imperative interface for working with shared data inspired by the [p5.party](https://p5party.org/) library. _Vanilla Party_ let's you try ideas quickly without writing server code or setting up a front-end/back-end stack.

**Workshops + Classes**

_Vanilla Party_ uses a [deepstream.io](http://deepstream.io) server which is easy to set up and cheap—or free—to run. Many projects can connect to the same _Vanilla Party_ server, so students can focus on coding instead of setting up servers.

### What is it not good for?

**Production**

_Vanilla Party_ is designed for prototypes. As your project grows, you'll need to look into other libraries and backends that suit your project's needs.

**Security**

Projects built with _Vanilla Party_ are insecure and has no method to authenticate or authorize users. Multiple apps share a server and can read, write, and delete each other's data.

## Installation

The quickest way to get started with _Vanilla Party_ is to load or download from a [CDN](https://unpkg.com/vanilla-party@latest/dist/vanilla-party.js).

Or install via NPM using **`npm install vanilla-party`**.

## Getting Started

```html
<script src="https://unpkg.com/vanilla-party@latest/dist/vanilla-party.js"></script>
```

```javascript
window.addEventListener("load", () => {
  let shared = null
  let div = null

  // server url
  const serverUrl = "wss://vanilla-party.luizbills.com/"

  // your app name (tip: avoid generic names)
  const appName = "my-party-app"

  // the room where users will join
  const room = "main"

  // connect to server
  partyConnect(serverUrl, appName, room)

  // load a shared data object
  partyLoadShared("shared", { x: 0, y: 0 }, (data) => {
    shared = data
    onSharedDataReady()
  })

  // create a div element
  div = document.createElement("div")
  document.body.append(div)
  div.textContent = `connecting...`

  function onSharedDataReady() {
    const size = 64

    div.textContent = ""
    div.style.cssText = `width:${size}px;height:${size}px;background:red;border-radius:100%;position:absolute;`

    window.addEventListener("click", (ev) => {
      // listen clicks and taps and
      // write shared data
      shared.x = ev.clientX - size / 2
      shared.y = ev.clientY - size / 2
    })

    function update() {
      // read shared data
      div.style.left = `${shared.x}px`
      div.style.top = `${shared.y}px`
    }

    // call update() 30 times per second
    setInterval(update, 1000 / 30)
  }
})
```

[Live Demo](https://jsbin.com/sumohuxovi/edit?output) (Try in two browser windows at once)

> Note: This example is using only javascript and HTML to illustrate how easy it is to get started with Vanilla Party. In our [examples](samples), we'll use P5.js for user interaction and rendering.

## API Documentation

### `partyConnect(host, appName, roomId?, callback?)`

Connects the local user to a _Vanilla Party_ server.

#### Parameters

**host: `string`**

The server to connect to. You can host your own server or use my demo server: `wss://vanilla-party.luizbills.com`

**appName: `string`**

A unique string identifying your app, e.g. `luizbills-pong`

**roomName: `string`** (optional)

A string to namespace users and events within a app. Default: `"main"`

**callback: `() => void`** (optional)

A function to be called when the connection is ready.

#### Returns

Nothing.

### `partyDisconnect()`

Immediately disconnects the local user. The user’s shared object will be removed from other guests arrays. The disconnect user will have continue to have access to shared objects, including the guest array, but they will no longer sync.

#### Parameters

None.

#### Returns

Nothing.

### `partyLoadShared(name, initObject?, callback?)`

Loads or creates a “shared object” with the given name in the current room.

#### Parameters

**name: `string`**

The name of the shared object on the server.

**initObject: `UserData`** (optional)

Data to initialize the shared object with, eg. `{x: 0, y: 0}`.

The shared object is initialized with the values in the data object ONLY if the room is empty when the user connects. If the room already has connected users, then the data object argument will be ignored and loaded from the server.

**callback: `(data: JSONObject) => void`** (optional)

A function to be called when the shared object is ready (fully loaded from the server).

#### Returns

Returns an empty object `{}` which will be populated with the synced properties as soon as they are loaded from the server. The property values of the shared object are synchronized between connected users in the room.

### `partyLoadMyShared(initObject?, callback?)`

Returns the local user’s shared data object.

#### Parameters

**initObject: `UserData`** (optional)

The data to initialize the shared object with, eg. `{favoriteColor: "purple"}`.

**callback: `(data: JSONObject) => void`** (optional)

A function to be called when the shared object is ready (fully loaded from the server).

#### Returns

The local user's shared object.

### `partySetShared(sharedObject, data)`

Replaces the current properties of a shared object with the values given in `data`.

The data is overwritten, not merged. All the existing properties on `sharedObject` will be removed and the properties in `data` will replace them.

You can use this function to set **all** the properties of a shared object **at once**:

```js
partySetShared(shared, { x: 10, y: 10, z: 10 })
```

You can use this function to quickly clear or reset a shared object:

```js
partySetShared(shared, {})
```

#### Parameters

**sharedObject: `JSONObject`**

A shared object.

**data: `JSONObject`**

data to write in `sharedObject`.

#### Returns

Nothing.

### `partyLoadGuestShareds()`

_Vanilla Party_ maintains a shared object for each user in the room. `partyLoadGuestShareds()` returns a dynamic array of these shared objects that is kept up to date as users join and leave the room. But if an user’s shared object is empty (it has no properties) it will NOT be included in that dynamic array.

#### Parameters

None.

#### Returns

The dynamically updated array of shared objects.

### `partyWatchShared(shared, [path], callback, triggerNow?)`

Watches a `shared` object and calls the callback when any of its properties change. But you can optionally provide a path on the object to watch.

#### Parameters

**shared: `JSONObject`**

The shared object to watch.

**path: `string`** (optional)

A path on the shared object to watch, e.g. `"position.x"`

**callback: `(data) => void`**

A function to call when `shared` is updated. With `path`, `data` will be the new value of the updated property. Without `path`, `data` will be the `shared`.

**triggerNow: `boolean`** (optional)

Should the callback fire immediately? Default: `false`

#### Returns

Nothing.

#### Examples

Watch for any changes on `shared`.

```js
let shared = partyLoadShared("shared")

partyWatchShared(shared, function (sharedUpdated) {
  console.log("received new data on shared:", sharedUpdated)
})
```

Watch for changes to property `x` on `shared`.

```js
let shared = partyLoadShared("shared", { x: 0 })

partyWatchShared(shared, "x", function (x) {
  console.log("x changed to ", x)
})
```

### `partyIsHost()`

Check to see if the local user has designated as the room’s host.

_Vanilla Party_ designates exactly one user in each occupied room as its host at all times.

#### Parameters

None.

#### Returns

Returns `true` if the local user is the host, otherwise returns `false`.

### `partyEmit(eventName, data?)`

Broadcast an event message to connected users in this room.

#### Parameters

**eventName: `string`**

The event name.

**data: `JSONObject`** (optional)

The data to send.

#### Returns

Nothing.

### `partySubscribe(eventName, callback)`

Register a callback to handle incoming event messages.

#### Parameters

**eventName: `string`**

The event name to subscribe to.

**callback: `(data: JSONObject | undefined) => void`**

A function to be called when event message is received.

#### Returns

Nothing.

### `partyUnsubscribe(eventName, callback?)`

Stop listening to event messages.

#### Parameters

**eventName: `string`**

The event name to unsubscribe from.

**callback: `(data: JSONObject | undefined) => void`**

The callback that you want to remove. If you don’t provide a callback, **all** callbacks for the provided `eventName` will be removed.

#### Returns

Nothing.

### `partyCountGuests()`

Returns the quantity of connected users in the room.

#### Parameters

None.

#### Returns

A `number`.

### `partyGetRoom()`

Returns the [Room](src/Room.ts) instance used by the local user connection.

#### Parameters

Nothing.

#### Returns

The instance.

### `partyToggleInfo(show?)`

Use `partyToggleInfo()` to hide, show, or toggle the visibility of the info panel (useful during development).

The info panel can also be toggled pressing `F1` key.

#### Parameters

**show: `boolean`** (optional)

Pass nothing to toggle from the current state. Pass `true` to show the panel or `false` to hide the panel.

#### Returns

Nothing.

#### Examples

```js
// show the panel at startup.
partyToggleInfo(true)
```

## Frequently Asked Questions

### Do I need a username and password to connect to the server?

No.

### Can I set up usernames and passwords on my own deepstream.io server?

No. _Vanilla Party_ does not provide any way to limit connections or authenticate users. Adding an authentication and permission system would significantly increase the complexity. _Vanilla Party_ is focused on ease-of-use, experimentation, and prototyping. If you need security, _Vanilla Party_ won’t work for you.

### When do I use different app names?

Typically, you use a unique app name for every project you are making.

### What would happen if I use the same app name as someone else?

If you use the same app name as someone else on the same server, your shared data and messages might accidentally get mixed up. To avoid using someone else’s app name, add a prefix to your app name. E.g.: instead of `"pong"`, use `"johnwick-pong"`.

### What kind of data can be shared?

Shared objects can contain only data. They cannot contain methods or internal (private) state. These simple, data-only objects are sometimes called "Plain Old JavaScript Objects" (POJOs).

Shared objects **can** share basic data types: numbers, strings, booleans, null, arrays and other objects.

You **can not** share: `Infinity`, `NaN`, functions, DOM Elements, symbol values, class instances, etc.

If you set a property’s value as `undefined` the property will be removed.

> Pro Tip: In general any data that is JSON serializable can be shared, and data that isn’t JSON serializable can not.

### How do I avoid data conflicts if I have multiple clients writing to the same object?

If your game requires a shared object across multiple clients, it is pertinent that they write to the object at different times. A few ways to do that are ensuring that only one client (the host) is writing to the object as shown or creating a turn based logic.

### How is the host chosen?

When an user connects to an empty room, that user is designated as host immediately and remains host until it disconnects. When the current host disconnects, another host is chosen automatically.

### Can I host my own server?

You don’t necessarily need to set up your own server. You can get started with our demo server:

`wss://vanilla-party.luizbills.com`

This is the easiest way to get started and for quick throw-away prototypes, but don’t count on the server being around for long term. Someday it might move to a new url, have an unplanned outage, or go offline forever. Fortunately, setting up your own server and switching to it isn’t that hard.

But if you need long term stability, you might want to set up your own server using [Node.js](https://nodejs.org/):

```
git clone https://github.com/luizbills/deepstream.io-public deepstream-server
cd deepstream-server
npm ci
npm start
```

Done! Now you have a local deepstream.io server running in your machine on http://localhost:6020.

Alternatively, you can deploy it on a cloud service of your choice (Heroku, Linode, AWS, etc). Even a cheap VPS can support many connections.

## Contributing

We welcome new contibuters. Please feel free to start a [discussion](https://github.com/luizbills/vanilla-party/discussions), [report issues](https://github.com/luizbills/vanilla-party/issues), or [request features](https://github.com/luizbills/vanilla-party/issues). If you want to help with writing code or documentation, you can start by indicating your interest on an open issue or by creating your own.

## Acknowledgements

_Vanilla Party_ is heavily based on [jbakse/p5.party](https://github.com/jbakse/p5.party), a P5 library builds on [deepstream.io](http://deepstream.io) and [sindresorhus/on-change](https://github.com/sindresorhus/on-change). Deepstream is a realtime data-sync server that can be easily self hosted on services like [heroku](heroku.com) or [aws](https://aws.amazon.com/free). on-change uses javascript [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to make a fully observable object.

- [jbakse/p5.party](https://github.com/jbakse/p5.party)
- [deepstream.io](http://deepstream.io)
- [sindresorhus/on-change](https://github.com/sindresorhus/on-change)

## License

Distributed under the MIT License. See `LICENSE` for more information.
