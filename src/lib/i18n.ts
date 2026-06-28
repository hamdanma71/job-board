import { cookies } from "next/headers";
import { cache } from "react";
import { en } from "@/locales/en";
import { DICTS } from "@/locales/dicts.generated";
import { type Locale, DEFAULT_LOCALE, isLocale } from "@/lib/locales";

export type Dict = Record<string, string>;
export type { Locale } from "@/lib/locales";
export { LOCALES, DEFAULT_LOCALE, dirOf, isLocale } from "@/lib/locales";

// Merged dictionaries are built once per locale and cached for the process
// (English is the fallback layer: any key missing from a partial translation
// renders in English, never as a raw key).
const _dictCache = new Map<Locale, Dict>();

export function getDictionary(locale: Locale): Dict {
  const key = DICTS[locale] ? locale : DEFAULT_LOCALE;
  let d = _dictCache.get(key);
  if (!d) {
    d = { ...en, ...DICTS[key] };
    _dictCache.set(key, d);
  }
  return d;
}

/**
 * Server-side: resolve the active locale from the cookie. Wrapped in React
 * cache() so the cookie is read once per request even when multiple server
 * components (layout, Navbar, Footer, pages) ask for it.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  try {
    const c = (await cookies()).get("locale")?.value;
    return isLocale(c) ? c : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
});
