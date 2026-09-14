---
name: context7-docs
description: >-
  Use this skill when researching documentation, syntax, API reference, or code examples
  for external frameworks, libraries, or APIs, or whenever the user asks to use Context7.
---

# Context7 Documentation Retrieval Skill

This skill guides the agent in using the Context7 MCP server to query accurate, up-to-date, and version-specific library documentation.

## When to Use Context7

- When working with rapidly evolving packages (e.g., React, Next.js, Vite, Tailwind CSS, Express, Mongoose, Playwright, Stripe).
- When looking up function signatures, configuration options, or migration guides between major library versions.
- Whenever the user prompts with phrases like `"use context7"`, `"check docs"`, or asks about library-specific features.

## Available MCP Tools

The Context7 MCP server provides two main tools:

1. **`resolve-library-id`**
   - **Purpose**: Discovers and resolves the exact Context7 library ID for a given package or technology name.
   - **Parameters**: `libraryName` (e.g., `"playwright"`, `"express"`, `"mongoose"`, `"tailwindcss"`, `"react"`).
   - **Output**: A canonical library ID (such as `/microsoft/playwright`, `/expressjs/express`).

2. **`query-docs`**
   - **Purpose**: Fetches focused documentation snippets, API references, and relevant code examples for a specific query.
   - **Parameters**:
     - `libraryId`: The resolved library ID from `resolve-library-id`.
     - `query`: The specific technical topic or method you need information about (e.g., `"locator assertions"`, `"jwt auth middleware"`, `"schema validation"`).

## Recommended Workflow

1. **Step 1: Resolve Library ID**
   - If the canonical Context7 library ID is not yet known, call `resolve-library-id` with the library name.
   
2. **Step 2: Query Documentation**
   - Call `query-docs` with the resolved `libraryId` and a clear, focused query string.
   - For multi-topic tasks, query each topic separately to retrieve high-signal snippets.

3. **Step 3: Synthesize Code**
   - Incorporate the official, version-matched patterns directly into the implementation, avoiding deprecated or hallucinated APIs.
