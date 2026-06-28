/**
 * Canonical skills serialization. The `skills` column stores a JSON array
 * string; every writer should normalize via this helper so the column never
 * drifts into mixed JSON/CSV forms.
 */
export function serializeSkills(input: unknown): string {
  let arr: string[] = [];
  if (Array.isArray(input)) {
    arr = input.map((s) => String(s));
  } else if (typeof input === "string") {
    const t = input.trim();
    if (t.startsWith("[")) {
      try {
        const p = JSON.parse(t);
        arr = Array.isArray(p) ? p.map((s: any) => String(s)) : t.split(",");
      } catch {
        arr = t.split(",");
      }
    } else if (t.length) {
      arr = t.split(",");
    }
  }
  arr = arr.map((s) => s.trim()).filter(Boolean);
  return JSON.stringify(arr);
}

/** Parse a stored skills value back into an array, tolerating legacy CSV. */
export function parseSkills(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const p = JSON.parse(value);
    if (Array.isArray(p)) return p.map((s) => String(s).trim()).filter(Boolean);
  } catch {
    /* fall through to CSV */
  }
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}
