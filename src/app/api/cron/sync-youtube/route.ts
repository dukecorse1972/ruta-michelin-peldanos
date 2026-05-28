import { NextResponse } from "next/server";
import { syncYoutubeVideos } from "@/lib/youtube/sync";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const result = await syncYoutubeVideos({
    maxPages: searchParams.get("full") === "1" ? 100 : undefined,
  });

  return NextResponse.json({
    ok: true,
    scanned: result.scanned,
    saved: result.saved,
    processed: result.saved,
  });
}
