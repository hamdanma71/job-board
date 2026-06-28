/**
 * Single source of truth for the ATS pipeline (vision item 7 — 7 stages).
 * Used by the status updater, the employer ATS view, and the PATCH API so the
 * stages, Arabic labels, and colors never drift apart.
 */
export const APPLICATION_STATUSES = [
  "PENDING",    // مرشّح جديد
  "REVIEWING",  // قيد المراجعة
  "QUALIFIED",  // مؤهّل
  "INTERVIEW",  // مقابلة
  "OFFER",      // عرض وظيفي
  "HIRED",      // تم التعيين
  "REJECTED",   // مرفوض
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "مرشّح جديد",
  REVIEWING: "قيد المراجعة",
  QUALIFIED: "مؤهّل",
  INTERVIEW: "مقابلة",
  OFFER: "عرض وظيفي",
  HIRED: "تم التعيين",
  REJECTED: "مرفوض",
  // Back-compat aliases for any pre-existing rows.
  REVIEWED: "قيد المراجعة",
  ACCEPTED: "عرض وظيفي",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "#64748b",
  REVIEWING: "#0ea5e9",
  QUALIFIED: "#6366f1",
  INTERVIEW: "#f59e0b",
  OFFER: "#8b5cf6",
  HIRED: "#16a34a",
  REJECTED: "#ef4444",
  REVIEWED: "#0ea5e9",
  ACCEPTED: "#8b5cf6",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

export function statusColor(status: string): string {
  return STATUS_COLORS[status] || "#64748b";
}

export function isValidStatus(status: unknown): status is ApplicationStatus {
  return typeof status === "string" && (APPLICATION_STATUSES as readonly string[]).includes(status);
}
