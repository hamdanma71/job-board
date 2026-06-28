import data from "@/data/countries-full.json";

export type WorldCountry = { id: string; name: string; flag: string; currency: string; currencyName: string; nationality: string };

export const WORLD_COUNTRIES = data as WorldCountry[];

export function countryById(id: string): WorldCountry | undefined {
  return WORLD_COUNTRIES.find((c) => c.id === id);
}

export function countryByName(name: string): WorldCountry | undefined {
  return WORLD_COUNTRIES.find((c) => c.name === name);
}

// All nationalities (deduped, sorted) for nationality pickers.
export const NATIONALITIES = Array.from(new Set(WORLD_COUNTRIES.map((c) => c.nationality))).sort((a, b) => a.localeCompare(b, "ar"));
