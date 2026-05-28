import { createServiceClient } from "@/lib/supabase/admin";
import { clearOtherRestaurantVideoAssignments } from "@/lib/restaurants/video-assignments";
import { classifyWithOpenAI } from "@/lib/youtube/openai-classifier";
import { isMichelinSeriesVideo, matchRestaurant } from "@/lib/youtube/matcher";
import type { Restaurant, RestaurantAlias } from "@/lib/types";

type YoutubeChannelPayload = {
  items?: Array<{
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type YoutubePlaylistItem = {
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails?: { medium?: { url: string }; high?: { url: string } };
    resourceId?: { videoId?: string };
  };
};

type YoutubePlaylistPayload = {
  items?: YoutubePlaylistItem[];
  nextPageToken?: string;
};

type SyncYoutubeOptions = {
  maxPages?: number;
};

export async function syncYoutubeVideos(options: SyncYoutubeOptions = {}) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    throw new Error("YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID are required.");
  }

  const supabase = createServiceClient();
  const [{ data: restaurants }, { data: aliases }] = await Promise.all([
    supabase.from("restaurants").select("*").eq("is_active", true),
    supabase.from("restaurant_aliases").select("*, restaurants(slug)"),
  ]);

  const restaurantRows = (restaurants ?? []) as Restaurant[];
  const aliasRows = ((aliases ?? []) as Array<
    RestaurantAlias & { restaurants?: { slug: string } }
  >).map((alias) => ({
    ...alias,
    restaurant_slug: alias.restaurant_slug ?? alias.restaurants?.slug,
  }));

  const processed = [];
  let scanned = 0;
  let pageToken: string | undefined;
  let pageCount = 0;
  const maxPages = options.maxPages ?? Number(process.env.YOUTUBE_SYNC_MAX_PAGES ?? "3");
  const uploadsPlaylistId = await getUploadsPlaylistId(apiKey, channelId);

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("playlistId", uploadsPlaylistId);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("maxResults", "50");

    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const payload = (await response.json()) as YoutubePlaylistPayload;
    pageCount += 1;
    pageToken = payload.nextPageToken;

    for (const item of payload.items ?? []) {
      const youtubeVideoId = item.snippet.resourceId?.videoId;

      if (!youtubeVideoId) {
        continue;
      }

      scanned += 1;
      const videoUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
      const thumbnail =
        item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.medium?.url;
      const isSeries = isMichelinSeriesVideo({
        title: item.snippet.title,
        description: item.snippet.description,
      });

      if (!isSeries) {
        continue;
      }

      let match = matchRestaurant(
        {
          title: item.snippet.title,
          description: item.snippet.description,
        },
        restaurantRows,
        aliasRows,
      );

      if (!match || match.confidence < 0.85) {
        const aiResult = await classifyWithOpenAI({
          title: item.snippet.title,
          description: item.snippet.description,
          restaurants: restaurantRows,
        });
        const aiRestaurant = restaurantRows.find(
          (restaurant) => restaurant.slug === aiResult?.restaurant_slug,
        );
        if (
          aiRestaurant &&
          aiResult &&
          aiResult.confidence > (match?.confidence ?? 0)
        ) {
          match = {
            restaurant: aiRestaurant,
            confidence: aiResult.confidence,
            strategy: "fuzzy",
            reason: aiResult.reason,
          };
        }
      }

      const canAutoVisit = Boolean(
        match?.restaurant && match.confidence >= 0.85,
      );

      const { data: video } = await supabase
        .from("youtube_videos")
        .upsert(
          {
            youtube_video_id: youtubeVideoId,
            title: item.snippet.title,
            description: item.snippet.description,
            published_at: item.snippet.publishedAt,
            thumbnail_url: thumbnail,
            url: videoUrl,
            is_michelin_series: true,
            matched_restaurant_id: canAutoVisit ? match?.restaurant?.id : null,
            matched_confidence: match?.confidence ?? null,
            needs_review: !canAutoVisit,
            processed_at: new Date().toISOString(),
            match_reason: match?.reason ?? null,
          },
          { onConflict: "youtube_video_id" },
        )
        .select()
        .single();

      if (canAutoVisit && match?.restaurant?.id) {
        await clearOtherRestaurantVideoAssignments(
          supabase,
          youtubeVideoId,
          match.restaurant.id,
        );

        await supabase
          .from("restaurants")
          .update({
            visited: true,
            youtube_video_id: youtubeVideoId,
            youtube_url: videoUrl,
            visited_source: "youtube_auto",
            matched_confidence: match.confidence,
          })
          .eq("id", match.restaurant.id);
      } else {
        await clearOtherRestaurantVideoAssignments(supabase, youtubeVideoId);
      }

      processed.push(video);
    }
  } while (pageToken && pageCount < maxPages);

  return {
    scanned,
    saved: processed.length,
    videos: processed,
  };
}

async function getUploadsPlaylistId(apiKey: string, channelId: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("id", channelId);
  url.searchParams.set("part", "contentDetails");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const payload = (await response.json()) as YoutubeChannelPayload;
  const uploadsPlaylistId =
    payload.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    throw new Error("Could not find the YouTube uploads playlist.");
  }

  return uploadsPlaylistId;
}
