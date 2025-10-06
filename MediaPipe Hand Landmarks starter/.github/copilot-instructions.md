<!-- .github/copilot-instructions.md -->
# Guidance for AI coding agents

This repository is a minimal p5.js sketch project (static HTML + a single sketch). The file layout and conventions are intentionally simple — follow the rules below to be productive quickly and make safe, small changes.

## Big picture (what matters)
- Single-page static sketch served by `index.html`. The main runtime is the global p5 API exposed by `libraries/p5.min.js`.
- Visual code lives in `sketch.js` and follows the canonical p5 global-mode pattern (global `setup()` and `draw()` functions).
- Optional audio features use `libraries/p5.sound.min.js` if present; keep audio usage explicit and gated behind user interactions (browser autoplay restrictions).

## Key files to read first
- `index.html` — script load order matters: `libraries/p5.min.js`, `libraries/p5.sound.min.js` (optional), then `sketch.js`.
- `sketch.js` — the sketch entrypoint; small and global by design.
- `jsconfig.json` — contains a path to p5 type hints used by the editor; if you add TypeScript or modules, update this.
- `.vscode/settings.json` — sets Live Server port (5501) used by many devs in this workspace.

## How to run and debug (manual, reproducible)
- Open `index.html` in a browser. For live development, use VS Code Live Server on port 5501 (see `.vscode/settings.json`).
- When adding files, ensure they're referenced from `index.html` in the correct order.
- Debugging: use the browser DevTools console for runtime errors. Typical issues:
  - "createCanvas is not defined" → p5 was not loaded before `sketch.js` (fix script order in `index.html`).
  - Audio context errors → browsers require a user gesture before playing sound.

## Project-specific conventions and patterns
- Global mode p5 is the default: define `setup()` and `draw()` in `sketch.js`.
- Prefer adding additional modules/files rather than expanding `sketch.js` indefinitely. If you add modules, avoid relying on p5 globals — either import p5 as an instance or continue to load scripts in order via `index.html`.
- Keep third-party libraries in the `libraries/` folder. Do not modify `libraries/p5.min.js` or `libraries/p5.sound.min.js` unless upgrading — instead, add a short comment in the repo noting version and reason for changes.
- Editor types: `jsconfig.json` already points to p5 types. If introducing TypeScript, update config and add proper type definitions.

## Integration points and external dependencies
- p5 (core) — `libraries/p5.min.js` (loaded first)
- p5.sound — `libraries/p5.sound.min.js` (optional; loaded after p5)
- Browser environment only: there is no Node build system, bundler, or test harness present.

## Safety rules for automated edits
- Never change script load order in `index.html` without validating the sketch runs in the browser.
- Don't remove or edit files in `libraries/` unless explicitly upgrading a library and noting version changes in the commit message.
- Keep diffs small and focused: this project is manual-visual — provide a brief manual test plan in PR descriptions (what to open, what to look for).

## Examples (how to apply rules)
- Fix a missing function error: if console says `setup is not a function`, check that `sketch.js` defines `function setup()` and that `p5.min.js` is loaded first in `index.html`.
- Add a new module `controls.js`: create the file, add <script src="controls.js"></script> before `sketch.js` in `index.html`, and keep `controls` namespaced to avoid global collisions.

---
If any section is unclear or you'd like conventions expanded (for example, preferred file layout if we migrate to a module-based structure), tell me which area to expand and I'll update this file.
