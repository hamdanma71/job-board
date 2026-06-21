import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2024-06-20" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } else {
      // For local testing without webhook secret
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.client_reference_id) {
      // Update the company's subscription tier
      const companyId = session.client_reference_id;
      
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1); // 1 month from now

      await prisma.companyProfile.update({
        where: { id: companyId },
        data: {
          subscriptionTier: "PRO",
          subscriptionEndsAt: futureDate,
        },
      });

      console.log(`Company ${companyId} upgraded to PRO`);
    }
  }

  return NextResponse.json({ received: true });
}
