"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  MapPin,
  PanelRightOpen,
  PlayCircle,
  Route,
  Star,
  Trophy,
  Utensils,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/lib/types";
import { cn, formatLocation } from "@/lib/utils";

type RouteBoardProps = {
  restaurants: Restaurant[];
  onPreview: (restaurant: Restaurant) => void;
};

export function RouteBoard({ restaurants, onPreview }: RouteBoardProps) {
  const visited = restaurants.filter((restaurant) => restaurant.visited);
  const pending = restaurants.filter((restaurant) => !restaurant.visited);
  const rotationPool = visited.length ? visited : restaurants;
  const rotationKey = useMemo(
    () => rotationPool.map((restaurant) => restaurant.slug).join("|"),
    [rotationPool],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (rotationPool.length <= 1) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % rotationPool.length);
    }, 7600);

    return () => window.clearInterval(interval);
  }, [rotationPool.length, rotationKey]);

  const spotlight = rotationPool[activeIndex % rotationPool.length] ?? null;
  const visibleUnlocks = getRotatingItems(rotationPool, activeIndex + 1, 4);
  const featured = restaurants.slice(0, 8);

  if (!spotlight) {
    return (
      <section className="rounded-[1.5rem] border border-dashed bg-card p-8 text-center shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Route className="size-5" />
        </div>
        <p className="mt-4 text-lg font-black">No hay plato en esta combinación.</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Prueba con menos filtros y vuelve al mapa.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[1.5rem] border bg-[oklch(0.98_0.018_84)] shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.08fr)_420px]">
        <article className="relative min-h-[430px] overflow-hidden bg-[oklch(0.22_0.045_38)] text-[oklch(0.98_0.015_84)]">
          {spotlight.image_url ? (
            <Image
              key={spotlight.image_url}
              src={spotlight.image_url}
              alt={spotlight.name}
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="route-spotlight-image object-cover opacity-75"
            />
          ) : (
            <div className="absolute inset-0">
              <FallbackPlate name={spotlight.name} />
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.16_0.055_38/.94),oklch(0.18_0.05_38/.68)_46%,oklch(0.18_0.05_38/.18))]" />
          <div
            key={spotlight.slug}
            className="route-spotlight-content relative flex min-h-[430px] flex-col justify-between p-5 sm:p-7"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className="border-[oklch(0.95_0.02_84/.24)] bg-[oklch(0.95_0.02_84/.14)] text-[oklch(0.98_0.015_84)]"
                variant="outline"
              >
                <Trophy className="mr-1 size-3.5" />
                Pieza destacada
              </Badge>
              <Badge
                className={cn(
                  "border-transparent",
                  spotlight.visited
                    ? "bg-[oklch(0.65_0.14_142)] text-[oklch(0.99_0.01_120)]"
                    : "bg-[oklch(0.86_0.17_78)] text-[oklch(0.22_0.045_38)]",
                )}
                variant="outline"
              >
                {spotlight.visited ? "Visitado" : "Todavía en la lista"}
              </Badge>
            </div>

            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-1 text-[oklch(0.86_0.17_78)]">
                {Array.from({ length: spotlight.stars }).map((_, index) => (
                  <Star key={index} className="size-5 fill-current" />
                ))}
              </div>
              <h2 className="text-4xl font-black leading-none tracking-tight sm:text-6xl">
                {spotlight.name}
              </h2>
              <p className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-[oklch(0.95_0.02_84/.82)]">
                <MapPin className="size-4" />
                {formatLocation(
                  spotlight.city,
                  spotlight.province,
                  spotlight.autonomous_community,
                )}
              </p>
              {spotlight.cuisine_type ? (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[oklch(0.95_0.02_84/.12)] px-3 py-1 text-sm font-semibold text-[oklch(0.95_0.02_84/.9)]">
                  <Utensils className="size-4" />
                  {spotlight.cuisine_type}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="rounded-full bg-[oklch(0.86_0.17_78)] text-[oklch(0.2_0.04_38)] hover:bg-[oklch(0.9_0.15_78)]"
                >
                  <Link href={`/restaurantes/${spotlight.slug}`}>
                    Abrir ficha
                    <ExternalLink className="size-4" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  className="rounded-full border-[oklch(0.95_0.02_84/.22)] bg-[oklch(0.95_0.02_84/.12)] text-[oklch(0.98_0.015_84)] hover:bg-[oklch(0.95_0.02_84/.2)]"
                  variant="outline"
                  onClick={() => onPreview(spotlight)}
                >
                  Ver panel
                  <PanelRightOpen className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </article>

        <aside className="bg-[oklch(0.97_0.02_84)] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-primary">Restaurantes en ruta</p>
              <h3 className="mt-1 text-2xl font-black tracking-tight">
                La colección se mueve
              </h3>
            </div>
            <div className="rounded-2xl border bg-card px-3 py-2 text-right shadow-sm">
              <p className="text-2xl font-black leading-none">{visited.length}</p>
              <p className="text-xs font-bold text-muted-foreground">visitados</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <RouteStat label="En filtro" value={restaurants.length} />
            <RouteStat label="Por caer" value={pending.length} />
          </div>

          <div className="mt-6">
            <p className="text-xs font-black uppercase text-muted-foreground">
              Restaurantes Visitados
            </p>
            <div className="relative mt-2 h-[296px] overflow-hidden rounded-[1.35rem]">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-[oklch(0.97_0.02_84)] to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-[oklch(0.97_0.02_84)] to-transparent" />
              <div
                key={`${rotationKey}-${activeIndex}`}
                className="route-unlocks-rail space-y-2"
              >
                {visibleUnlocks.map((restaurant, index) => (
                  <RouteUnlockButton
                    key={`${restaurant.slug}-${activeIndex}-${index}`}
                    restaurant={restaurant}
                    index={index}
                    onPreview={onPreview}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="border-t bg-card/75 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-primary">
              Restaurantes del filtro
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta parrilla responde solo a la búsqueda, estrellas, estado y comunidad.
            </p>
          </div>
          <span className="text-sm font-bold text-muted-foreground">
            {restaurants.length} resultados
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((restaurant) => (
            <RouteMiniCard
              key={restaurant.slug}
              restaurant={restaurant}
              onPreview={onPreview}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function getRotatingItems(
  restaurants: Restaurant[],
  startIndex: number,
  count: number,
) {
  if (!restaurants.length) {
    return [];
  }

  return Array.from({ length: Math.min(count, restaurants.length) }, (_, index) => {
    const itemIndex = (startIndex + index) % restaurants.length;
    return restaurants[itemIndex];
  });
}

function RouteStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-card p-3 shadow-sm">
      <p className="text-2xl font-black leading-none">{value}</p>
      <p className="mt-1 text-xs font-bold text-muted-foreground">{label}</p>
    </div>
  );
}

function RouteMiniCard({
  restaurant,
  onPreview,
}: {
  restaurant: Restaurant;
  onPreview: (restaurant: Restaurant) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => onPreview(restaurant)}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {restaurant.image_url ? (
            <Image
              src={restaurant.image_url}
              alt={restaurant.name}
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 46vw, 92vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <FallbackPlate name={restaurant.name} />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(transparent,oklch(0.18_0.035_38/.82))] p-3 text-[oklch(0.98_0.015_84)]">
            <StarCluster stars={restaurant.stars} />
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-black leading-tight">
              {restaurant.name}
            </h3>
            <Badge
              className="shrink-0"
              variant={restaurant.visited ? "success" : "secondary"}
            >
              {restaurant.visited ? "Visitado" : "Pendiente"}
            </Badge>
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {formatLocation(restaurant.city, restaurant.province)}
            </span>
          </p>
        </div>
      </button>
    </article>
  );
}

function RestaurantThumb({ restaurant }: { restaurant: Restaurant }) {
  return (
    <span className="relative block size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
      {restaurant.image_url ? (
        <Image
          src={restaurant.image_url}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
        />
      ) : (
        <span className="grid size-full place-items-center bg-[oklch(0.9_0.05_78)] text-primary">
          <Utensils className="size-5" />
        </span>
      )}
    </span>
  );
}

function RouteUnlockButton({
  restaurant,
  index,
  onPreview,
}: {
  restaurant: Restaurant;
  index: number;
  onPreview: (restaurant: Restaurant) => void;
}) {
  return (
    <button
      type="button"
      className="route-unlock-card group flex w-full items-center gap-3 rounded-2xl border bg-card p-2 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      style={{ ["--unlock-index" as string]: index }}
      onClick={() => onPreview(restaurant)}
    >
      <RestaurantThumb restaurant={restaurant} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black">
          {restaurant.name}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
          {restaurant.youtube_url ? (
            <PlayCircle className="size-3.5 text-primary" />
          ) : (
            <MapPin className="size-3.5" />
          )}
          {restaurant.youtube_url ? "Video listo" : restaurant.city}
        </span>
      </span>
      <StarCluster stars={restaurant.stars} />
    </button>
  );
}

function FallbackPlate({ name }: { name: string }) {
  return (
    <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,oklch(0.92_0.08_78),transparent_32%),linear-gradient(135deg,oklch(0.83_0.055_74),oklch(0.96_0.025_84))] p-5 text-center">
      <div className="grid size-16 place-items-center rounded-full border border-[oklch(0.68_0.08_62/.28)] bg-[oklch(0.98_0.015_84/.64)] text-primary shadow-sm">
        <Utensils className="size-7" />
      </div>
      <span className="sr-only">{name}</span>
    </div>
  );
}

function StarCluster({ stars }: { stars: Restaurant["stars"] }) {
  return (
    <span className="flex items-center gap-0.5 text-[oklch(0.86_0.17_78)]">
      {Array.from({ length: stars }).map((_, index) => (
        <Star key={index} className="size-3.5 fill-current" />
      ))}
    </span>
  );
}
