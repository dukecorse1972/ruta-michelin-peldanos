"use client";

import { Search, SlidersHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RestaurantFiltersState, StarCount } from "@/lib/types";

type Props = {
  filters: RestaurantFiltersState;
  communities: string[];
  onChange: (filters: RestaurantFiltersState) => void;
};

function FiltersForm({ filters, communities, onChange }: Props) {
  function toggleStar(star: StarCount) {
    const next = filters.stars.includes(star)
      ? filters.stars.filter((item) => item !== star)
      : [...filters.stars, star];
    onChange({ ...filters, stars: next });
  }

  return (
    <div className="space-y-4">
      <label className="relative block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
        <Input
          className="h-11 rounded-xl border-primary/15 bg-card/80 pl-9 font-semibold shadow-sm placeholder:font-medium"
          placeholder="Buscar restaurante"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
      </label>
      <div>
        <p className="mb-2 text-sm font-black text-foreground">Estrellas</p>
        <div className="grid grid-cols-3 gap-2">
          {([1, 2, 3] as StarCount[]).map((star) => (
            <Button
              key={star}
              type="button"
              className="h-11 rounded-xl font-black shadow-sm transition-transform active:scale-[0.98]"
              variant={filters.stars.includes(star) ? "default" : "outline"}
              onClick={() => toggleStar(star)}
            >
              {star}
              <Star className="size-4 fill-current" />
            </Button>
          ))}
        </div>
      </div>
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onChange({ ...filters, status: value as RestaurantFiltersState["status"] })
        }
      >
        <SelectTrigger className="h-11 rounded-xl border-primary/15 bg-card/80 font-semibold shadow-sm">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="visited">Visitado</SelectItem>
          <SelectItem value="pending">Todavía no visitado</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.community}
        onValueChange={(value) => onChange({ ...filters, community: value })}
      >
        <SelectTrigger className="h-11 rounded-xl border-primary/15 bg-card/80 font-semibold shadow-sm">
          <SelectValue placeholder="Comunidad autónoma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las comunidades</SelectItem>
          {communities.map((community) => (
            <SelectItem key={community} value={community}>
              {community}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function RestaurantFilters(props: Props) {
  const activeFilters =
    (props.filters.query.trim() ? 1 : 0) +
    props.filters.stars.length +
    (props.filters.status !== "all" ? 1 : 0) +
    (props.filters.community !== "all" ? 1 : 0);

  return (
    <>
      <div className="hidden rounded-xl border border-primary/15 bg-[radial-gradient(circle_at_100%_0%,oklch(0.82_0.16_40/.24),transparent_8rem),linear-gradient(145deg,oklch(0.995_0.006_74),oklch(0.975_0.018_82))] p-4 shadow-sm lg:block">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-black text-primary">
              <SlidersHorizontal className="size-4" />
              Afinar ruta
            </p>
            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
              Mapa, lista y fichas responden al filtro.
            </p>
          </div>
          <span className="grid size-9 place-items-center rounded-full border border-primary/15 bg-card/85 text-sm font-black shadow-sm">
            {activeFilters}
          </span>
        </div>
        <FiltersForm {...props} />
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="lg:hidden" variant="outline">
            <SlidersHorizontal className="size-4" />
            Filtros
          </Button>
        </DialogTrigger>
        <DialogContent className="bottom-0 top-auto max-h-[86dvh] w-full max-w-none translate-y-0 rounded-b-none rounded-t-[1.5rem] p-5 sm:bottom-auto sm:top-1/2 sm:max-w-lg sm:-translate-y-1/2 sm:rounded-lg sm:p-6">
          <div className="mb-1 pr-8">
            <DialogTitle className="text-lg font-black tracking-tight">
              Filtros
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              Ajusta el mapa y las tarjetas de restaurantes.
            </DialogDescription>
          </div>
          <FiltersForm {...props} />
        </DialogContent>
      </Dialog>
    </>
  );
}
