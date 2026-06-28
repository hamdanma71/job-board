#!/usr/bin/env node
/**
 * Normalize terminology — applies config.glossary [englishValue, locale, canonical]
 * to EVERY key whose English value equals englishValue, in the given locale file.
 * Idempotent and re-runnable. Usage: node scripts/i18n/glossary_apply.js
 */
const { readConfig, load, patchKey } = require("./_load");

const cfg = readConfig();
const en = load(cfg.sourceLocale || "en");
const glossary = cfg.glossary || [];

let patched = 0, skipped = 0;
const langs = new Set();
for (const [enVal, lang, canonical] of glossary) {
  const keys = Object.keys(en).filter((k) => en[k] === enVal);
  if (!keys.length) { console.log("WARN: no key has English value " + JSON.stringify(enVal)); continue; }
  langs.add(lang);
  for (const k of keys) {
    if (patchKey(lang, k, canonical)) patched++;
    else { skipped++; console.log("MISS: " + lang + " " + k); }
  }
}
console.log(`Normalized ${patched} key-values across ${langs.size} languages (${glossary.length} glossary terms).` + (skipped ? `  skipped: ${skipped}` : ""));
