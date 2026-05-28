"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { clearOtherRestaurantVideoAssignments } from "@/lib/restaurants/video-assignments";
import { createServiceClient } from "@/lib/supabase/admin";
import { syncYoutubeVideos } from "@/lib/youtube/sync";

export async function updateRestaurantAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const youtubeUrl = String(formData.get("youtube_url") ?? "") || null;
  const youtubeVideoId = String(formData.get("youtube_video_id") ?? "") || null;

  const supabase = createServiceClient();
  if (youtubeVideoId) {
    await clearOtherRestaurantVideoAssignments(supabase, youtubeVideoId, id);
  }

  await supabase
    .from("restaurants")
    .update({
      name: String(formData.get("name")),
      stars: Number(formData.get("stars")),
      city: String(formData.get("city") ?? ""),
      province: String(formData.get("province") ?? ""),
      autonomous_community: String(formData.get("autonomous_community") ?? ""),
      cuisine_type: String(formData.get("cuisine_type") ?? ""),
      official_website: String(formData.get("official_website") ?? "") || null,
      tasting_menu_url: String(formData.get("tasting_menu_url") ?? "") || null,
      michelin_url: String(formData.get("michelin_url") ?? "") || null,
      visited: formData.get("visited") === "on",
      youtube_video_id: youtubeVideoId,
      youtube_url: youtubeUrl,
      visited_source: youtubeUrl ? "admin" : null,
    })
    .eq("id", id)
    .throwOnError();

  revalidatePath("/");
  revalidatePath("/admin/restaurants");
}

export async function resolveVideoAction(formData: FormData) {
  await requireAdmin();
  const videoId = String(formData.get("video_id"));
  const restaurantId = String(formData.get("restaurant_id"));
  const youtubeVideoId = String(formData.get("youtube_video_id"));
  const youtubeUrl = String(formData.get("youtube_url"));

  const supabase = createServiceClient();
  await clearOtherRestaurantVideoAssignments(supabase, youtubeVideoId, restaurantId);

  await supabase
    .from("restaurants")
    .update({
      visited: true,
      youtube_video_id: youtubeVideoId,
      youtube_url: youtubeUrl,
      visited_source: "admin",
      matched_confidence: 1,
    })
    .eq("id", restaurantId)
    .throwOnError();

  await supabase
    .from("youtube_videos")
    .update({
      matched_restaurant_id: restaurantId,
      matched_confidence: 1,
      needs_review: false,
      processed_at: new Date().toISOString(),
      match_reason: "Resuelto manualmente en admin.",
    })
    .eq("id", videoId)
    .throwOnError();

  revalidatePath("/");
  revalidatePath("/admin/videos");
}

export async function rerunYoutubeSyncAction() {
  await requireAdmin();
  await syncYoutubeVideos();
  revalidatePath("/admin/videos");
}
