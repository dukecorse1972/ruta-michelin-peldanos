"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  ChefHat,
  ExternalLink,
  Globe,
  MapPin,
  Menu,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YoutubeEmbed } from "@/components/youtube-embed";
import type { Restaurant } from "@/lib/types";
import { cn, formatLocation } from "@/lib/utils";

export function RestaurantSidePanel({
  restaurant,
  onClose,
}: {
  restaurant: Restaurant | null;
  onClose: () => void;
}) {
  if (!restaurant) {
    return null;
  }

  const location = formatLocation(
    restaurant.city,
    restaurant.province,
    restaurant.autonomous_community,
  );
  const starLabel = `${restaurant.stars} ${
    restaurant.stars === 1 ? "estrella" : "estrellas"
  } Michelin`;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[2500] cursor-default bg-foreground/18 backdrop-blur-[1px]"
        aria-label="Cerrar panel de restaurante"
        onClick={onClose}
      />

      <aside
        className="fixed inset-x-0 bottom-0 z-[2600] max-h-[88dvh] overflow-hidden rounded-t-[1.75rem] border bg-card shadow-[0_-18px_60px_oklch(0.19_0.025_47/0.28)] outline-none md:inset-x-auto md:bottom-6 md:right-6 md:top-24 md:flex md:w-[450px] md:max-h-none md:flex-col md:rounded-[1.75rem] md:shadow-[0_24px_80px_oklch(0.19_0.025_47/0.28)]"
        aria-label={`Ficha rápida de ${restaurant.name}`}
      >
        <div className="relative h-56 shrink-0 overflow-hidden bg-secondary md:h-60">
          {restaurant.image_url ? (
            <Image
              src={restaurant.image_url}
              alt={`Foto de ${restaurant.name}`}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 450px, 100vw"
            />
          ) : (
            <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_35%_20%,oklch(0.88_0.12_83),oklch(0.73_0.08_58))]">
              <div className="grid size-20 place-items-center rounded-full bg-card/88 text-primary shadow-lg">
                <ChefHat className="size-9" />
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-foreground/78 via-foreground/10 to-foreground/12" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-card/95 text-foreground shadow-lg transition hover:scale-105 hover:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Cerrar panel"
          >
            <X className="size-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <Badge
                  variant={restaurant.visited ? "success" : "secondary"}
                  className={cn(
                    "mb-3 border-0 px-3 py-1 text-xs shadow-sm",
                    restaurant.visited
                      ? "bg-[oklch(0.55_0.11_132)] text-primary-foreground"
                      : "bg-card/92 text-foreground",
                  )}
                >
                  {restaurant.visited ? "Visitado" : "Todavía no visitado"}
                </Badge>
                <h2 className="line-clamp-2 text-3xl font-black leading-none tracking-tight text-primary-foreground">
                  {restaurant.name}
                </h2>
              </div>

              <div
                className="flex shrink-0 items-center gap-0.5 rounded-full bg-card/94 px-3 py-2 text-primary shadow-lg"
                aria-label={starLabel}
              >
                {Array.from({ length: restaurant.stars }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto">
          <div className="space-y-5 p-5 md:p-6">
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-sm font-medium leading-6 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{location || "Ubicación por confirmar"}</span>
              </p>

              <div className="grid grid-cols-2 gap-2">
                <FactPill
                  icon={<ChefHat className="size-4" />}
                  label="Cocina"
                  value={restaurant.cuisine_type ?? "Por confirmar"}
                />
                <FactPill
                  icon={<Menu className="size-4" />}
                  label="Menú"
                  value={restaurant.tasting_menu_url ? "Disponible" : "Sin enlace"}
                />
              </div>
            </div>

            {restaurant.address ? (
              <div className="rounded-xl border bg-secondary/35 p-4 text-sm leading-6 text-secondary-foreground">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Dirección
                </p>
                <p className="mt-1 font-semibold">{restaurant.address}</p>
              </div>
            ) : null}

            {restaurant.visited ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-black text-primary">
                    <Sparkles className="size-4" />
                    Ya forma parte de la ruta
                  </p>
                  {restaurant.matched_confidence ? (
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                      {Math.round(restaurant.matched_confidence * 100)}% match
                    </span>
                  ) : null}
                </div>
                <YoutubeEmbed
                  videoId={restaurant.youtube_video_id}
                  title={`Peldaños visita ${restaurant.name}`}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-[oklch(0.97_0.018_83)] p-4">
                <p className="flex items-center gap-2 font-black text-foreground">
                  <Sparkles className="size-4 text-primary" />
                  Esperando el capítulo
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Cuando el canal suba el vídeo y el match sea fiable, este
                  restaurante pasará a Visitado automáticamente.
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Button asChild className="h-11 justify-between">
                <Link href={`/restaurantes/${restaurant.slug}`}>
                  Abrir ficha completa
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>

              <div className="grid gap-2 sm:grid-cols-2">
                {restaurant.youtube_url ? (
                  <Button asChild variant="outline" className="h-11 justify-between">
                    <a href={restaurant.youtube_url} target="_blank" rel="noreferrer">
                      Ver vídeo
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : null}

                {restaurant.official_website ? (
                  <Button asChild variant="outline" className="h-11 justify-between">
                    <a
                      href={restaurant.official_website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Web oficial
                      <Globe className="size-4" />
                    </a>
                  </Button>
                ) : null}

                {restaurant.tasting_menu_url ? (
                  <Button asChild variant="outline" className="h-11 justify-between">
                    <a
                      href={restaurant.tasting_menu_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Menú
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : null}

                {restaurant.michelin_url ? (
                  <Button asChild variant="outline" className="h-11 justify-between">
                    <a href={restaurant.michelin_url} target="_blank" rel="noreferrer">
                      Michelin
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function FactPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-black text-foreground" title={value}>
        {value}
      </p>
    </div>
  );
}
