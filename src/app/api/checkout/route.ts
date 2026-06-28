import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2024-06-20" as any,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    let company = await prisma.companyProfile.findUnique({ where: { userId } });

    if (!company) {
      // Create a basic company profile if it doesn't exist so they can checkout
      company = await prisma.companyProfile.create({
        data: {
          userId,
          companyName: (session.user as any).name || "شركة جديدة",
        }
      });
    }

    // In a real app, you would pass the specific price ID based on the selected tier.
    // Here we use a mock approach or generic one for "PRO" tier
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aed",
            product_data: {
              name: "باقة المحترفين (PRO)",
              description: "نشر وظائف غير محدود وأدوات ذكاء اصطناعي",
            },
            unit_amount: 19900, // 199.00 AED
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/employer?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      client_reference_id: company.id, // we use this in webhook to identify the company
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
