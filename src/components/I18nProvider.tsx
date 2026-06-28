"use client";

import { createContext, useContext } from "react";

type Ctx = { locale: string; dict: Record<string, string> };
const I18nCtx = createContext<Ctx>({ locale: "ar", dict: {} });

export function I18nProvider({ locale, dict, children }: { locale: string; dict: Record<string, string>; children: React.ReactNode }) {
  return <I18nCtx.Provider value={{ locale, dict }}>{children}</I18nCtx.Provider>;
}

/** Client hook: t(key) -> translated string (falls back to the key). */
export function useT() {
  const { dict } = useContext(I18nCtx);
  return (key: string) => dict[key] ?? key;
}

export function useLocale() {
  return useContext(I18nCtx).locale;
}
