export type StarCount = 1 | 2 | 3;

export type Restaurant = {
  id?: string;
  name: string;
  slug: string;
  stars: StarCount;
  city: string | null;
  province: string | null;
  autonomous_community: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cuisine_type: string | null;
  official_website: string | null;
  tasting_menu_url: string | null;
  image_url: string | null;
  michelin_url: string | null;
  is_active: boolean;
  visited: boolean;
  youtube_video_id: string | null;
  youtube_url: string | null;
  visited_source?: string | null;
  matched_confidence?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type RestaurantAlias = {
  id?: string;
  restaurant_id?: string;
  restaurant_slug?: string;
  alias: string;
};

export type YoutubeVideo = {
  id?: string;
  youtube_video_id: string;
  title: string;
  description: string | null;
  published_at: string | null;
  thumbnail_url: string | null;
  url: string | null;
  is_michelin_series: boolean;
  matched_restaurant_id: string | null;
  matched_confidence: number | null;
  needs_review: boolean;
  processed_at: string | null;
  created_at?: string;
  match_reason?: string | null;
};

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at?: string;
};

export type RestaurantFiltersState = {
  query: string;
  stars: StarCount[];
  status: "all" | "visited" | "pending";
  community: string;
};
