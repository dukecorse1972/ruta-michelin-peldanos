"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Globe, MapPin, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YoutubeEmbed } from "@/components/youtube-embed";
import type { Restaurant } from "@/lib/types";
import { formatLocation } from "@/lib/utils";

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

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[500] max-h-[82vh] overflow-auto rounded-xl border bg-card shadow-2xl md:inset-y-4 md:left-auto md:right-4 md:w-[430px]">
      <div className="relative h-44 overflow-hidden rounded-t-xl bg-muted">
        {restaurant.image_url ? (
          <Image
            src={restaurant.image_url}
            alt={`Imagen de ${restaurant.name}`}
            fill
            className="object-cover"
            sizes="430px"
          />
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-background/90 text-foreground shadow"
          aria-label="Cerrar panel"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <Badge variant={restaurant.visited ? "success" : "secondary"}>
              {restaurant.visited ? "Visitado" : "Todavía no visitado"}
            </Badge>
            <div className="flex text-primary">
              {Array.from({ length: restaurant.stars }).map((_, index) => (
                <Star key={index} className="size-4 fill-current" />
              ))}
            </div>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight">
            {restaurant.name}
          </h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {formatLocation(
              restaurant.city,
              restaurant.province,
              restaurant.autonomous_community,
            )}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-secondary/55 p-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Cocina</dt>
            <dd className="font-semibold">{restaurant.cuisine_type ?? "Por confirmar"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Menú</dt>
            <dd className="font-semibold">
              {restaurant.tasting_menu_url ? "Disponible" : "Sin enlace"}
            </dd>
          </div>
        </dl>

        {restaurant.visited ? (
          <YoutubeEmbed
            videoId={restaurant.youtube_video_id}
            title={`Peldaños visita ${restaurant.name}`}
          />
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
            Aún no hay vídeo asociado. Cuando Peldaños lo suba, esto debería
            encenderse solo.
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild>
            <Link href={`/restaurantes/${restaurant.slug}`}>Abrir ficha</Link>
          </Button>
          {restaurant.youtube_url ? (
            <Button asChild variant="outline">
              <a href={restaurant.youtube_url} target="_blank" rel="noreferrer">
                Ver vídeo
                <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : restaurant.official_website ? (
            <Button asChild variant="outline">
              <a href={restaurant.official_website} target="_blank" rel="noreferrer">
                Web oficial
                <Globe className="size-4" />
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
