"use client";

import { Search, SlidersHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar restaurante"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
      </label>
      <div>
        <p className="mb-2 text-sm font-semibold">Estrellas</p>
        <div className="grid grid-cols-3 gap-2">
          {([1, 2, 3] as StarCount[]).map((star) => (
            <Button
              key={star}
              type="button"
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
        <SelectTrigger>
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
        <SelectTrigger>
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
  return (
    <>
      <div className="hidden rounded-lg border bg-card p-4 shadow-sm lg:block">
        <FiltersForm {...props} />
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="lg:hidden" variant="outline">
            <SlidersHorizontal className="size-4" />
            Filtros
          </Button>
        </DialogTrigger>
        <DialogContent>
          <FiltersForm {...props} />
        </DialogContent>
      </Dialog>
    </>
  );
}
