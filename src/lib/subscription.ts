/**
 * Single source of truth for "can this company post jobs?".
 *
 * A company is active when it is on the PRO tier AND the subscription has not
 * expired. `subscriptionEndsAt == null` is treated as no-expiry (e.g. manually
 * granted PRO); a past date blocks posting until renewal. Used by both
 * /api/employer/jobs and /api/jobs so the Stripe gate cannot be bypassed.
 */
export function hasActiveSubscription(
  company:
    | { subscriptionTier?: string | null; subscriptionEndsAt?: Date | string | null }
    | null
    | undefined
): boolean {
  if (company?.subscriptionTier !== "PRO") return false;
  if (!company.subscriptionEndsAt) return true; // no expiry set => active
  return new Date(company.subscriptionEndsAt) > new Date();
}
