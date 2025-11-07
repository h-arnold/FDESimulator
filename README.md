# FDESimulator

This repository contains a small Fetch-Decode-Execute (FDE) cycle simulator.

Where to find the app

- The simulator web app (HTML, JS and CSS) lives in the `fde-simulator/` folder:
  - `fde-simulator/fde.html`
  - `fde-simulator/app.js`
  - `fde-simulator/styles.css`

How to run

1. Open `fde-simulator/fde.html` directly in a browser (double-click or use your editor's Live Preview).

2. Or serve the folder with a simple static server from the project root (example using `npx http-server`):

```bash
npx http-server fde-simulator -p 8080
# then open http://localhost:8080/fde-simulator/fde.html in your browser
```

Playwright testing

The project includes a Playwright-based MCP-style server in the `playwright/` folder used by automated checks. When running tests or using the Playwright client, point at the served path `/fde-simulator/fde.html` (for example `http://localhost:3000/fde-simulator/fde.html`).

For more details, see `README-playwright.md` and `docs/`.
