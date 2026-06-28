#!/usr/bin/env node
/**
 * i18n matching audit — verifies every translation dictionary against the English
 * source for the certified "matching translation" requirements:
 *   HARD (fail, exit 1): missing keys, empty values, a source number dropped,
 *                        brand "JobMatch" dropped, an emoji dropped.
 *   SOFT (warn, exit 0): leading/trailing whitespace differs (legit typography),
 *                        value identical to English (proper nouns / cognates).
 * Usage: node scripts/i18n/audit.js
 */
const fs = require("fs");
const path = require("path");
const { readConfig, listLocales, load, LOCALES_DIR } = require("./_load");

const cfg = readConfig();
const src = cfg.sourceLocale || "en";
const en = load(src);
const enKeys = Object.keys(en);
const enKeySet = new Set(enKeys);
const targets = listLocales().filter((c) => c !== src);

const numbersIn = (s) => (s.match(/\d+/g) || []);
const emojisIn = (s) => (s.match(/\p{Extended_Pictographic}/gu) || []).sort().join("");

let hardTotal = 0;
let softTotal = 0;

for (const code of targets) {
  const d = load(code);
  const hard = { missing: [], emptyVal: [], numberDropped: [], brandDropped: [], emojiDropped: [] };
  const soft = { whitespace: [], identical: [], extraKeys: [] };

  // keys present in this locale but absent from the source (drift / stale keys)
  for (const k of Object.keys(d)) if (!enKeySet.has(k)) soft.extraKeys.push(k);

  for (const k of enKeys) {
    const e = en[k];
    const v = d[k];
    if (v === undefined) { hard.missing.push(k); continue; }
    if (typeof v !== "string" || v.trim() === "") { hard.emptyVal.push(k); continue; }

    // every source number must still be present (order-insensitive; extra allowed for locale numerals e.g. CN months)
    const vNums = numbersIn(v);
    for (const n of numbersIn(e)) {
      const i = vNums.indexOf(n);
      if (i === -1) { hard.numberDropped.push(`${k}  [${n}] missing  EN=${JSON.stringify(e)} ${code}=${JSON.stringify(v)}`); break; }
      vNums.splice(i, 1);
    }
    if (e.includes("JobMatch") && !v.includes("JobMatch")) hard.brandDropped.push(k);
    if (emojisIn(e) !== emojisIn(v)) hard.emojiDropped.push(`${k}  «${emojisIn(e)}» != «${emojisIn(v)}»`);

    if ((/^\s/.test(e)) !== (/^\s/.test(v)) || (/\s$/.test(e)) !== (/\s$/.test(v))) soft.whitespace.push(k);
    if (e === v && e.length > 2 && !/^[A-Z0-9 ./+()%-]+$/.test(e) && !e.includes("JobMatch")) soft.identical.push(k);
  }

  const hardN = Object.values(hard).reduce((a, x) => a + x.length, 0);
  const softN = Object.values(soft).reduce((a, x) => a + x.length, 0);
  hardTotal += hardN; softTotal += softN;

  console.log(`\n===== ${code.toUpperCase()} =====  hard:${hardN}  soft:${softN}`);
  for (const [cat, arr] of Object.entries(hard)) if (arr.length) { console.log(`  ✗ ${cat}: ${arr.length}`); arr.slice(0, 10).forEach((x) => console.log("      - " + x)); }
  for (const [cat, arr] of Object.entries(soft)) if (arr.length) { console.log(`  ⚠ ${cat}: ${arr.length}` + (cat === "identical" ? " (review: proper nouns/cognates OK)" : "")); }
}

// Registry parity: the auto-generated runtime registry must match the dictionary
// files exactly, so the app (DICTS/LOCALES) can never silently diverge from the gate.
let registryError = 0;
try {
  const gen = fs.readFileSync(path.join(LOCALES_DIR, "..", "lib", "locales.generated.ts"), "utf8");
  const regCodes = new Set([...gen.matchAll(/code:\s*"([^"]+)"/g)].map((m) => m[1]));
  const files = new Set(listLocales());
  const missingInReg = [...files].filter((c) => !regCodes.has(c));
  const missingFile = [...regCodes].filter((c) => !files.has(c));
  if (missingInReg.length || missingFile.length) {
    registryError = 1;
    console.log(`\n===== REGISTRY PARITY =====  ✗`);
    if (missingInReg.length) console.log(`  ✗ dict files not in generated registry (run: npm run i18n:gen): ${missingInReg.join(", ")}`);
    if (missingFile.length) console.log(`  ✗ registry codes without a dict file: ${missingFile.join(", ")}`);
  }
} catch {
  registryError = 1;
  console.log(`\n===== REGISTRY PARITY =====  ✗  src/lib/locales.generated.ts missing (run: npm run i18n:gen)`);
}

console.log(`\n================ AUDIT SUMMARY ================`);
console.log(`languages: ${targets.length}   keys/lang: ${enKeys.length}`);
console.log(`HARD errors: ${hardTotal}   SOFT warnings: ${softTotal}   registry: ${registryError ? "MISMATCH" : "ok"}`);
if (hardTotal > 0 || registryError) { console.log("RESULT: ✗ FAIL — fix HARD/registry errors before approving."); process.exit(1); }
console.log("RESULT: ✓ PASS (no hard errors).");
