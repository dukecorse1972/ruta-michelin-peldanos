"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { Restaurant } from "@/lib/types";

const SPAIN_CENTER: [number, number] = [40.25, -3.7];
const SPAIN_ZOOM = 6;

function MapZoomer({
  restaurants,
  community,
}: {
  restaurants: Restaurant[];
  community: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (community === "all") {
      map.flyTo(SPAIN_CENTER, SPAIN_ZOOM, { duration: 1.2 });
      return;
    }

    const withCoords = restaurants.filter(
      (r) => r.latitude && r.longitude,
    );

    if (!withCoords.length) return;

    const lats = withCoords.map((r) => r.latitude!);
    const lngs = withCoords.map((r) => r.longitude!);

    const bounds = L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    );

    map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 10, duration: 1.2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community]);

  return null;
}

export function RestaurantMap({
  restaurants,
  selected,
  onSelect,
  community = "all",
}: {
  restaurants: Restaurant[];
  selected: Restaurant | null;
  onSelect: (restaurant: Restaurant) => void;
  community?: string;
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
      center={SPAIN_CENTER}
      zoom={SPAIN_ZOOM}
      minZoom={5}
      maxZoom={18}
      scrollWheelZoom
      className="h-full min-h-[520px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapZoomer restaurants={restaurants} community={community} />
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
