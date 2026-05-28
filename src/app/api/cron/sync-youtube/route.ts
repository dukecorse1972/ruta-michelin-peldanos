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

  const missingEnv = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "YOUTUBE_API_KEY",
    "YOUTUBE_CHANNEL_ID",
  ].filter((key) => !process.env[key]);

  if (missingEnv.length) {
    return NextResponse.json(
      { error: "Missing cron environment variables.", missingEnv },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  let result;

  try {
    result = await syncYoutubeVideos({
      maxPages: searchParams.get("full") === "1" ? 100 : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "YouTube sync failed.",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    scanned: result.scanned,
    saved: result.saved,
    processed: result.saved,
  });
}
