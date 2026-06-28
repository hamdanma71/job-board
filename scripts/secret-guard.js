#!/usr/bin/env node
/**
 * Secret-leak guard. Blocks committing env files / key material and obvious
 * credentials so a secret can never be tracked again (the .env-in-history class
 * of incident). Runs as the git pre-commit hook (auto-installed by
 * scripts/install-git-hooks.js via the npm `prepare` script) and as `npm run
 * security:scan`. Bypass intentionally only with: git commit --no-verify
 */
const { execSync } = require("child_process");

function staged() {
  try {
    return execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" })
      .split("\n").map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}
function addedLines(file) {
  try {
    const d = execSync(`git diff --cached -U0 -- "${file}"`, { encoding: "utf8" });
    return d.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1));
  } catch {
    return [];
  }
}

// Forbidden paths (env files except the placeholder template, and key material).
const PATH_BLOCK = [
  /(^|\/)\.env$/, /(^|\/)\.env\.(?!example$)[^/]+$/,
  /\.pem$/, /\.p12$/, /\.pfx$/, /(^|\/)id_rsa/, /\.key$/,
];
// High-signal real-credential patterns (kept narrow to avoid false positives).
const CONTENT_BLOCK = [
  { re: /sk_live_[0-9A-Za-z]{16,}/, name: "Stripe live secret key" },
  { re: /sk-[A-Za-z0-9]{32,}/, name: "OpenAI API key" },
  { re: /whsec_[0-9A-Za-z]{24,}/, name: "Stripe webhook secret" },
  { re: /AKIA[0-9A-Z]{16}/, name: "AWS access key id" },
  { re: /ghp_[0-9A-Za-z]{36}/, name: "GitHub personal access token" },
  { re: /xox[baprs]-[0-9A-Za-z-]{10,}/, name: "Slack token" },
  { re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/, name: "private key" },
];

const files = staged();
const offenders = [];
for (const f of files) {
  if (PATH_BLOCK.some((re) => re.test(f))) { offenders.push(`  ✗ forbidden file staged: ${f}`); continue; }
  for (const line of addedLines(f)) {
    for (const { re, name } of CONTENT_BLOCK) {
      if (re.test(line)) { offenders.push(`  ✗ possible ${name} in ${f}`); break; }
    }
  }
}

if (offenders.length) {
  console.error("\n🛑 SECRET-GUARD blocked this commit:\n" + [...new Set(offenders)].join("\n"));
  console.error("\nRemove the secret/file from the commit. Env files belong in .env (gitignored).");
  console.error("If this is a deliberate false positive: git commit --no-verify\n");
  process.exit(1);
}
console.log("secret-guard: clean ✓");
