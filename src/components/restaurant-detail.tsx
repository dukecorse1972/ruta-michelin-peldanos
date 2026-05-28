import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ChefHat,
  ExternalLink,
  Globe,
  MapPin,
  Menu,
  Play,
  Route,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YoutubeEmbed } from "@/components/youtube-embed";
import type { Restaurant } from "@/lib/types";
import { cn, formatLocation } from "@/lib/utils";

export function RestaurantDetail({ restaurant }: { restaurant: Restaurant }) {
  const location = formatLocation(
    restaurant.city,
    restaurant.province,
    restaurant.autonomous_community,
  );
  const address = restaurant.address ?? location;
  const mapUrl =
    restaurant.latitude && restaurant.longitude
      ? `https://www.openstreetmap.org/?mlat=${restaurant.latitude}&mlon=${restaurant.longitude}#map=17/${restaurant.latitude}/${restaurant.longitude}`
      : null;
  const embeddedMapUrl =
    restaurant.latitude && restaurant.longitude
      ? buildOpenStreetMapEmbedUrl(restaurant.latitude, restaurant.longitude)
      : null;

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,oklch(0.91_0.1_83/0.72),transparent_30rem),linear-gradient(180deg,oklch(0.99_0.009_78),oklch(0.95_0.026_70))]" />

        <div className="mx-auto max-w-[1500px] px-4 py-5 lg:px-6 lg:py-8">
          <Button asChild variant="ghost" className="mb-5 h-10 px-2">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Volver al mapa
            </Link>
          </Button>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
            <article className="overflow-hidden rounded-[1.75rem] border bg-card shadow-[0_24px_80px_oklch(0.19_0.025_47/0.16)]">
              <div className="relative min-h-[430px] overflow-hidden md:min-h-[560px]">
                {restaurant.image_url ? (
                  <Image
                    src={restaurant.image_url}
                    alt={`Foto de ${restaurant.name}`}
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 1024px) 980px, 100vw"
                  />
                ) : (
                  <div className="grid h-full min-h-[430px] place-items-center bg-[radial-gradient(circle_at_35%_20%,oklch(0.88_0.12_83),oklch(0.73_0.08_58))]">
                    <div className="grid size-28 place-items-center rounded-full bg-card/88 text-primary shadow-lg">
                      <ChefHat className="size-12" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-foreground/88 via-foreground/26 to-foreground/8" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge visited={restaurant.visited} />
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/24 bg-card/12 px-3 py-1 text-xs font-bold text-primary-foreground backdrop-blur">
                      <Trophy className="size-3.5" />
                      {restaurant.stars}{" "}
                      {restaurant.stars === 1 ? "estrella" : "estrellas"} Michelin
                    </span>
                  </div>

                  <div className="mt-5 max-w-4xl">
                    <div
                      className="mb-3 flex items-center gap-1 text-[oklch(0.86_0.16_83)]"
                      aria-label={`${restaurant.stars} estrellas Michelin`}
                    >
                      {Array.from({ length: restaurant.stars }).map((_, index) => (
                        <Star key={index} className="size-6 fill-current" />
                      ))}
                    </div>
                    <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-primary-foreground md:text-7xl">
                      {restaurant.name}
                    </h1>
                    <p className="mt-4 flex max-w-2xl items-start gap-2 text-base font-semibold leading-7 text-primary-foreground/86">
                      <MapPin className="mt-1 size-5 shrink-0" />
                      {address || "Ubicación por confirmar"}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-[1.75rem] border bg-card shadow-[0_18px_60px_oklch(0.19_0.025_47/0.14)]">
                <div className="border-b bg-[oklch(0.97_0.018_83)] p-5">
                  <p className="flex items-center gap-2 text-sm font-black text-primary">
                    <Route className="size-4" />
                    Dossier de la parada
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Todo lo necesario para ubicar este restaurante dentro de la
                    ruta Michelin de Peldaños.
                  </p>
                </div>

                <div className="grid gap-2 p-5">
                  <QuickStat
                    icon={<ChefHat className="size-4" />}
                    label="Cocina"
                    value={restaurant.cuisine_type ?? "Por confirmar"}
                  />
                  <QuickStat
                    icon={<MapPin className="size-4" />}
                    label="Zona"
                    value={location || "Por confirmar"}
                  />
                  <QuickStat
                    icon={<Menu className="size-4" />}
                    label="Menú degustación"
                    value={restaurant.tasting_menu_url ? "Disponible" : "Sin enlace"}
                  />
                </div>

                <div className="border-t p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Estado
                  </p>
                  <div className="mt-3 rounded-2xl border bg-secondary/35 p-4">
                    <p className="flex items-center gap-2 font-black">
                      <Sparkles className="size-4 text-primary" />
                      {restaurant.visited ? "Visitado" : "Esperando el capítulo"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {restaurant.visited
                        ? "Esta parada ya tiene vídeo asociado en la ruta."
                        : "Cuando llegue un vídeo fiable, el cron lo marcará automáticamente."}
                    </p>
                    {restaurant.matched_confidence ? (
                      <span className="mt-3 inline-flex rounded-full bg-card px-3 py-1 text-xs font-bold text-secondary-foreground shadow-sm">
                        {Math.round(restaurant.matched_confidence * 100)}% de confianza
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-2 border-t p-5">
                  {restaurant.youtube_url ? (
                    <Button asChild className="h-11 justify-between">
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
                        Guía Michelin
                        <ArrowUpRight className="size-4" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-5 px-4 pb-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-6">
        <div className="space-y-5">
          <PanelSection
            eyebrow="Capítulo"
            title={restaurant.visited ? "La visita de Peldaños" : "Todavía por caer"}
            icon={<Play className="size-5" />}
          >
            {restaurant.visited ? (
              <div className="space-y-4">
                <YoutubeEmbed
                  videoId={restaurant.youtube_video_id}
                  title={`Peldaños visita ${restaurant.name}`}
                />
                {restaurant.youtube_url ? (
                  <Button asChild variant="outline">
                    <a href={restaurant.youtube_url} target="_blank" rel="noreferrer">
                      Abrir en YouTube
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-[oklch(0.97_0.018_83)] p-5">
                <p className="font-black">Sin vídeo asociado todavía.</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  El sistema revisa los vídeos de la serie y solo marca esta
                  parada cuando el match supera el umbral de confianza.
                </p>
              </div>
            )}
          </PanelSection>

          <PanelSection
            eyebrow="Ubicación"
            title="Dónde cae en el mapa"
            icon={<MapPin className="size-5" />}
          >
            {embeddedMapUrl ? (
              <div className="overflow-hidden rounded-2xl border bg-muted">
                <iframe
                  title={`Mapa de ${restaurant.name}`}
                  src={embeddedMapUrl}
                  className="h-[340px] w-full"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-muted/45 p-5 text-sm text-muted-foreground">
                No hay coordenadas disponibles para este restaurante.
              </div>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoBlock label="Dirección" value={address} />
              <InfoBlock
                label="Coordenadas"
                value={
                  restaurant.latitude && restaurant.longitude
                    ? `${restaurant.latitude.toFixed(5)}, ${restaurant.longitude.toFixed(5)}`
                    : null
                }
              />
            </div>
            {mapUrl ? (
              <Button asChild variant="outline" className="mt-4">
                <a href={mapUrl} target="_blank" rel="noreferrer">
                  Abrir mapa
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ) : null}
          </PanelSection>
        </div>

        <div className="space-y-5">
          <PanelSection
            eyebrow="Datos"
            title="Ficha del restaurante"
            icon={<ChefHat className="size-5" />}
            compact
          >
            <div className="grid gap-3">
              <InfoRow label="Ciudad" value={restaurant.city} />
              <InfoRow label="Provincia" value={restaurant.province} />
              <InfoRow label="Comunidad" value={restaurant.autonomous_community} />
              <InfoRow label="Tipo de cocina" value={restaurant.cuisine_type} />
              <InfoRow
                label="Web oficial"
                value={restaurant.official_website ? "Disponible" : null}
              />
              <InfoRow
                label="Menú degustación"
                value={restaurant.tasting_menu_url ? "Disponible" : null}
              />
            </div>
          </PanelSection>

          <PanelSection
            eyebrow="Ruta"
            title="Cómo se lee esta parada"
            icon={<Sparkles className="size-5" />}
            compact
          >
            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                {restaurant.visited
                  ? "Esta ficha queda como parada completada: foto, vídeo y enlaces listos para revisitar el episodio."
                  : "Esta ficha está preparada para encenderse cuando el canal publique su visita."}
              </p>
              <p>
                La automatización evita marcar restaurantes con baja confianza;
                si hay duda, la revisión manual manda.
              </p>
            </div>
          </PanelSection>
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ visited }: { visited: boolean }) {
  return (
    <Badge
      variant={visited ? "success" : "secondary"}
      className={cn(
        "border-0 px-3 py-1 text-xs shadow-sm",
        visited
          ? "bg-[oklch(0.55_0.11_132)] text-primary-foreground"
          : "bg-card/92 text-foreground",
      )}
    >
      {visited ? "Visitado" : "Todavía no visitado"}
    </Badge>
  );
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-base font-black leading-6">{value}</p>
    </div>
  );
}

function PanelSection({
  eyebrow,
  title,
  icon,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="rounded-[1.75rem] border bg-card shadow-[0_18px_60px_oklch(0.19_0.025_47/0.1)]">
      <div className={cn("p-5 md:p-6", compact ? "space-y-4" : "space-y-5")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-primary">{eyebrow}</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">{title}</h2>
          </div>
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
            {icon}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border bg-secondary/35 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6">
        {value || "Por confirmar"}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right text-sm font-black leading-6">
        {value || "Por confirmar"}
      </dd>
    </div>
  );
}

function buildOpenStreetMapEmbedUrl(latitude: number, longitude: number) {
  const delta = 0.004;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join(",");

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
}
