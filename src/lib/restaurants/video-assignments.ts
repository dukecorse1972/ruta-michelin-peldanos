import type { createServiceClient } from "@/lib/supabase/admin";

type ServiceClient = ReturnType<typeof createServiceClient>;

export async function clearOtherRestaurantVideoAssignments(
  supabase: ServiceClient,
  youtubeVideoId: string,
  keepRestaurantId?: string,
) {
  let query = supabase
    .from("restaurants")
    .update({
      visited: false,
      youtube_video_id: null,
      youtube_url: null,
      visited_source: null,
      matched_confidence: null,
    })
    .eq("youtube_video_id", youtubeVideoId)
    .in("visited_source", ["youtube_auto", "admin"]);

  if (keepRestaurantId) {
    query = query.neq("id", keepRestaurantId);
  }

  await query.throwOnError();
}
