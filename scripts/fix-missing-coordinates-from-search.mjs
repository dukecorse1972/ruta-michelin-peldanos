import fs from "node:fs/promises";
import { JSDOM } from "jsdom";

const SEED_PATH = "data/restaurants.seed.json";
const DETAIL_CACHE = ".next/michelin-restaurant-details.json";
const SEARCH_CACHE = ".next/missing-coordinate-search-cache.json";

function hasCoords(value) {
  return Number.isFinite(value?.latitude) && Number.isFinite(value?.longitude);
}

function extractCoords(html) {
  const latitude =
    html.match(/"latitude"\s*:\s*"?([-0-9.]+)"?/)?.[1] ??
    html.match(/"lat"\s*:\s*"?([-0-9.]+)"?/)?.[1];
  const longitude =
    html.match(/"longitude"\s*:\s*"?([-0-9.]+)"?/)?.[1] ??
    html.match(/"lng"\s*:\s*"?([-0-9.]+)"?/)?.[1] ??
    html.match(/"lon"\s*:\s*"?([-0-9.]+)"?/)?.[1];
  if (!latitude || !longitude) {
    return null;
  }
  return {
    latitude: Number(latitude),
    longitude: Number(longitude),
  };
}

function extractAddress(html) {
  const parsed = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, raw]) => {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    })
    .flat()
    .find((item) => item?.["@type"] === "Restaurant" || item?.address);

  const address = parsed?.address;
  if (!address) {
    return null;
  }
  if (typeof address === "string") {
    return address;
  }
  return [
    address.streetAddress,
    address.postalCode,
    address.addressLocality,
    address.addressRegion,
    address.addressCountry,
  ]
    .filter(Boolean)
    .join(", ");
}

async function duckDuckGoResults(query) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const html = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  }).then((response) => response.text());
  const document = new JSDOM(html).window.document;
  return [...document.querySelectorAll(".result")]
    .map((result) => {
      const link = result.querySelector(".result__a");
      const href = link?.getAttribute("href") ?? "";
      let decoded = href;
      try {
        const parsed = new URL(href, "https://duckduckgo.com");
        decoded = parsed.searchParams.get("uddg") ?? href;
      } catch {
        // Keep original href.
      }
      return {
        title: link?.textContent?.trim() ?? "",
        url: decoded,
        snippet: result.querySelector(".result__snippet")?.textContent?.trim() ?? "",
      };
    })
    .filter((result) => result.url.startsWith("http"));
}

async function fetchCandidate(url) {
  let response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ruta-michelin-peldanos/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } catch {
    return null;
  }
  const html = await response.text();
  const coords = extractCoords(html);
  if (!coords) {
    return null;
  }
  return {
    ...coords,
    address: extractAddress(html),
    source_url: url,
  };
}

const restaurants = JSON.parse(await fs.readFile(SEED_PATH, "utf8"));
let detailCache = {};
let searchCache = {};
try {
  detailCache = JSON.parse(await fs.readFile(DETAIL_CACHE, "utf8"));
} catch {
  detailCache = {};
}
try {
  searchCache = JSON.parse(await fs.readFile(SEARCH_CACHE, "utf8"));
} catch {
  searchCache = {};
}

const missing = restaurants.filter((restaurant) => !hasCoords(detailCache[restaurant.michelin_url]));
console.log(`Missing exact coordinates before search: ${missing.length}`);

for (const [index, restaurant] of missing.entries()) {
  if (!searchCache[restaurant.slug]) {
    const query = `${restaurant.name} ${restaurant.city} Michelin restaurant coordinates`;
    process.stdout.write(`[${index + 1}/${missing.length}] ${query}\n`);
    const results = await duckDuckGoResults(query);
    const candidates = results
      .filter((result) =>
        /guide\.michelin|viamichelin|gastronomap|tripadvisor|restaurantguru/i.test(
          result.url,
        ),
      )
      .slice(0, 5);

    let found = null;
    for (const candidate of candidates) {
      found = await fetchCandidate(candidate.url);
      if (found) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    searchCache[restaurant.slug] = found ?? { error: "No coordinate candidate found" };
    await fs.writeFile(SEARCH_CACHE, JSON.stringify(searchCache, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  const detail = searchCache[restaurant.slug];
  if (hasCoords(detail)) {
    restaurant.latitude = detail.latitude;
    restaurant.longitude = detail.longitude;
    restaurant.address = detail.address ?? restaurant.address;
    detailCache[restaurant.michelin_url] = {
      ...(detailCache[restaurant.michelin_url] ?? {}),
      latitude: detail.latitude,
      longitude: detail.longitude,
      address: detail.address ?? restaurant.address,
      source_url: detail.source_url,
      coordinate_source: "search_result",
    };
  }
}

await fs.writeFile(SEED_PATH, `${JSON.stringify(restaurants, null, 2)}\n`);
await fs.writeFile(DETAIL_CACHE, JSON.stringify(detailCache, null, 2));

const stillMissing = restaurants.filter(
  (restaurant) => !hasCoords(detailCache[restaurant.michelin_url]),
);
console.log(`Still missing after search: ${stillMissing.length}`);
if (stillMissing.length) {
  console.log(stillMissing.map((restaurant) => `${restaurant.city} - ${restaurant.name}`).join("\n"));
}
