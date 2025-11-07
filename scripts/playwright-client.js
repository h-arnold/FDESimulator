#!/usr/bin/env node
// Simple CLI client to call the local Playwright MCP server endpoints.
// Usage:
//   node scripts/playwright-client.js navigate <url>
//   node scripts/playwright-client.js screenshot <url> <output.png>

const fs = require('fs');
const path = require('path');

async function run() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) return usage(1);

  const cmd = argv[0];
  const url = argv[1];
  const server = process.env.PLAYWRIGHT_SERVER || 'http://localhost:3000';

  if (!url) return usage(1);

  if (cmd === 'navigate') {
    const res = await fetch(`${server}/navigate?url=${encodeURIComponent(url)}`);
    if (!res.ok) {
      console.error('Server error:', res.status, await res.text());
      process.exit(2);
    }
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
    process.exit(0);
  }

  if (cmd === 'screenshot') {
    const out = argv[2] || 'screenshot.png';
    const res = await fetch(`${server}/screenshot?url=${encodeURIComponent(url)}`);
    if (!res.ok) {
      console.error('Server error:', res.status, await res.text());
      process.exit(2);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(out, buffer);
    console.log('Saved screenshot to', out);
    process.exit(0);
  }

  return usage(1);
}

function usage(code = 0) {
  console.log('Usage:');
  console.log('  node scripts/playwright-client.js navigate <url>');
  console.log('  node scripts/playwright-client.js screenshot <url> [output.png]');
  console.log('\nEnvironment:');
  console.log('  PLAYWRIGHT_SERVER - base URL of server (default http://localhost:3000)');
  process.exit(code);
}

// Node 18+ has global fetch; polyfill minimally if not present
if (typeof fetch === 'undefined') {
  global.fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
}

run().catch((err) => {
  console.error('Client error:', err);
  process.exit(1);
});
