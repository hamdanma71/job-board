"use client";

import { useState } from "react";
import { WORLD_COUNTRIES, countryById, type WorldCountry } from "@/lib/worldCountries";
import { useT } from "@/components/I18nProvider";

// A full world-country dropdown that auto-shows the selected country's currency.
export default function CountrySelect({
  label,
  initialId = "",
  onSelect,
  showCurrency = true,
}: {
  label?: string;
  initialId?: string;
  onSelect?: (country: WorldCountry | null) => void;
  showCurrency?: boolean;
}) {
  const t = useT();
  const [id, setId] = useState(initialId);
  const selected = id ? countryById(id) : undefined;

  const change = (val: string) => {
    setId(val);
    onSelect?.(val ? countryById(val) || null : null);
  };

  return (
    <div className="input-group" style={{ margin: 0 }}>
      <label className="input-label">{label ?? t("countrySel.label")}</label>
      <select className="input-field" value={id} onChange={(e) => change(e.target.value)}>
        <option value="">{t("countrySel.choose")}</option>
        {WORLD_COUNTRIES.map((c) => (
          <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
        ))}
      </select>
      {showCurrency && selected && (
        <span className="text-muted" style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}>
          💱 {t("countrySel.currency")} {selected.currencyName} ({selected.currency})
        </span>
      )}
    </div>
  );
}
