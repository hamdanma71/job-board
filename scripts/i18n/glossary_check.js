#!/usr/bin/env node
/**
 * Lexical consistency check — a recurring identical English value (used by >=2 keys)
 * must translate to ONE consistent term per language. Morphology-safe: it only
 * compares keys that share the EXACT same English text.
 * English values listed in config.contextDivergent are exempt (same text, different sense).
 * Exit 1 if any real inconsistency remains. Usage: node scripts/i18n/glossary_check.js
 */
const { readConfig, listLocales, load } = require("./_load");

const cfg = readConfig();
const src = cfg.sourceLocale || "en";
const exempt = new Set(cfg.contextDivergent || []);
const en = load(src);
const langs = listLocales().filter((c) => c !== src);
const dicts = Object.fromEntries(langs.map((c) => [c, load(c)]));

const groups = {};
for (const k of Object.keys(en)) { const v = en[k]; if (v && v.length >= 3) (groups[v] ||= []).push(k); }
const recurring = Object.entries(groups).filter(([, ks]) => ks.length >= 2);

let real = 0, exemptHits = 0;
const perLang = Object.fromEntries(langs.map((c) => [c, 0]));

for (const [enVal, ks] of recurring) {
  const lines = [];
  for (const c of langs) {
    const variants = [...new Set(ks.map((k) => dicts[c][k]))];
    if (variants.length > 1) {
      if (exempt.has(enVal)) { exemptHits++; continue; }
      perLang[c]++; real++;
      lines.push(`    ${c}: ${variants.map((x) => JSON.stringify(x)).join("  |  ")}`);
    }
  }
  if (lines.length) { console.log(`• EN ${JSON.stringify(enVal)}  (keys: ${ks.join(", ")})`); lines.forEach((l) => console.log(l)); }
}

console.log(`\n================ CONSISTENCY SUMMARY ================`);
console.log(`recurring English values: ${recurring.length}   context-divergent (exempt) hits: ${exemptHits}`);
for (const c of langs) if (perLang[c]) console.log(`  ${c}: ${perLang[c]}`);
console.log(`REAL inconsistencies: ${real}`);
if (real > 0) { console.log("RESULT: ✗ FAIL — normalize via: node scripts/i18n/glossary_apply.js (after adding canonical terms to i18n.config.json)."); process.exit(1); }
console.log("RESULT: ✓ PASS (terminology consistent; only context-divergent terms differ).");
