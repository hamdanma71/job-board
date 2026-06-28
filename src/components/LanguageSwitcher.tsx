"use client";

import { useRouter } from "next/navigation";
import { LOCALES, dirOf, type Locale } from "@/lib/locales";
import { useLocale } from "@/components/I18nProvider";

export default function LanguageSwitcher({ enabled }: { enabled?: string[] }) {
  const router = useRouter();
  const locale = useLocale();

  const setLocale = (code: string) => {
    const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; secure" : "";
    document.cookie = `locale=${code}; path=/; max-age=31536000; samesite=lax${secure}`;
    // Flip the whole platform's direction/lang immediately so RTL<->LTR switches
    // take effect without waiting for a full reload.
    if (typeof document !== "undefined") {
      document.documentElement.lang = code;
      document.documentElement.dir = dirOf(code as Locale);
    }
    router.refresh();
  };

  // Only show admin-enabled languages (defaults to all when no list is passed).
  const list = enabled && enabled.length ? LOCALES.filter((l) => enabled.includes(l.code)) : LOCALES;

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      className="input-field"
      style={{ padding: "0.35rem 0.6rem", fontSize: "0.85rem", width: "auto", cursor: "pointer" }}
    >
      {list.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}
