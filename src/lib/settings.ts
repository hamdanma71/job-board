import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/locales";

const ENABLED_LOCALES_KEY = "enabledLocales";

/**
 * Locales the admin has enabled for the public language switcher.
 * Defaults to every registered locale. The default locale (Arabic) is always
 * kept enabled so the site never ends up with zero languages.
 * Wrapped in React cache() to dedupe the DB read across server components in one request.
 */
export const getEnabledLocales = cache(async (): Promise<Locale[]> => {
  const all = LOCALES.map((l) => l.code);
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: ENABLED_LOCALES_KEY } });
    if (!row) return all;
    const saved = JSON.parse(row.value) as string[];
    const enabled = all.filter((c) => saved.includes(c));
    // Default locale is always enabled so the site never has zero languages.
    if (!enabled.includes(DEFAULT_LOCALE)) enabled.unshift(DEFAULT_LOCALE);
    return enabled;
  } catch {
    return all;
  }
});

export async function setEnabledLocales(codes: string[]): Promise<void> {
  const valid = LOCALES.map((l) => l.code).filter((c) => codes.includes(c));
  if (!valid.includes(DEFAULT_LOCALE)) valid.unshift(DEFAULT_LOCALE);
  await prisma.appSetting.upsert({
    where: { key: ENABLED_LOCALES_KEY },
    create: { key: ENABLED_LOCALES_KEY, value: JSON.stringify(valid) },
    update: { value: JSON.stringify(valid) },
  });
}
