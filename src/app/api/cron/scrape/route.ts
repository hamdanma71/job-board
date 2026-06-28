import { NextResponse } from "next/server";
import { scrapeJobs } from "@/lib/scraper";

// This endpoint should be triggered by Vercel Cron or Upstash
// For security, you can check for an Authorization header bearing a CRON_SECRET
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Fail closed: this endpoint writes to the database, so it must not be public.
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await scrapeJobs();

  if (result.success) {
    return NextResponse.json({
      success: true,
      newJobs: result.count,
      errors: result.errors,
      deactivated: result.deactivated,
    });
  } else {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }
}
