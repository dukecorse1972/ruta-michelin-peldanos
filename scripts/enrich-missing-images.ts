import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

type SeedRestaurant = {
  slug: string;
  name: string;
  image_url: string | null;
  michelin_url: string | null;
};

type VideoWithRestaurant = {
  youtube_video_id: string;
  thumbnail_url: string | null;
  restaurants: {
    slug: string;
    name: string;
    image_url: string | null;
  } | null;
};

const SEED_PATH = "data/restaurants.seed.json";
const CACHE_PATH = ".next/michelin-image-enrichment.json";

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running image enrichment.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const seed = JSON.parse(readFileSync(SEED_PATH, "utf8")) as SeedRestaurant[];
const cache = readJson<Record<string, string | null>>(CACHE_PATH, {});
const seedBySlug = new Map(seed.map((restaurant) => [restaurant.slug, restaurant]));
const updates = new Map<string, string>();

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  for (const restaurant of seed) {
    if (restaurant.image_url || !restaurant.michelin_url) {
      continue;
    }

    if (!(restaurant.michelin_url in cache)) {
      process.stdout.write(`Trying Michelin image: ${restaurant.name}\n`);
      cache[restaurant.michelin_url] = await fetchMichelinImage(
        restaurant.michelin_url,
      );
      writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`);
      await wait(200);
    }

    const imageUrl = cache[restaurant.michelin_url];
    if (imageUrl) {
      updates.set(restaurant.slug, imageUrl);
    }
  }

  const { data: videos, error: videoError } = await supabase
    .from("youtube_videos")
    .select("youtube_video_id, thumbnail_url, restaurants(slug, name, image_url)")
    .not("matched_restaurant_id", "is", null)
    .returns<VideoWithRestaurant[]>();

  if (videoError) {
    throw videoError;
  }

  for (const video of videos ?? []) {
    const restaurant = video.restaurants;
    if (!restaurant || restaurant.image_url || !video.thumbnail_url) {
      continue;
    }

    const seedRestaurant = seedBySlug.get(restaurant.slug);
    if (seedRestaurant?.image_url) {
      continue;
    }

    updates.set(restaurant.slug, video.thumbnail_url);
  }

  for (const [slug, imageUrl] of updates) {
    const seedRestaurant = seedBySlug.get(slug);
    if (seedRestaurant && !seedRestaurant.image_url) {
      seedRestaurant.image_url = imageUrl;
    }

    const { error } = await supabase
      .from("restaurants")
      .update({ image_url: imageUrl })
      .eq("slug", slug)
      .is("image_url", null);

    if (error) {
      throw error;
    }
  }

  writeFileSync(SEED_PATH, `${JSON.stringify(seed, null, 2)}\n`);

  const missing = seed.filter((restaurant) => !restaurant.image_url).length;
  console.log(
    `Image enrichment complete: ${updates.size} updated. Missing images in seed: ${missing}.`,
  );
}

function loadEnv() {
  if (!existsSync(".env.local")) {
    return;
  }

  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

function readJson<T>(path: string, fallback: T) {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function fetchMichelinImage(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ruta-michelin-peldanos/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok || response.status === 202) {
    return null;
  }

  const html = await response.text();
  return (
    parseJsonLdImage(html) ??
    matchMetaImage(html) ??
    matchCloudImage(html)
  );
}

function parseJsonLdImage(html: string) {
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ];

  for (const [, raw] of blocks) {
    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const image = item?.image;
        if (typeof image === "string" && isImageUrl(image)) {
          return image;
        }
        if (Array.isArray(image)) {
          const first = image.find((value) => typeof value === "string" && isImageUrl(value));
          if (first) {
            return first;
          }
        }
      }
    } catch {
      // Ignore unrelated JSON-LD.
    }
  }

  return null;
}

function matchMetaImage(html: string) {
  return (
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1] ??
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)/i)?.[1] ??
    null
  );
}

function matchCloudImage(html: string) {
  return (
    html.match(/https:\/\/axwwgrkdco\.cloudimg\.io\/[^"'\s<>]+?(?:jpg|jpeg|png|webp)(?:\?[^"'\s<>]*)?/i)?.[0] ??
    null
  );
}

function isImageUrl(value: string) {
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(value);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
