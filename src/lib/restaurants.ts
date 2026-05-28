import seedRestaurants from "../../data/restaurants.seed.json";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Restaurant } from "@/lib/types";

export const fallbackRestaurants = seedRestaurants as Restaurant[];

export async function getRestaurants() {
  if (!hasSupabaseEnv()) {
    return fallbackRestaurants;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_active", true)
    .order("stars", { ascending: false })
    .order("name");

  if (error) {
    console.error(error);
    return fallbackRestaurants;
  }

  return (data ?? []) as Restaurant[];
}

export async function getRestaurantBySlug(slug: string) {
  if (!hasSupabaseEnv()) {
    return fallbackRestaurants.find((restaurant) => restaurant.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Restaurant;
}

export function getCommunities(restaurants: Restaurant[]) {
  return Array.from(
    new Set(
      restaurants
        .map((restaurant) => restaurant.autonomous_community)
        .filter(Boolean) as string[],
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));
}
