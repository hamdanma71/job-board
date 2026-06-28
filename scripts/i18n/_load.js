// Shared helpers for the i18n QA tools. Portable (paths relative to repo).
const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.resolve(__dirname, "..", "..", "src", "locales");
const CONFIG_PATH = path.join(__dirname, "i18n.config.json");

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

/** All locale codes present in src/locales (auto-discovers new languages; skips generated files). */
function listLocales() {
  return fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".generated.ts"))
    .map((f) => f.replace(/\.ts$/, ""))
    .sort();
}

/**
 * Parse a dictionary .ts file into a plain object WITHOUT executing it.
 * Safe (no code execution) and resilient: extracts every "key": "value" string
 * pair via regex and JSON-decodes each literal to handle escapes/unicode.
 * Throws a clear, file-named error if the file is unreadable or yields nothing.
 */
function load(code) {
  const file = path.join(LOCALES_DIR, code + ".ts");
  let src;
  try {
    src = fs.readFileSync(file, "utf8");
  } catch (e) {
    throw new Error(`i18n: cannot read locale file ${code}.ts — ${e.message}`);
  }
  const out = {};
  const re = /"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    try {
      out[JSON.parse('"' + m[1] + '"')] = JSON.parse('"' + m[2] + '"');
    } catch {
      throw new Error(`i18n: malformed string near key in ${code}.ts: ${m[0].slice(0, 60)}…`);
    }
  }
  if (Object.keys(out).length === 0) {
    throw new Error(`i18n: ${code}.ts contains no "key":"value" entries (empty or malformed file)`);
  }
  return out;
}

/** Replace a single key's value in a dictionary .ts file (preserves the rest). */
function patchKey(code, key, value) {
  const p = path.join(LOCALES_DIR, code + ".ts");
  let s = fs.readFileSync(p, "utf8");
  const re = new RegExp('("' + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"\\s*:\\s*)"(?:[^"\\\\]|\\\\.)*"');
  if (!re.test(s)) return false;
  fs.writeFileSync(p, s.replace(re, "$1" + JSON.stringify(value)));
  return true;
}

module.exports = { LOCALES_DIR, CONFIG_PATH, readConfig, listLocales, load, patchKey };
