<div align="center">

# Vanilla Party

[![NPM](https://badgen.net/npm/v/vanilla-party?scale=1.25&label=NPM&color=blue&cache=60)](https://npmjs.com/vanilla-party)

</div>

_Vanilla Party_ is a library for easily prototyping online multi-user apps with JavaScript. Quickly test ideas for multiplayer games, realtime multi-user apps, and multi-computer projects.

[Documentation](docs)

[Demos + Examples](samples)

[Discussion](https://github.com/luizbills/vanilla-party/discussions)

## What is it good for?

**Prototyping**

_Vanilla Party_ provides a simple, imperative interface for working with shared data inspired by the [p5.party](https://p5party.org/) library. _Vanilla Party_ let's you try ideas quickly without writing server code or setting up a front-end/back-end stack.

**Workshops + Classes**

_Vanilla Party_ uses a [deepstream.io](http://deepstream.io) server which is easy to set up and cheap—or free—to run. Many projects can connect to the same _Vanilla Party_ server, so students can focus on coding instead of setting up servers.

## What is it not good for?

**Production**

_Vanilla Party_ is designed for prototypes. As your project grows, you'll need to look into other libraries and backends that suit your project's needs.

**Security**

Projects built with _Vanilla Party_ are insecure and has no method to authenticate or authorize users. Multiple apps share a server and can read, write, and delete each other's data.

## Features

**No Server-Side Code**

With _Vanilla Party_ your projects are written using only client-side JavaScript. Quickly try ideas without writing server code or setting up a back-end stack.

**Real-time Data Sync**

With _Vanilla Party_ you can easily create a shared data object that is automatically synchronized between instances of your project. You can assign and read properties on these objects just like a plain old local javascript object.

**Multiple Apps and Rooms**

A single _Vanilla Party_ server can support many apps and each app can group users into rooms. _Vanilla Party_ keeps track of which clients are in each room and shares the data to the right clients.

**Client-side Hosting**

_Vanilla Party_ automatically designates one (and only one) guest in each room as the host. Your code can easily check if it is the host and take care of running the party.

## Installation and Quickstart

The quickest way to get started with _Vanilla Party_ is to load or download from a [CDN](https://unpkg.com/vanilla-party@latest/dist/vanilla-party.js).

Or install via NPM using **`npm install vanilla-party`**.

## Usage

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
    const radius = 64

    div.textContent = ""
    div.style.cssText = `width:${radius}px;height:${radius}px;background:red;border-radius:100%;position:absolute;`

    window.addEventListener("click", (ev) => {
      // listen clicks and taps and
      // write shared data
      shared.x = ev.clientX - radius / 2
      shared.y = ev.clientY - radius / 2
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

[JSFiddle Live Example](https://jsfiddle.net/p52q9Lf8/5/)

> Note: This example is using only javascript and HTML to illustrate how easy it is to get started with Vanilla Party. In our [examples](samples), we'll use P5.js for user interaction and rendering.

## Server Installation

_Vanilla Party_ need to connect to a server (a [deepstream.io](https://deepstream.io) instance) in order to synchronize their data.

You don’t necessarily need to set up your own server. Get started with our demo server: `wss://vanilla-party.luizbills.com`

But you can set up your own server in a few minutes on Heroku following this [guide](https://www.notion.so/Server-Setup-d039a4be3a044878bd5ad0931f1c93bd).

## Contributing

We welcome new contibuters. Please feel free to start a [discusion](https://github.com/luizbills/vanilla-party/discussions), [post issues](https://github.com/luizbills/vanilla-party/issues), or [request features](https://github.com/luizbills/vanilla-party/issues). If you want to help with writing code or documentation, you can start by indicating your interest on an open issue or by creating your own.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements

_Vanilla Party_ is heavily based on [jbakse/p5.party](https://github.com/jbakse/p5.party), a P5 library builds on [deepstream.io](http://deepstream.io) and [sindresorhus/on-change](https://github.com/sindresorhus/on-change). Deepstream is a realtime data-sync server that can be easily self hosted on services like [heroku](heroku.com) or [aws](https://aws.amazon.com/free). on-change uses javascript [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to make a fully observable object.

- [jbakse/p5.party](https://github.com/jbakse/p5.party)
- [deepstream.io](http://deepstream.io)
- [sindresorhus/on-change](https://github.com/sindresorhus/on-change)
