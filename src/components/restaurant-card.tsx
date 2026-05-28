import Link from "next/link";
import { ExternalLink, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Restaurant } from "@/lib/types";
import { formatLocation } from "@/lib/utils";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-black">{restaurant.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {formatLocation(restaurant.city, restaurant.province)}
            </p>
          </div>
          <Badge variant={restaurant.visited ? "success" : "secondary"}>
            {restaurant.visited ? "Visitado" : "Pendiente"}
          </Badge>
        </div>
        <div className="mt-3 flex items-center gap-1 text-sm font-semibold">
          {Array.from({ length: restaurant.stars }).map((_, index) => (
            <Star key={index} className="size-4 fill-primary text-primary" />
          ))}
          <span className="ml-1">{restaurant.cuisine_type}</span>
        </div>
        <Button asChild className="mt-4 w-full" variant="outline">
          <Link href={`/restaurantes/${restaurant.slug}`}>
            Abrir restaurante
            <ExternalLink className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
