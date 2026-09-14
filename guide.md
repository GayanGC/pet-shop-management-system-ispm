# Antigravity Skills & MCP Integration Guide

This guide explains how to use the **Model Context Protocol (MCP)** servers and **Agent Skills** configured for your environment, including **Context7** and **Playwright**.

---

## 1. Quick Overview

| Integration | Type | Primary Purpose | Status / Access |
| :--- | :--- | :--- | :--- |
| **Context7 MCP** | MCP Server | Live, version-accurate documentation & code examples directly from official library sources | Active (Authenticated with API Key) |
| **Playwright MCP** | MCP Server | Full browser automation, accessibility DOM tree inspection, form filling, and E2E UI verification | Active (Pre-installed with Chromium) |
| **`context7-docs`** | Agent Skill | Runbook teaching the agent how to resolve library IDs and retrieve targeted code snippets | Installed in `.agents/skills/context7-docs/` |
| **`playwright-testing`** | Agent Skill | Runbook teaching the agent how to navigate, interact with, and test web applications | Installed in `.agents/skills/playwright-testing/` |

---

## 2. Context7 MCP Server

### What It Does
Context7 dynamically fetches the latest documentation, function signatures, and code examples for thousands of modern libraries and frameworks (e.g., React 19, Tailwind v4, Express, Mongoose, Vite, Playwright, Stripe). It eliminates stale training data and hallucinated APIs.

### Available Tools
- **`resolve-library-id`**: Converts a common package or tool name (e.g. `"express"`, `"playwright"`) into Context7's canonical library identifier (e.g. `"/expressjs/express"`).
- **`query-docs`**: Searches Context7 using the resolved library ID to retrieve focused documentation sections and sample implementations.

### How to Use It in Prompts
Whenever you want the agent to use Context7, simply mention `"use context7"` or ask about up-to-date documentation:
- *"How do I configure MongoDB transactions with Mongoose 8? use context7"*
- *"What is the modern syntax for React Router v7 routes? use context7"*
- *"Check the official Tailwind v4 docs for custom theme variables with context7."*

### Authentication
Your Context7 API key has been securely configured in `mcp_config.json` via both `--api-key` and the `CONTEXT7_API_KEY` environment variable.

---

## 3. Playwright MCP Server

### What It Does
Microsoft's `@playwright/mcp` connects Antigravity to a headless browser running locally. Rather than relying on heavy screenshots or slow vision models, it interacts directly with the browser's structured accessibility tree and DOM.

### Available Tools (24 Tools Included)
- **Navigation**:
  - `browser_navigate`: Open any local or public URL (e.g. `http://localhost:5173`).
  - `browser_navigate_back`: Return to the previous page.
  - `browser_close`: Terminate active browser session.
  - `browser_resize`: Test responsiveness (e.g. mobile 375x667 vs desktop 1280x720).
- **Page Interaction**:
  - `browser_click`: Click buttons, links, or inputs using accessible roles/names.
  - `browser_type`: Enter text keystroke-by-keystroke.
  - `browser_fill_form`: Fill entire forms at once.
  - `browser_select_option`: Choose select dropdown values.
  - `browser_press_key`: Send keyboard triggers (e.g., `Enter`, `Escape`, `Tab`).
- **Debugging & Inspection**:
  - `browser_snapshot`: Token-efficient accessibility tree showing interactive elements and IDs.
  - `browser_take_screenshot`: Capture visual page rendering for visual inspection.
  - `browser_console_messages`: Read browser JavaScript errors and console logs.
  - `browser_network_requests`: Inspect API request payloads and HTTP status codes.

### How to Use It in Prompts
You can ask the agent to test and inspect your web applications directly:
- *"Open http://localhost:5173 with Playwright and verify that the Pet Shop homepage loads without console errors."*
- *"Fill in the login form with test credentials and check if the user profile dropdown appears."*
- *"Take a snapshot of the cart page on mobile screen width (375x667) and verify button placement."*

---

## 4. Workspace Skills (`.agents/skills/`)

Skills teach the agent step-by-step procedures and ensure consistent execution:

### 1. `context7-docs` Skill
- **Location**: [`.agents/skills/context7-docs/SKILL.md`](.agents/skills/context7-docs/SKILL.md)
- **Role**: Automatically triggers when the agent needs to look up library documentation, ensuring it resolves the canonical library ID first before querying docs.

### 2. `playwright-testing` Skill
- **Location**: [`.agents/skills/playwright-testing/SKILL.md`](.agents/skills/playwright-testing/SKILL.md)
- **Role**: Automatically triggers when performing browser testing or UI validation, following the best-practice cycle: **Navigate &rarr; Snapshot &rarr; Interact &rarr; Verify**.

---

## 5. File & Configuration Map

| File Path | Description |
| :--- | :--- |
| `~/.gemini/config/mcp_config.json` | Global Antigravity MCP configuration |
| `~/.gemini/antigravity/mcp_config.json` | Antigravity runtime MCP configuration |
| `~/.gemini/antigravity-ide/mcp_config.json` | Antigravity IDE MCP configuration |
| `.agents/skills/context7-docs/SKILL.md` | Context7 documentation retrieval skill |
| `.agents/skills/playwright-testing/SKILL.md` | Playwright browser automation skill |
| `C:\Users\gayan\AppData\Local\ms-playwright\` | Downloaded Playwright Chromium & headless binaries |

---

## 6. Example Workflow: Testing the Pet Shop Project

Here is a recommended end-to-end workflow combining both capabilities:

1. **Start the Development Server:**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

2. **Validate Modern APIs with Context7:**
   > *"Find the best way to handle authentication tokens in Vite React apps with context7."*

3. **Verify Features in the Browser with Playwright:**
   > *"Use Playwright to visit http://localhost:5173, submit the pet adoption inquiry form, and confirm that the success toast appears."*
