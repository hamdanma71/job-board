import { NextResponse } from "next/server";
import { scrapeJobs } from "@/lib/scraper";

// This endpoint should be triggered by Vercel Cron or Upstash
// For security, you can check for an Authorization header bearing a CRON_SECRET
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  
  // In production, enforce this!
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  const result = await scrapeJobs();

  if (result.success) {
    return NextResponse.json({ success: true, newJobs: result.count });
  } else {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }
}
