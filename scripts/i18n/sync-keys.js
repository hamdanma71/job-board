#!/usr/bin/env node
/**
 * Self-healing key scaffolder (DEV convenience — NOT wired into the build gate).
 * For every locale dictionary, inserts any key present in the source (en) but
 * missing locally, using the English value as a placeholder, so a partial new
 * language never hard-fails the build. The inserted English placeholders then
 * surface as SOFT "identical" warnings in the audit, marking what still needs
 * real translation. Existing translations are never overwritten.
 *
 * Usage: node scripts/i18n/sync-keys.js   (or: npm run i18n:sync)
 */
const fs = require("fs");
const path = require("path");
const { LOCALES_DIR, readConfig, listLocales, load } = require("./_load");

const cfg = readConfig();
const src = cfg.sourceLocale || "en";
const en = load(src);
const enKeys = Object.keys(en);
const targets = listLocales().filter((c) => c !== src);

let totalAdded = 0;
for (const code of targets) {
  const d = load(code);
  const missing = enKeys.filter((k) => d[k] === undefined);
  if (!missing.length) continue;
  const file = path.join(LOCALES_DIR, code + ".ts");
  let s = fs.readFileSync(file, "utf8");
  const insertAt = s.lastIndexOf("}");
  const lines = missing.map((k) => "  " + JSON.stringify(k) + ": " + JSON.stringify(en[k]) + ",").join("\n") + "\n";
  s = s.slice(0, insertAt) + lines + s.slice(insertAt);
  fs.writeFileSync(file, s);
  totalAdded += missing.length;
  console.log(`${code}: scaffolded ${missing.length} missing key(s) with English placeholders (translate these next).`);
}
if (totalAdded === 0) console.log("All locales already have every source key — nothing to scaffold.");
else console.log(`\nScaffolded ${totalAdded} placeholder(s). Run \`npm run i18n:audit\` to see what needs real translation (SOFT 'identical').`);
