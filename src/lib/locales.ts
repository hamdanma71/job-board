// Client-safe locale registry. The list of languages + their label/dir is
// AUTO-GENERATED from src/locales/*.ts by scripts/i18n/gen-registry.js
// (runs in `npm run i18n:gen` and in prebuild). To add a language: drop a
// src/locales/<code>.ts dictionary and (optionally) a label/dir in
// scripts/i18n/i18n.config.json → localeMeta, then regenerate. No edits here.
export { LOCALES, DEFAULT_LOCALE } from "./locales.generated";
export type { Locale } from "./locales.generated";

import { LOCALES } from "./locales.generated";
import type { Locale } from "./locales.generated";

export function isLocale(v: any): v is Locale {
  return LOCALES.some((l) => l.code === v);
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return LOCALES.find((l) => l.code === locale)?.dir ?? "rtl";
}
