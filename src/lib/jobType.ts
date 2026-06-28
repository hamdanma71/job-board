/** Single source of truth for job-type labels (avoids inconsistent inline maps). */
export const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "دوام كامل",
  PART_TIME: "دوام جزئي",
  CONTRACT: "عقد",
  REMOTE: "عن بعد",
  INTERNSHIP: "تدريب",
};

export function jobTypeLabel(type: string): string {
  return JOB_TYPE_LABELS[type] || type;
}
