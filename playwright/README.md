# Playwright MCP-style server for FDESimulator

This adds a small Playwright-based server that exposes simple endpoints to navigate or screenshot pages. It's useful for automated page navigation tasks from within the dev container.

Files added:

- `server.js` — Express server that launches Playwright and exposes `/navigate` and `/screenshot`.
- `package.json` — node project manifest with scripts.

Quick start

1. Install Node dependencies (run in the repository root):

```bash
cd /workspaces/FDESimulator
npm install
```

2. Install the Chromium browser used by Playwright:

```bash
npx playwright install chromium
```

Note: Browser binaries can be large and may take a few minutes to download.

3. Start the server:

```bash
npm start
```

4. Test navigation (in another terminal):

```bash
curl "http://localhost:3000/navigate?url=http://example.com"
```

When testing the FDE simulator, point the navigator at the simulator path, for example:

```bash
curl "http://localhost:3000/navigate?url=http://localhost:3000/fde-simulator/index.html"
```

CLI client

You can also use the included CLI client which interacts with the server:

```bash
# navigate and pretty-print JSON
npm run client -- navigate "http://example.com"

# save a screenshot
npm run client -- screenshot "http://example.com" example.png
```

5. Request a screenshot:

```bash
curl --output example.png "http://localhost:3000/screenshot?url=http://example.com"
```

Security & notes

- This server is minimal and not production hardened. Use behind a firewall or only in trusted environments.
- The server launches a browser in headless mode and creates new contexts per request to isolate pages.
- If you need authentication, cookies or more complex flows, extend `server.js` accordingly.

If you'd like, I can also wire this to a formal MCP protocol implementation (if you have a spec) or restrict origins and add an API key.
