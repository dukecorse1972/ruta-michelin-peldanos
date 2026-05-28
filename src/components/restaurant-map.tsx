"use client";

import { useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { Restaurant } from "@/lib/types";

export function RestaurantMap({
  restaurants,
  selected,
  onSelect,
}: {
  restaurants: Restaurant[];
  selected: Restaurant | null;
  onSelect: (restaurant: Restaurant) => void;
}) {
  const icons = useMemo(() => {
    const createIcon = (restaurant: Restaurant) =>
      L.divIcon({
        className: "",
        html: `<span aria-hidden="true" class="restaurant-marker marker-stars-${restaurant.stars} ${
          restaurant.visited ? "visited" : ""
        }"><span class="marker-stars marker-stars-visual-${restaurant.stars}">${Array.from(
          { length: restaurant.stars },
          () => '<span class="marker-star">★</span>',
        ).join("")}</span>${
          restaurant.visited ? '<span class="marker-check">✓</span>' : ""
        }</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 27],
      });

    return new Map(restaurants.map((restaurant) => [restaurant.slug, createIcon(restaurant)]));
  }, [restaurants]);

  return (
    <MapContainer
      center={[40.25, -3.7]}
      zoom={6}
      minZoom={5}
      maxZoom={18}
      scrollWheelZoom
      className="h-full min-h-[520px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {restaurants
        .filter((restaurant) => restaurant.latitude && restaurant.longitude)
        .map((restaurant) => (
          <Marker
            key={restaurant.slug}
            position={[restaurant.latitude!, restaurant.longitude!]}
            icon={icons.get(restaurant.slug)}
            eventHandlers={{
              click: () => onSelect(restaurant),
            }}
            zIndexOffset={selected?.slug === restaurant.slug ? 1000 : 0}
            title={`${restaurant.name}, ${restaurant.stars} estrellas`}
          />
        ))}
    </MapContainer>
  );
}
