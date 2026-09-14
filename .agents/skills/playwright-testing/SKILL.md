---
name: playwright-testing
description: >-
  Use this skill when interacting with web applications via the browser, running E2E tests,
  verifying frontend layouts, clicking UI elements, or capturing page snapshots.
---

# Playwright Browser Automation & Testing Skill

This skill guides the agent on how to use the Playwright MCP server to automate browser interactions, inspect web pages, and perform end-to-end testing.

## When to Use Playwright MCP

- When verifying frontend web pages (e.g. Pet Shop web application at `http://localhost:5173`).
- When navigating web interfaces, submitting forms, clicking buttons, and validating responsive behavior.
- When inspecting browser console errors, failed network requests, or accessibility tree snapshots.

## Key MCP Tools & Capabilities

The `@playwright/mcp` server exposes browser automation tools:

1. **Navigation & Session Management:**
   - `browser_navigate`: Opens a target URL (e.g., `http://localhost:5173/`).
   - `browser_navigate_back`: Simulates browser back button.
   - `browser_close`: Closes the current browser session.
   - `browser_resize`: Sets the browser viewport dimensions (e.g., desktop 1280x720, mobile 375x667).

2. **Element Interaction:**
   - `browser_click`: Clicks an element identified by its accessibility selector / role.
   - `browser_type`: Types text into an input field or text area.
   - `browser_fill_form`: Fills multiple form inputs at once.
   - `browser_select_option`: Selects dropdown option(s).
   - `browser_press_key`: Sends keyboard keys (e.g., `"Enter"`, `"Escape"`, `"Tab"`).

3. **Inspection & Debugging:**
   - `browser_snapshot`: Captures the structured accessibility tree of the page (lightweight, token-efficient representation).
   - `browser_take_screenshot`: Captures a visual image of the current page or a specific element.
   - `browser_console_messages`: Retrieves console warnings and runtime errors emitted by the page.
   - `browser_network_requests`: Inspects HTTP requests made by the page (status codes, headers, URLs).

## Recommended Interaction Pattern

1. **Navigate**: Call `browser_navigate` with the target local or remote URL.
2. **Snapshot**: Call `browser_snapshot` to inspect page elements and their interactive attributes.
3. **Interact**: Use `browser_click` or `browser_fill_form` with the selectors identified in the snapshot.
4. **Verify**: Inspect `browser_console_messages` or verify UI state by taking a fresh snapshot or screenshot.
