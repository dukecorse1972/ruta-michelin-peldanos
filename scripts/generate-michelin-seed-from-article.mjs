import fs from "node:fs/promises";
import { JSDOM } from "jsdom";

const ARTICLE_HTML = ".next/michelin-article.html";
const OUT = "data/restaurants.seed.json";
const SOURCE_URL =
  "https://guide.michelin.com/es/es/articulo/michelin-guide-ceremony/todos-los-restaurantes-con-estrellas-michelin-en-espana-2026";

const communityBySlug = {
  andalucia: "Andalucía",
  aragon: "Aragón",
  canarias: "Canarias",
  cantabria: "Cantabria",
  "castilla-la-mancha": "Castilla-La Mancha",
  "castilla-y-leon": "Castilla y León",
  catalunya: "Cataluña",
  "comunidad-de-madrid": "Comunidad de Madrid",
  "comunidad-foral-de-navarra": "Comunidad Foral de Navarra",
  "comunidad-valenciana": "Comunitat Valenciana",
  "comunitat-valenciana": "Comunitat Valenciana",
  extremadura: "Extremadura",
  galicia: "Galicia",
  "islas-baleares": "Illes Balears",
  "la-rioja": "La Rioja",
  "pais-vasco": "País Vasco",
  "principado-de-asturias": "Principado de Asturias",
  "region-de-murcia": "Región de Murcia",
};

const provinceByCommunity = {
  "Comunidad de Madrid": "Madrid",
  "Comunidad Foral de Navarra": "Navarra",
  "La Rioja": "La Rioja",
  "Región de Murcia": "Murcia",
  Cantabria: "Cantabria",
  "Principado de Asturias": "Asturias",
  "Illes Balears": "Illes Balears",
};

const coordinateOverrides = {
  Alcoseebre: { latitude: 40.2426, longitude: 0.2786 },
};

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function cleanText(value) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\u202f/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cityFromLi(li) {
  let value = "";
  for (const node of li.childNodes) {
    if (node.nodeType === 1 && node.matches("a")) {
      break;
    }
    if (node.nodeType === 1 && node.querySelector("a")) {
      break;
    }
    value += node.textContent ?? "";
  }

  return cleanText(value)
    .replace(/NOVEDAD/g, "")
    .replace(/\s*[–—-]\s*$/g, "")
    .replace(/\s+–\s+/g, "-")
    .trim();
}

function restaurantFromLi(li, index) {
  const anchor = li.querySelector('a[href*="/restaurante/"]');
  const michelinUrl = anchor.href;
  const parts = new URL(michelinUrl).pathname.split("/").filter(Boolean);
  const community = communityBySlug[parts[2]] ?? null;
  const city = cityFromLi(li);
  const name = cleanText(anchor.textContent);
  const stars = index < 16 ? 3 : index < 53 ? 2 : 1;
  return {
    name,
    slug: slugify(name),
    stars,
    city,
    province: provinceByCommunity[community] ?? null,
    autonomous_community: community,
    address: null,
    latitude: null,
    longitude: null,
    cuisine_type: null,
    official_website: null,
    tasting_menu_url: null,
    image_url: null,
    michelin_url: michelinUrl,
    is_active: true,
    visited: false,
    youtube_video_id: null,
    youtube_url: null,
  };
}

async function geocodeCity(city) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "es");
  url.searchParams.set("q", `${city}, España`);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ruta-michelin-peldanos/1.0 (local seed generation)",
    },
  });
  if (!response.ok) {
    return null;
  }
  const [result] = await response.json();
  if (!result) {
    return null;
  }
  return {
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  };
}

const html = await fs.readFile(ARTICLE_HTML, "utf8");
const document = new JSDOM(html).window.document;
const allItems = [...document.querySelectorAll("li")].filter((li) =>
  li.querySelector('a[href*="/restaurante/"]'),
);

if (allItems.length !== 307) {
  throw new Error(`Expected 307 Michelin entries, found ${allItems.length}`);
}

const restaurants = allItems
  .map(restaurantFromLi)
  .filter((restaurant) => restaurant.city !== "Soldeu");

if (restaurants.length !== 306) {
  throw new Error(`Expected 306 Spain restaurants, found ${restaurants.length}`);
}

const cachePath = ".next/michelin-city-geocodes.json";
let cache = {};
try {
  cache = JSON.parse(await fs.readFile(cachePath, "utf8"));
} catch {
  cache = {};
}

const cities = [...new Set(restaurants.map((restaurant) => restaurant.city))].sort();
for (const city of cities) {
  if (cache[city]) {
    continue;
  }
  if (coordinateOverrides[city]) {
    cache[city] = coordinateOverrides[city];
    continue;
  }
  process.stdout.write(`Geocoding ${city}\n`);
  cache[city] = await geocodeCity(city);
  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2));
  await new Promise((resolve) => setTimeout(resolve, 1100));
}

const withCoordinates = restaurants.map((restaurant) => ({
  ...restaurant,
  ...(cache[restaurant.city] ?? {}),
}));

await fs.writeFile(OUT, `${JSON.stringify(withCoordinates, null, 2)}\n`);
console.log(
  `Wrote ${withCoordinates.length} restaurants from ${SOURCE_URL} to ${OUT}`,
);
