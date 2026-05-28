import Fuse from "fuse.js";
import { normalizeText } from "@/lib/utils";
import type { Restaurant, RestaurantAlias } from "@/lib/types";

export type MatchInput = {
  title: string;
  description?: string | null;
};

export type MatchResult = {
  restaurant: Restaurant | null;
  confidence: number;
  strategy: "direct" | "alias" | "fuzzy" | "none";
  reason: string;
};

export function isMichelinSeriesVideo(input: MatchInput) {
  const haystack = normalizeText(`${input.title} ${input.description ?? ""}`);
  return (
    /\bdia\s+\d+\b/.test(haystack) &&
    /(michelin|estrella|restaurante|menu|degustacion)/.test(haystack)
  );
}

export function matchRestaurant(
  input: MatchInput,
  restaurants: Restaurant[],
  aliases: RestaurantAlias[] = [],
): MatchResult {
  const title = normalizeText(input.title);
  const description = normalizeText(input.description ?? "");
  const titleSubject = getTitleSubject(input.title);
  const haystack = `${title} ${description}`;

  if (titleSubject) {
    const titleMatch = findDirectMatch(titleSubject, restaurants, aliases);

    if (titleMatch) {
      return titleMatch;
    }
  }

  const directMatch = findDirectMatch(haystack, restaurants, aliases);

  if (directMatch) {
    return directMatch;
  }

  const fuse = new Fuse(restaurants, {
    keys: ["name", "city", "province"],
    includeScore: true,
    threshold: 0.35,
  });
  const [result] = fuse.search(titleSubject || haystack);

  if (result?.item && typeof result.score === "number") {
    const confidence = Math.max(0, Math.min(0.86, 1 - result.score));
    return {
      restaurant: result.item,
      confidence,
      strategy: "fuzzy",
      reason: `Coincidencia fuzzy con puntuacion ${result.score.toFixed(2)}.`,
    };
  }

  return {
    restaurant: null,
    confidence: 0,
    strategy: "none",
    reason: "No se encontro una coincidencia fiable.",
  };
}

function findDirectMatch(
  haystack: string,
  restaurants: Restaurant[],
  aliases: RestaurantAlias[],
) {
  for (const restaurant of restaurants) {
    if (containsNormalizedTerm(haystack, normalizeText(restaurant.name))) {
      return {
        restaurant,
        confidence: 0.96,
        strategy: "direct" as const,
        reason: `El titulo o la descripcion contienen "${restaurant.name}".`,
      };
    }
  }

  for (const alias of aliases) {
    const restaurant = restaurants.find(
      (item) =>
        item.id === alias.restaurant_id || item.slug === alias.restaurant_slug,
    );

    if (restaurant && containsNormalizedTerm(haystack, normalizeText(alias.alias))) {
      return {
        restaurant,
        confidence: 0.92,
        strategy: "alias" as const,
        reason: `Coincide con el alias "${alias.alias}".`,
      };
    }
  }

  return null;
}

function getTitleSubject(title: string) {
  const [, subject] = title.split(/:\s+(.+)/);

  if (!subject) {
    return "";
  }

  return normalizeText(subject).replace(/\bstar+\b/g, "").trim();
}

function containsNormalizedTerm(haystack: string, term: string) {
  if (!term) {
    return false;
  }

  const escapedTerm = term
    .split(/\s+/)
    .map(escapeRegExp)
    .join("\\s+");
  const pattern = new RegExp(`(^|[^a-z0-9])${escapedTerm}([^a-z0-9]|$)`);

  return pattern.test(haystack);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
