import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(stripeSecretKey || "sk_test_mock", {
  apiVersion: "2024-06-20" as any,
});

export async function POST(req: Request) {
  // Fail closed: never trust an unsigned body. A missing secret means the
  // webhook is misconfigured, not that we should accept forged events.
  if (!stripeSecretKey || !endpointSecret) {
    console.error("Stripe webhook not configured (missing STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET).");
    return new Response("Webhook not configured", { status: 500 });
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only upgrade once the payment is actually completed.
    if (session.payment_status === "paid" && session.client_reference_id) {
      const companyId = session.client_reference_id;

      // Idempotency: if this event was already processed, acknowledge and stop.
      const already = await prisma.payment.findUnique({ where: { stripeEventId: event.id } });
      if (already) {
        return NextResponse.json({ received: true, duplicate: true });
      }

      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1); // 1 month from now

      try {
        await prisma.companyProfile.update({
          where: { id: companyId },
          data: {
            subscriptionTier: "PRO",
            subscriptionEndsAt: futureDate,
          },
        });
        // Record the payment in the revenue ledger.
        await prisma.payment.create({
          data: {
            amount: session.amount_total ?? 0,
            currency: session.currency ?? "aed",
            status: "paid",
            stripeEventId: event.id,
            description: "اشتراك باقة المحترفين (PRO)",
            companyId,
          },
        });
        console.log(`Company ${companyId} upgraded to PRO`);
      } catch (err: any) {
        // Return non-2xx so Stripe retries instead of silently dropping the upgrade.
        console.error(`Failed to process payment for company ${companyId}: ${err.message}`);
        return new Response("Subscription update failed", { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
