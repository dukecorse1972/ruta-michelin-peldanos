import { AdminVideoReviewTable } from "@/components/admin-video-review-table";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getRestaurants } from "@/lib/restaurants";
import type { YoutubeVideo } from "@/lib/types";

export default async function AdminVideosPage() {
  const restaurants = await getRestaurants();
  let videos: YoutubeVideo[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("youtube_videos")
      .select("*")
      .order("published_at", { ascending: false });
    videos = (data ?? []) as YoutubeVideo[];
  }

  return <AdminVideoReviewTable restaurants={restaurants} videos={videos} />;
}
