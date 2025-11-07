# GitHub Copilot Custom Instructions for FDESimulator

## Project Overview

**FDESimulator** is an interactive web-based educational tool for WJEC GCSE Computer Science that demonstrates the Fetch-Decode-Execute (FDE) cycle—the fundamental process by which a CPU executes instructions.

### Purpose

This single-file HTML/CSS/JS applet provides a step-by-step visual demonstration of:
- CPU components (PC, MAR, MDR, CIR, ACC registers)
- Control Unit (CU) and Arithmetic Logic Unit (ALU)
- Data movement between RAM and CPU registers
- Three phases of the FDE cycle:
  - **Fetch**: Retrieve the next instruction from memory
  - **Decode**: Interpret the instruction via the Control Unit
  - **Execute**: Perform the operation (calculations, data storage, etc.)

The applet runs a simple pre-loaded program with instructions (LOAD, ADD, STO, HLT) and data stored in simulated RAM, allowing students to step through each micro-operation or run automatically.

## Key Architectural Concepts

- **State Machine**: The core logic is driven by a state object tracking all register values, memory contents, and the current step in the FDE cycle (e.g., fetch_1, decode_1, execute_1).
- **Step Function**: Performs one micro-operation per call, updates the UI, and advances to the next step.
- **Interactive Controls**: "Step" (manual advance), "Run" (automatic with delay), and "Reset" (restore initial state).
- **Visual Feedback**: Components highlight when active, with plain-English descriptions of each action.

## Testing with the Playwright Tool

When making **any code changes** to this project, use the integrated Playwright testing tool to verify the output:

### Quick Setup (if not already done)
```bash
npm install
npx playwright install chromium --with-deps
```

### Start the Test Server
```bash
npm start
```
The server will listen on `http://localhost:3000`.

### Run Manual Tests

**Navigate to the applet and verify page structure:**
```bash
npm run client -- navigate "http://localhost:3000" | jq -r .title
```
Expected: Should include page title and snippet containing CPU, registers, or FDE-related text.

**Capture a screenshot for visual inspection:**
```bash
npm run client -- screenshot "http://localhost:3000" test-screenshot.png
```
Then inspect the saved PNG file.

### Automated Testing Pattern

For complex changes, create a shell script (e.g., `scripts/test-changes.sh`) that:
1. Starts the server in the background
2. Uses `npm run client -- navigate` to assert page state (title, content)
3. Uses `npm run client -- screenshot` to save visual snapshots
4. Validates that expected elements are present (e.g., registers, buttons, memory layout)
5. Kills the server and reports pass/fail

**Example assertion:**
```bash
OUT=$(npm run client -- navigate "http://localhost:3000")
if ! echo "$OUT" | jq -e '.title | contains("FDE")' > /dev/null; then
  echo "ERROR: Page title does not mention FDE"
  exit 1
fi
```

### Files Reference

- **`server.js`**: Express server that launches Playwright and exposes `/navigate` and `/screenshot` endpoints
- **`scripts/playwright-client.js`**: CLI client for calling server endpoints
- **`docs/playwright-instructions.md`**: Full testing documentation and troubleshooting guide

## When to Test

- After implementing new features (e.g., new instruction types, visual changes)
- Before submitting PRs to ensure no regressions
- When debugging UI layout or styling issues
- To validate that the step-through logic produces the expected register/memory state changes

## Quick References

- **Specification**: See `docs/spec.md` for detailed FDE cycle logic, sample program, and UI layout requirements
- **Playwright Setup Guide**: See `docs/playwright-instructions.md` for troubleshooting, CI integration, and advanced usage

## Code Style

- Use semantic HTML and CSS for accessibility
- Keep the state machine logic clear and easy to follow
- Provide clear, user-friendly descriptions for each FDE step
- Maintain separation of concerns (state logic, UI updates, control flow)
