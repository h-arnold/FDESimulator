# FDESimulator

This repository contains a small Fetch-Decode-Execute (FDE) cycle simulator.

Where to find the app

- The simulator web app (HTML, JS and CSS) lives in the `fde-simulator/` folder:
  - `fde-simulator/index.html`
  - `fde-simulator/app.js`
  - `fde-simulator/styles.css`

How to run

1. Open `fde-simulator/index.html` directly in a browser (double-click or use your editor's Live Preview).

2. Or serve the folder with a simple static server from the project root (example using `npx http-server`):

```bash
npx http-server fde-simulator -p 8080
# then open http://localhost:8080/fde-simulator/index.html in your browser
```

Playwright testing

The project includes a Playwright-based MCP-style server in the `playwright/` folder used by automated checks. When running tests or using the Playwright client, point at the served path `/fde-simulator/index.html` (for example `http://localhost:3000/fde-simulator/index.html`).

For more details, see `README-playwright.md` and `docs/`.

GitHub Pages

This repository includes a GitHub Actions workflow that can publish the static files in the `fde-simulator/` folder as a GitHub Pages site.

- Workflow: `.github/workflows/deploy.yml` — it uploads the `fde-simulator` folder as a Pages artifact and deploys it when you push to `main` or run the workflow manually.
- After the workflow runs successfully, GitHub Pages will serve the files at a URL like `https://<your-org-or-username>.github.io/<repo-name>/` (or at a custom domain if configured).

Notes / customization

- To publish from a different folder, change the `path` value in the workflow.
- If you prefer the older approach (publishing the `docs/` folder or using the `gh-pages` branch), you can move/copy the site files accordingly and adjust repository settings.
- If you want a custom domain, add a `CNAME` file to the `fde-simulator/` folder before deployment and configure the domain in the repository Pages settings.

How to verify

1. Push to `main` or run the workflow via "Actions > Deploy FDE Simulator to GitHub Pages > Run workflow".
2. Wait for the action to complete (check the workflow run logs). If successful, open the repository's "Pages" section in Settings to see the site URL.
