#!/usr/bin/env node
/**
 * Installs the git pre-commit hook that runs the secret-guard. Wired to the npm
 * `prepare` script so it self-installs on `npm install` (no manual setup). Skips
 * silently where there is no .git/hooks (e.g. CI/deploy shallow checkouts).
 */
const fs = require("fs");
const path = require("path");

const hooksDir = path.resolve(__dirname, "..", ".git", "hooks");
if (!fs.existsSync(hooksDir)) {
  console.log("install-git-hooks: no .git/hooks (skipping — not a git working copy).");
  process.exit(0);
}

const hookPath = path.join(hooksDir, "pre-commit");
const hook = `#!/bin/sh
# Auto-installed by scripts/install-git-hooks.js — blocks committing secrets.
node scripts/secret-guard.js || exit 1
`;
try {
  fs.writeFileSync(hookPath, hook, { mode: 0o755 });
  try { fs.chmodSync(hookPath, 0o755); } catch {}
  console.log("install-git-hooks: pre-commit secret-guard installed ✓");
} catch (e) {
  console.log("install-git-hooks: could not install hook (non-fatal):", e.message);
}
