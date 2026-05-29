"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

// ─── Ticker geometry ──────────────────────────────────────────────────────────
// Each card is fixed at CARD_H px; gap between cards is GAP_H px.
// SLOT_H = one "step" of the upward scroll.
const CARD_H   = 76;           // px  (height of each card button)
const GAP_H    = 8;            // px  (space-y-2)
const SLOT_H   = CARD_H + GAP_H; // 84 px per slot
const VISIBLE  = 4;            // cards visible at once
const WINDOW_H = VISIBLE * SLOT_H - GAP_H; // 328 px visible area

// ─── Timing ───────────────────────────────────────────────────────────────────
const TICK_MS        = 5800;  // ms between rotations
const SCROLL_MS      = 680;   // right-column slide duration
const FADE_OUT_AT_MS = 260;   // ms into tick: spotlight starts fading out
const FADE_OUT_MS    = 180;   // ms: spotlight fade-out duration
const SNAP_AT_MS     = SCROLL_MS; // ms into tick: snap + swap content + fade in
const FADE_IN_MS     = 380;   // ms: spotlight fade-in duration

type RouteBoardProps = {
  restaurants: Restaurant[];
  allRestaurants: Restaurant[];
  onPreview: (restaurant: Restaurant) => void;
};

export function RouteBoard({ restaurants, allRestaurants, onPreview }: RouteBoardProps) {
  const allVisited = useMemo(
    () => allRestaurants.filter((r) => r.visited),
    [allRestaurants],
  );
  const pending = useMemo(
    () => restaurants.filter((r) => !r.visited),
    [restaurants],
  );
  const pool = allVisited.length ? allVisited : allRestaurants;

  // currIdx: which pool item is at the TOP of the right column right now
  const [currIdx, setCurrIdx] = useState(0);
  // isScrolling: true while the right column is sliding upward
  const [isScrolling, setIsScrolling] = useState(false);

  // Spotlight state (may lag currIdx to enable crossfade)
  const [spotIdx, setSpotIdx] = useState(0);
  const [spotVisible, setSpotVisible] = useState(true);

  // Stable ref for pool.length (avoids stale closures in setInterval)
  const poolLenRef = useRef(pool.length);
  useEffect(() => { poolLenRef.current = pool.length; }, [pool.length]);

  // Timer cleanup
  const pendingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const flushTimers = () => {
    pendingTimers.current.forEach(clearTimeout);
    pendingTimers.current = [];
  };

  useEffect(() => {
    if (pool.length <= 1) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const runTick = () => {
      flushTimers();
      const len = poolLenRef.current;

      // 1. Right column starts sliding upward
      setIsScrolling(true);

      // 2. Spotlight fades out (while column is mid-scroll)
      pendingTimers.current.push(
        setTimeout(() => setSpotVisible(false), FADE_OUT_AT_MS),
      );

      // 3. Column finishes → snap back + update indices + fade in spotlight
      pendingTimers.current.push(
        setTimeout(() => {
          setIsScrolling(false);
          setCurrIdx((i) => (i + 1) % len);
          setSpotIdx((i) => (i + 1) % len);
          setSpotVisible(true);
        }, SNAP_AT_MS),
      );
    };

    const interval = setInterval(runTick, TICK_MS);
    return () => {
      clearInterval(interval);
      flushTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool.length]);

  // VISIBLE+1 cards rendered: 4 visible + 1 entering from below
  const rightCards = useMemo(
    () =>
      Array.from(
        { length: VISIBLE + 1 },
        (_, i) => pool[(currIdx + i) % pool.length],
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currIdx, pool],
  );

  const spotlight = pool[spotIdx % pool.length] ?? null;
  const featured  = restaurants.slice(0, 8);

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

  // Inline styles for the two animated surfaces
  const spotStyle: React.CSSProperties = {
    opacity: spotVisible ? 1 : 0,
    transition: spotVisible
      ? `opacity ${FADE_IN_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
      : `opacity ${FADE_OUT_MS}ms ease-in`,
  };

  const tickerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: GAP_H,
    transform: isScrolling ? `translateY(-${SLOT_H}px)` : "translateY(0)",
    transition: isScrolling
      ? `transform ${SCROLL_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
      : "none",
  };

  return (
    <section className="overflow-hidden rounded-[1.5rem] border bg-[oklch(0.98_0.018_84)] shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.08fr)_420px]">

        {/* ── Left: Spotlight ──────────────────────────────────────────────── */}
        <article className="relative min-h-[430px] overflow-hidden bg-[oklch(0.22_0.045_38)] text-[oklch(0.98_0.015_84)]">
          {/* Background image — no key so it never remounts; opacity carries it */}
          {spotlight.image_url ? (
            <Image
              src={spotlight.image_url}
              alt={spotlight.name}
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
              style={{ opacity: spotVisible ? 0.75 : 0, transition: spotStyle.transition }}
            />
          ) : (
            <div className="absolute inset-0" style={spotStyle}>
              <FallbackPlate name={spotlight.name} />
            </div>
          )}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.16_0.055_38/.94),oklch(0.18_0.05_38/.68)_46%,oklch(0.18_0.05_38/.18))]" />

          {/* Text content crossfades */}
          <div
            className="relative flex min-h-[430px] flex-col justify-between p-5 sm:p-7"
            style={spotStyle}
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
                {Array.from({ length: spotlight.stars }).map((_, i) => (
                  <Star key={i} className="size-5 fill-current" />
                ))}
              </div>
              <h2 className="text-4xl font-black leading-none tracking-tight sm:text-6xl">
                {spotlight.name}
              </h2>
              <p className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-[oklch(0.95_0.02_84/.82)]">
                <MapPin className="size-4" />
                {formatLocation(spotlight.city, spotlight.province, spotlight.autonomous_community)}
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

        {/* ── Right: Stats + Vertical ticker ───────────────────────────────── */}
        <aside className="bg-[oklch(0.97_0.02_84)] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-primary">Restaurantes en ruta</p>
              <h3 className="mt-1 text-2xl font-black tracking-tight">
                La colección se mueve
              </h3>
            </div>
            <div className="rounded-2xl border bg-card px-3 py-2 text-right shadow-sm">
              <p className="text-2xl font-black leading-none">{allVisited.length}</p>
              <p className="text-xs font-bold text-muted-foreground">visitados</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <RouteStat label="En filtro" value={restaurants.length} />
            <RouteStat label="Por caer"  value={pending.length} />
          </div>

          <div className="mt-6">
            <p className="text-xs font-black uppercase text-muted-foreground">
              Restaurantes Visitados
            </p>

            {/* ── Ticker window ── */}
            <div
              className="relative mt-2 overflow-hidden rounded-[1.35rem]"
              style={{ height: WINDOW_H }}
            >
              {/* Fade edges */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-7 bg-gradient-to-b from-[oklch(0.97_0.02_84)] to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-[oklch(0.97_0.02_84)] to-transparent" />

              {/* Sliding strip */}
              <div style={tickerStyle}>
                {rightCards.map((restaurant, i) => (
                  <TickerCard
                    key={restaurant.slug}
                    restaurant={restaurant}
                    isActive={i === 0}
                    cardH={CARD_H}
                    onPreview={onPreview}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Bottom: Filtered grid ─────────────────────────────────────────── */}
      <div className="border-t bg-card/75 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-primary">Restaurantes del filtro</p>
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
            <RouteMiniCard key={restaurant.slug} restaurant={restaurant} onPreview={onPreview} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TickerCard({
  restaurant,
  isActive,
  cardH,
  onPreview,
}: {
  restaurant: Restaurant;
  isActive: boolean;
  cardH: number;
  onPreview: (r: Restaurant) => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "group flex w-full shrink-0 items-center gap-3 rounded-2xl border bg-card p-2 text-left shadow-sm",
        "transition-all duration-150 ease-out",
        "hover:-translate-y-0.5 hover:scale-[1.012] hover:border-primary/40 hover:shadow-md",
        "active:scale-[0.985] active:shadow-sm",
        isActive && "border-primary/40 ring-1 ring-primary/25 bg-[oklch(0.99_0.015_83)]",
      )}
      style={{ height: cardH }}
      onClick={() => onPreview(restaurant)}
    >
      <RestaurantThumb restaurant={restaurant} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black">{restaurant.name}</span>
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
    <article className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-150 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
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
            <h3 className="line-clamp-2 text-sm font-black leading-tight">{restaurant.name}</h3>
            <Badge className="shrink-0" variant={restaurant.visited ? "success" : "secondary"}>
              {restaurant.visited ? "Visitado" : "Pendiente"}
            </Badge>
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{formatLocation(restaurant.city, restaurant.province)}</span>
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
        <Image src={restaurant.image_url} alt="" fill sizes="56px" className="object-cover" />
      ) : (
        <span className="grid size-full place-items-center bg-[oklch(0.9_0.05_78)] text-primary">
          <Utensils className="size-5" />
        </span>
      )}
    </span>
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
      {Array.from({ length: stars }).map((_, i) => (
        <Star key={i} className="size-3.5 fill-current" />
      ))}
    </span>
  );
}
