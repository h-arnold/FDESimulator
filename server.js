const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3000;

let browser;

// Start browser on server start
(async () => {
  try {
    console.log('Launching Playwright Chromium...');
    browser = await chromium.launch({ headless: true });
    console.log('Browser launched.');
  } catch (err) {
    console.error('Failed to launch browser:', err);
    process.exit(1);
  }
})();

// Simple navigate endpoint: returns page title and a short text snippet
app.get('/navigate', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url query parameter' });

  let context, page;
  try {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const title = await page.title();
    // grab some text content (trimmed)
    const bodyHandle = await page.$('body');
    let text = '';
    if (bodyHandle) {
      text = (await page.evaluate((b) => b.innerText || '', bodyHandle)).trim();
      await bodyHandle.dispose();
    }

    const snippet = text.substring(0, 2000); // limit response size

    await context.close();
    return res.json({ url, title, snippet });
  } catch (err) {
    if (context) await context.close().catch(() => {});
    console.error('Navigation error:', err.message || err);
    return res.status(500).json({ error: 'Navigation failed', details: err.message });
  }
});

// Screenshot endpoint (returns PNG)
app.get('/screenshot', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url query parameter' });

  let context, page;
  try {
    context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const buffer = await page.screenshot({ fullPage: true });
    await context.close();

    res.set('Content-Type', 'image/png');
    return res.send(buffer);
  } catch (err) {
    if (context) await context.close().catch(() => {});
    console.error('Screenshot error:', err.message || err);
    return res.status(500).json({ error: 'Screenshot failed', details: err.message });
  }
});

app.get('/', (req, res) => {
  res.type('text').send('Playwright MCP-style server. Use /navigate?url=... or /screenshot?url=...');
});

const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  try {
    await server.close();
    if (browser) await browser.close();
  } catch (e) {}
  process.exit(0);
});
