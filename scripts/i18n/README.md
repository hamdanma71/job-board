# i18n translation QA + auto-adaptation tools

The platform **self-adapts** to languages: the runtime registry (language list, types,
dictionaries map) is **generated from the dictionary files** — you do not hand-edit any
TypeScript to add a language. These tools also enforce the certified "matching
translation" standard before any translation is approved/built.

All tools auto-discover languages from `src/locales/*.ts` (ignoring `*.generated.ts`).

## Commands

```bash
npm run i18n:gen          # regenerate the registry from src/locales/*.ts (also runs in predev + prebuild)
npm run i18n:sync         # scaffold any missing keys in each locale with English placeholders (dev convenience)
npm run i18n:audit        # matching audit: numbers, brand, emojis, completeness, empty values, registry parity
npm run i18n:consistency  # lexical terminology consistency across all languages
npm run i18n:normalize    # apply the approved glossary (fixes terminology drift)
npm run i18n:check        # gen + audit + consistency (the approval gate; same as prebuild)
```

## Add a new language (zero code edits)

1. Drop the dictionary file `src/locales/<code>.ts` (e.g. `pt.ts`) exporting
   `export const pt: Record<string, string> = { ... }`.
   - Quick start: create it with a few keys, then run `npm run i18n:sync` to fill the
     rest with English placeholders so nothing breaks.
2. (Optional) add a nice label/dir in `scripts/i18n/i18n.config.json → localeMeta`
   (e.g. `"pt": { "label": "Português", "dir": "ltr" }`). Without it the label defaults
   to the uppercased code and the direction is taken from the `rtl` list.
3. `npm run i18n:gen` (or just `npm run dev` / `npm run build` — both run it).

That's it — the language now appears in the registry, the `<select>` switcher, the admin
"languages" panel, `<html lang/dir>`, and the QA gate automatically. Translate the
placeholders, then `npm run i18n:check` must pass (HARD errors 0, registry ok,
REAL inconsistencies 0) before approval.

## Generated files (committed, never hand-edited)

- `src/lib/locales.generated.ts` — client-safe: `LOCALES` (code/label/dir), `Locale` type, `DEFAULT_LOCALE`.
- `src/locales/dicts.generated.ts` — server-only: static dict imports + `DICTS` map.

## What each tool checks

### `gen-registry.js` (`i18n:gen`)
Scans `src/locales/*.ts`, reads `i18n.config.json` (localeMeta + rtl + defaultLocale),
writes the two generated files. Keeps the runtime in lockstep with the files so the app
and the gate can never diverge (audit asserts registry parity).

### `audit.js` (`i18n:audit`)
- **HARD (fails / exit 1):** missing keys, empty values, a source **number** dropped,
  brand **"JobMatch"** dropped, an **emoji** dropped, **registry parity** mismatch.
- **SOFT (warns / exit 0):** whitespace differences (legit typography), values identical
  to English (proper nouns/cognates/loanwords — review), extra keys not in the source.
- Loads dictionaries with a **safe regex parser** (no code execution; clear file-named errors).

### `glossary_check.js` (`i18n:consistency`)
A recurring identical English value (≥2 keys) must translate to one consistent term per
language. `i18n.config.json → contextDivergent` exempts same-text/different-sense values.

### `glossary_apply.js` (`i18n:normalize`)
Applies `i18n.config.json → glossary` `[englishValue, locale, canonicalTerm]`. Idempotent.

### `sync-keys.js` (`i18n:sync`)
Scaffolds missing keys with English placeholders so a partial language never hard-fails
the build; placeholders then show as SOFT "identical" warnings marking what to translate.

## Gates
- **Local/deploy:** `predev` + `prebuild` run `gen → audit → consistency`; all deploy
  build commands are `npm run build` (Render/Railway/Vercel).
- **CI:** `.github/workflows/i18n.yml` regenerates the registry, fails on a stale committed
  registry, then runs audit + consistency on push/PR.
