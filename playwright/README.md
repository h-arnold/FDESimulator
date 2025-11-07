# Playwright MCP-style tools for FDESimulator

This folder contains the small Playwright-based server and helper scripts used for automated navigation and screenshots for the FDESimulator applet.

Files included here:

- `server.js` — Express server that launches Playwright and exposes `/navigate` and `/screenshot`.
- `playwright-client.js` — CLI client that calls the server endpoints (formerly `scripts/playwright-client.js`).
- `interactive-test.js` — small Playwright script to open `fde.html` and perform manual interactions for visual testing.

Quick start (from repo root):

```bash
npm install
npx playwright install chromium
npm start
```

Then use the client:

```bash
npm run client -- navigate "http://localhost:3000"
npm run client -- screenshot "http://localhost:3000" example.png
```

Notes:

- The `docs/playwright-instructions.md` document contains more detailed usage and CI suggestions. This README is intentionally short and points at the canonical `docs/` entry.
