# App

The front end client for the asteroids visualization.

Built in [three.js](https://threejs.org) and run using [`canvas-sketch`](https://github.com/mattdesl/canvas-sketch).

## Setup

These instructions assume you want to develop on the client. If you only want to run the client as a standalone file, simply to open [public/index.html](../public/index.html) in your browser.

### Env

You'll need [Node.JS](https://nodejs.org/en) version 16+ and [npm](https://www.npmjs.com). You can check if you already have these installed:

```bash
node -v
npm -v
```

With these set up, you'll need to install the required packages.

```bash
cd app
npm install
```

You'll also need [npx](https://www.npmjs.com/package/npx) if you plan on building or running your own version of the app.

```bash
npm install -g npx
```

Finally, because the `canvas-sketch-cli` package (used for local development and packaging) doesn't handle module imports by default, you'll need to run a script to modify its source. 

From the `app` directory, run:
```bash
./fixModule.sh
```

## Running
This project uses [`canvas-sketch`](https://github.com/mattdesl/canvas-sketch) and [`canvas-sketch-cli`](https://github.com/mattdesl/canvas-sketch-cli) to host the client locally and build it into a package suitable for production hosting.

### Developing with hot reload
To host the client locally and see your changes in real-time, run:
```bash
npx canvas-sketch-cli simulation/app.js --hot
```

This will give you a local URL to view the client, something like:
```bash
[0001] info  Server running at http://192.168.33.185:9967/ (connect)
...
```

**Note:** while changes are reloaded on the fly, it may take a while for the app to fetch and visualize all the necessary data from the server.

### Building for web
To build the entire client into a single `index.html` file in the top-level `/public/` directory, run:

```bash
npx canvas-sketch simulation/app.js --name "../public/index" --build --inline
```

For other build configurations, check out the `canvas-sketch-cli` [docs](https://github.com/mattdesl/canvas-sketch/blob/master/docs/cli.md#building-to-a-website).