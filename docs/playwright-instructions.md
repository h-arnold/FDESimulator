# Playwright tool — usage & testing instructions

This document explains how to use the Playwright MCP-style server and CLI that were added to this repository. It also provides concrete, copy-pasteable examples to test the output of work you (or the assistant) produce.

Files added in the repo
- `server.js` — Express server that launches Playwright and exposes `/navigate` and `/screenshot` endpoints.
- `scripts/playwright-client.js` — CLI that calls the server endpoints (exposed as `npm run client`).
- `package.json` — includes scripts: `start`, `install-browsers`, `client`.

Prerequisites
- Node.js 18+ (the dev container used here has Node and supports global `fetch` fallback via `node-fetch`).
- Network access to the pages you want to test.

Quick setup (one-time)

1. Install dependencies

```bash
cd /workspaces/FDESimulator
npm install
```

2. Install the Chromium browser used by Playwright (this can be large):

```bash
npx playwright install chromium --with-deps
```

Start the server (interactive)

```bash
cd /workspaces/FDESimulator
npm start
# Server listens on http://localhost:3000
```

Using the CLI client

- Navigate and print JSON:

```bash
npm run client -- navigate "https://example.com"
```

- Screenshot and save to a file:

```bash
npm run client -- screenshot "https://example.com" example.png
```

The CLI reads `PLAYWRIGHT_SERVER` environment variable if you need to point it at a different host (default `http://localhost:3000`).

Using curl directly

- JSON navigation:

```bash
curl "http://localhost:3000/navigate?url=https://example.com"
```

- Screenshot (binary PNG):

```bash
curl --output example.png "http://localhost:3000/screenshot?url=https://example.com"
```

How to use the tool to test the output of your work

Below are patterns you can use to validate the results of changes, PRs, or content that your code generates.

1) Quick smoke test (manual)
- Start server in one terminal: `npm start`
- In another terminal run:

```bash
# Expectation: the title contains 'Example Domain'
npm run client -- navigate "http://example.com" | jq -r .title
# should print: Example Domain

# Save screenshot and verify file exists
npm run client -- screenshot "http://example.com" tmp.png
[ -f tmp.png ] && echo ok || echo missing
```

2) Automated shell test (CI-friendly)

Create a small shell script `scripts/test-playwright.sh` (example):

```bash
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# start server in background
npm start &
SERVER_PID=$!
# give it a moment to start
sleep 1

# run a navigation check
OUT=$(npm run client -- navigate "http://example.com")
TITLE=$(echo "$OUT" | jq -r .title)
if [[ "$TITLE" != "Example Domain" ]]; then
  echo "Title mismatch: $TITLE"
  kill $SERVER_PID || true
  exit 2
fi

# take screenshot
npm run client -- screenshot "http://example.com" test-screenshot.png
if [[ ! -f test-screenshot.png ]]; then
  echo "Screenshot missing"
  kill $SERVER_PID || true
  exit 3
fi

kill $SERVER_PID || true
echo "playwright smoke test: OK"
```

Make this script executable and run it in CI after `npm install` and `npx playwright install chromium`.

3) Node.js test example

If you prefer a Node-based test harness, here's a tiny example that spawns the server and uses the CLI programmatically. Save this as `scripts/playwright-test.js`:

```js
const { spawnSync } = require('child_process');
const fs = require('fs');

function run(cmd, args, opts = {}) {
  const out = spawnSync(cmd, args, { encoding: 'utf8', stdio: 'pipe', ...opts });
  if (out.error) throw out.error;
  return { status: out.status, stdout: out.stdout, stderr: out.stderr };
}

// start server
const server = spawnSync('node', ['server.js'], { stdio: 'ignore', detached: true });
// We used detached+ignore; in CI you can use another approach (or start in background)

// Sleep briefly, then run client
const nav = run('node', ['scripts/playwright-client.js', 'navigate', 'http://example.com']);
console.log(nav.stdout);
if (!nav.stdout.includes('Example Domain')) {
  console.error('Title not found');
  process.exit(2);
}

// screenshot
const ss = run('node', ['scripts/playwright-client.js', 'screenshot', 'http://example.com', 'out.png']);
if (!fs.existsSync('out.png')) {
  console.error('Screenshot missing');
  process.exit(3);
}
console.log('Node test: OK');
```

Notes and troubleshooting

- Playwright downloads browser binaries to `~/.cache/ms-playwright` by default. The `--with-deps` flag attempts to install OS packages required for running Chrome in Linux containers.
- If `npm start` fails to launch the browser, check logs printed to the terminal (server prints errors). Common causes: missing system libs (re-run `npx playwright install --with-deps`), insufficient disk space, or permissions.
- If using the tool from CI, ensure the runner can run headless browsers and that required packages are installed. Use `npx playwright install --with-deps` in the CI steps.
- The server provided is minimal and not secured. If you run it in a shared environment, bind to localhost and/or add API key checks.

How the assistant (me) will use this tool within this workspace

- I can run the server and the CLI from the workspace using the terminal. Example calls I will use when checking pages or verifying results:

  - `npm start` (start server) — runs in the background in the environment I control.
  - `npm run client -- navigate <url>` — get JSON including `title` and `snippet` that I can assert against.
  - `npm run client -- screenshot <url> <file>` — save a screenshot file I can inspect or include in a PR comment.

- For automated checks, I will run the shell test or Node test above to confirm my changes produced the expected page content or screenshots.

Extending this setup

- Add an API key and simple middleware to `server.js` to limit access for CI or public runners.
- Add endpoints to return HAR, DOM snapshots or to run custom JS on the page.
- Integrate with GitHub Actions: create a workflow that runs `npm ci`, `npx playwright install --with-deps`, starts the server, runs `scripts/test-playwright.sh`, and uploads `test-screenshot.png` as an artifact.

If you'd like, I can:
- Add the `scripts/test-playwright.sh` or `scripts/playwright-test.js` files to the repo and wire a GitHub Actions workflow to run them.
- Harden the server with API key checks and CORS.


