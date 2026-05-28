import fs from "node:fs/promises";

const SEED_PATH = "data/restaurants.seed.json";
const CACHE_PATH = ".next/michelin-restaurant-details.json";

function firstJsonLdRestaurant(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const [, raw] of blocks) {
    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const restaurant = items.find((item) => item?.["@type"] === "Restaurant");
      if (restaurant) {
        return restaurant;
      }
    } catch {
      // Ignore unrelated JSON-LD blocks.
    }
  }
  return null;
}

function cleanAddress(address) {
  if (!address) {
    return null;
  }
  return [
    address.streetAddress,
    address.postalCode,
    address.addressLocality,
    address.addressRegion,
  ]
    .filter(Boolean)
    .join(", ");
}

function normalizeDetail(detail) {
  if (!detail) {
    return null;
  }

  return {
    address: cleanAddress(detail.address),
    latitude:
      typeof detail.latitude === "number" ? detail.latitude : Number(detail.latitude),
    longitude:
      typeof detail.longitude === "number"
        ? detail.longitude
        : Number(detail.longitude),
    cuisine_type: detail.servesCuisine ?? null,
    image_url: detail.image ?? null,
  };
}

async function fetchDetail(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ruta-michelin-peldanos/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Michelin returned ${response.status}`);
  }

  const html = await response.text();
  return normalizeDetail(firstJsonLdRestaurant(html));
}

const restaurants = JSON.parse(await fs.readFile(SEED_PATH, "utf8"));
let cache = {};
try {
  cache = JSON.parse(await fs.readFile(CACHE_PATH, "utf8"));
} catch {
  cache = {};
}

for (let index = 0; index < restaurants.length; index += 1) {
  const restaurant = restaurants[index];
  if (!restaurant.michelin_url) {
    continue;
  }

  if (
    !cache[restaurant.michelin_url] ||
    cache[restaurant.michelin_url]?.error ||
    !Number.isFinite(cache[restaurant.michelin_url]?.latitude) ||
    !Number.isFinite(cache[restaurant.michelin_url]?.longitude)
  ) {
    process.stdout.write(
      `[${index + 1}/${restaurants.length}] ${restaurant.name}\n`,
    );
    try {
      cache[restaurant.michelin_url] = await fetchDetail(restaurant.michelin_url);
    } catch (error) {
      cache[restaurant.michelin_url] = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
    await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  const detail = cache[restaurant.michelin_url];
  if (detail && !detail.error) {
    restaurant.address = detail.address ?? restaurant.address;
    restaurant.latitude = Number.isFinite(detail.latitude)
      ? detail.latitude
      : restaurant.latitude;
    restaurant.longitude = Number.isFinite(detail.longitude)
      ? detail.longitude
      : restaurant.longitude;
    restaurant.cuisine_type = detail.cuisine_type ?? restaurant.cuisine_type;
    restaurant.image_url = detail.image_url ?? restaurant.image_url;
  }
}

await fs.writeFile(SEED_PATH, `${JSON.stringify(restaurants, null, 2)}\n`);

const exact = restaurants.filter(
  (restaurant) =>
    cache[restaurant.michelin_url] &&
    !cache[restaurant.michelin_url].error &&
    Number.isFinite(cache[restaurant.michelin_url].latitude) &&
    Number.isFinite(cache[restaurant.michelin_url].longitude),
).length;
const missing = restaurants.length - exact;
console.log(`Updated ${restaurants.length} restaurants. Exact Michelin coords: ${exact}. Missing: ${missing}.`);
