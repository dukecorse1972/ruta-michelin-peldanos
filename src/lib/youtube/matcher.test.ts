import { describe, expect, it } from "vitest";
import { isMichelinSeriesVideo, matchRestaurant } from "@/lib/youtube/matcher";
import type { Restaurant } from "@/lib/types";

const restaurants = [
  {
    id: "1",
    name: "DiverXO",
    slug: "diverxo",
    stars: 3,
    city: "Madrid",
    province: "Madrid",
    autonomous_community: "Comunidad de Madrid",
    address: null,
    latitude: null,
    longitude: null,
    cuisine_type: null,
    official_website: null,
    tasting_menu_url: null,
    image_url: null,
    michelin_url: null,
    is_active: true,
    visited: false,
    youtube_video_id: null,
    youtube_url: null,
  },
  {
    id: "2",
    name: "El Celler de Can Roca",
    slug: "el-celler-de-can-roca",
    stars: 3,
    city: "Girona",
    province: "Girona",
    autonomous_community: "Cataluña",
    address: null,
    latitude: null,
    longitude: null,
    cuisine_type: null,
    official_website: null,
    tasting_menu_url: null,
    image_url: null,
    michelin_url: null,
    is_active: true,
    visited: false,
    youtube_video_id: null,
    youtube_url: null,
  },
] satisfies Restaurant[];

describe("youtube matcher", () => {
  it("detects Michelin series videos", () => {
    expect(
      isMichelinSeriesVideo({
        title: "DÍA 7 visitando restaurante con estrella Michelin",
      }),
    ).toBe(true);
  });

  it("matches direct restaurant names with high confidence", () => {
    const match = matchRestaurant(
      { title: "DÍA 1: hoy comemos en DiverXO" },
      restaurants,
    );
    expect(match.restaurant?.slug).toBe("diverxo");
    expect(match.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it("matches aliases", () => {
    const match = matchRestaurant(
      { title: "DÍA 2 en Can Roca" },
      restaurants,
      [{ restaurant_slug: "el-celler-de-can-roca", alias: "Can Roca" }],
    );
    expect(match.restaurant?.slug).toBe("el-celler-de-can-roca");
    expect(match.strategy).toBe("alias");
  });

  it("leaves unrelated videos below confidence", () => {
    const match = matchRestaurant({ title: "Probando bocadillos" }, restaurants);
    expect(match.confidence).toBeLessThan(0.85);
  });
});
