import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { YoutubeEmbed } from "@/components/youtube-embed";
import type { Restaurant } from "@/lib/types";
import { formatLocation } from "@/lib/utils";

export function RestaurantDetail({ restaurant }: { restaurant: Restaurant }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <Button asChild variant="ghost">
        <Link href="/">
          <ArrowLeft className="size-4" />
          Volver al mapa
        </Link>
      </Button>
      <section className="mt-4 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="relative h-72 bg-muted">
            {restaurant.image_url ? (
              <Image
                src={restaurant.image_url}
                alt={`Imagen de ${restaurant.name}`}
                fill
                className="object-cover"
                priority
              />
            ) : null}
          </div>
          <div className="p-6">
            <Badge variant={restaurant.visited ? "success" : "secondary"}>
              {restaurant.visited ? "Visitado" : "Todavía no visitado"}
            </Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight">
              {restaurant.name}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              {restaurant.address ??
                formatLocation(restaurant.city, restaurant.province)}
            </p>
            <div className="mt-4 flex items-center gap-1 text-primary">
              {Array.from({ length: restaurant.stars }).map((_, index) => (
                <Star key={index} className="size-5 fill-current" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="grid gap-3 p-5 text-sm">
              <Info label="Ciudad" value={restaurant.city} />
              <Info label="Provincia" value={restaurant.province} />
              <Info label="Comunidad" value={restaurant.autonomous_community} />
              <Info label="Tipo de cocina" value={restaurant.cuisine_type} />
              <Info label="Menú degustación" value={restaurant.tasting_menu_url ? "Disponible" : "Sin enlace"} />
            </CardContent>
          </Card>
          {restaurant.visited ? (
            <YoutubeEmbed
              videoId={restaurant.youtube_video_id}
              title={`Peldaños visita ${restaurant.name}`}
            />
          ) : (
            <Card>
              <CardContent className="p-5">
                <p className="font-bold">Aún esperando el episodio.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cuando aparezca el vídeo, el cron lo propondrá o lo marcará
                  automáticamente si la confianza es alta.
                </p>
              </CardContent>
            </Card>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {restaurant.official_website ? (
              <Button asChild variant="outline">
                <a href={restaurant.official_website} target="_blank" rel="noreferrer">
                  Restaurante
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ) : null}
            {restaurant.youtube_url ? (
              <Button asChild>
                <a href={restaurant.youtube_url} target="_blank" rel="noreferrer">
                  Ver vídeo
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value || "Por confirmar"}</dd>
    </div>
  );
}
