import restaurants from "../data/restaurants.seed.json";
import aliases from "../data/restaurant-aliases.seed.json";
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.local")) {
  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running npm run seed.",
  );
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

async function main() {
  const restaurantSeedRows = restaurants.map((restaurant) =>
    omitMutableRestaurantFields(restaurant as Record<string, unknown>),
  );

  const { data: restaurantRows, error } = await supabase
    .from("restaurants")
    .upsert(restaurantSeedRows, { onConflict: "slug" })
    .select("id, slug");

  if (error) {
    throw error;
  }

  const rowsBySlug = new Map(
    (restaurantRows ?? []).map((restaurant) => [restaurant.slug, restaurant.id]),
  );

  const aliasRows = aliases
    .map((alias) => ({
      restaurant_id: rowsBySlug.get(alias.restaurant_slug),
      alias: alias.alias,
    }))
    .filter((alias) => alias.restaurant_id);

  if (aliasRows.length) {
    const { error: aliasError } = await supabase
      .from("restaurant_aliases")
      .upsert(aliasRows, { onConflict: "restaurant_id,alias" });
    if (aliasError) {
      throw aliasError;
    }
  }

  console.log(
    `Seed complete: ${restaurants.length} restaurants and ${aliasRows.length} aliases.`,
  );
}

function omitMutableRestaurantFields(restaurant: Record<string, unknown>) {
  const staticRestaurant = { ...restaurant };
  delete staticRestaurant.visited;
  delete staticRestaurant.youtube_video_id;
  delete staticRestaurant.youtube_url;
  delete staticRestaurant.visited_source;
  delete staticRestaurant.matched_confidence;
  delete staticRestaurant.created_at;
  delete staticRestaurant.updated_at;
  return staticRestaurant;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
