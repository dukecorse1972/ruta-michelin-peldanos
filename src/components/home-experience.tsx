"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ChefHat, MapPinned } from "lucide-react";
import { ProgressCard } from "@/components/progress-card";
import { RestaurantFilters } from "@/components/restaurant-filters";
import { RestaurantSidePanel } from "@/components/restaurant-side-panel";
import { RouteBoard } from "@/components/route-board";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { normalizeText } from "@/lib/utils";
import type { Restaurant, RestaurantFiltersState } from "@/lib/types";

const DynamicMap = dynamic(
  () => import("@/components/restaurant-map").then((mod) => mod.RestaurantMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full min-h-[520px] place-items-center bg-muted">
        <div className="text-center">
          <MapPinned className="mx-auto size-10 text-primary" />
          <p className="mt-3 font-semibold">Preparando el mapa Michelin...</p>
        </div>
      </div>
    ),
  },
);

export function HomeExperience({ restaurants }: { restaurants: Restaurant[] }) {
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [filters, setFilters] = useState<RestaurantFiltersState>({
    query: "",
    stars: [],
    status: "all",
    community: "all",
  });

  const communities = useMemo(
    () =>
      Array.from(
        new Set(
          restaurants
            .map((restaurant) => restaurant.autonomous_community)
            .filter(Boolean) as string[],
        ),
      ).sort((a, b) => a.localeCompare(b, "es")),
    [restaurants],
  );

  const filtered = useMemo(() => {
    const query = normalizeText(filters.query);
    return restaurants.filter((restaurant) => {
      const matchesQuery =
        !query || normalizeText(restaurant.name).includes(query);
      const matchesStars =
        !filters.stars.length || filters.stars.includes(restaurant.stars);
      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "visited" && restaurant.visited) ||
        (filters.status === "pending" && !restaurant.visited);
      const matchesCommunity =
        filters.community === "all" ||
        restaurant.autonomous_community === filters.community;

      return matchesQuery && matchesStars && matchesStatus && matchesCommunity;
    });
  }, [restaurants, filters]);

  return (
    <main className="min-h-screen">
      <section className="mx-auto grid max-w-[1500px] gap-5 px-4 py-4 lg:grid-cols-[360px_1fr] lg:px-6">
        <div className="space-y-4">
          <div className="rounded-xl border bg-card/90 p-5 shadow-sm">
            <Badge className="bg-primary/10 text-primary" variant="outline">
              Fan project
            </Badge>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              La ruta Michelin de Peldaños
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Siguiendo, plato a plato, la aventura de visitar todos los estrella
              Michelin de España.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
              <span className="rounded-full bg-secondary px-3 py-1">
                {restaurants.length} restaurantes
              </span>
              <span className="rounded-full bg-secondary px-3 py-1">
                1, 2 y 3 estrellas
              </span>
            </div>
          </div>

          <ProgressCard restaurants={restaurants} />
          <RestaurantFilters
            filters={filters}
            communities={communities}
            onChange={setFilters}
          />
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card/95 p-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-primary">
                <ChefHat className="size-4" />
                Mapa interactivo
              </p>
              <p className="text-sm text-muted-foreground">
                {filtered.length} visibles con los filtros actuales.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFilters({ query: "", stars: [], status: "all", community: "all" })
              }
            >
              Limpiar filtros
            </Button>
          </div>
          <div className="h-[66vh] min-h-[520px]">
            <DynamicMap
              restaurants={filtered}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        </div>

        <section className="lg:col-span-2">
          <RouteBoard restaurants={filtered} onPreview={setSelected} />
        </section>
      </section>

      <RestaurantSidePanel
        restaurant={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}
