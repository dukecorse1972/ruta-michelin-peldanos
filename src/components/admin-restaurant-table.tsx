import { Save } from "lucide-react";
import { updateRestaurantAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Restaurant } from "@/lib/types";

export function AdminRestaurantTable({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="bg-muted text-left">
          <tr>
            <th className="p-3">Restaurante</th>
            <th className="p-3">Estrellas</th>
            <th className="p-3">Ubicación</th>
            <th className="p-3">Cocina</th>
            <th className="p-3">Vídeo</th>
            <th className="p-3">Visitado</th>
            <th className="p-3">Guardar</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((restaurant) => (
            <tr key={restaurant.slug} className="border-t align-top">
              <td className="p-3">
                <form
                  id={`restaurant-${restaurant.id}`}
                  action={updateRestaurantAction}
                  className="grid gap-2"
                >
                  <input name="id" type="hidden" value={restaurant.id} />
                  <Input name="name" defaultValue={restaurant.name} />
                  <Input
                    name="official_website"
                    defaultValue={restaurant.official_website ?? ""}
                    placeholder="Web oficial"
                  />
                  <Input
                    name="tasting_menu_url"
                    defaultValue={restaurant.tasting_menu_url ?? ""}
                    placeholder="Menú degustación"
                  />
                  <Input
                    name="michelin_url"
                    defaultValue={restaurant.michelin_url ?? ""}
                    placeholder="Michelin URL"
                  />
                </form>
              </td>
              <td className="p-3">
                <Input
                  form={`restaurant-${restaurant.id}`}
                  min={1}
                  max={3}
                  name="stars"
                  type="number"
                  defaultValue={restaurant.stars}
                />
              </td>
              <td className="grid gap-2 p-3">
                <Input
                  form={`restaurant-${restaurant.id}`}
                  name="city"
                  defaultValue={restaurant.city ?? ""}
                  placeholder="Ciudad"
                />
                <Input
                  form={`restaurant-${restaurant.id}`}
                  name="province"
                  defaultValue={restaurant.province ?? ""}
                  placeholder="Provincia"
                />
                <Input
                  form={`restaurant-${restaurant.id}`}
                  name="autonomous_community"
                  defaultValue={restaurant.autonomous_community ?? ""}
                  placeholder="Comunidad"
                />
              </td>
              <td className="p-3">
                <Input
                  form={`restaurant-${restaurant.id}`}
                  name="cuisine_type"
                  defaultValue={restaurant.cuisine_type ?? ""}
                />
              </td>
              <td className="grid gap-2 p-3">
                <Input
                  form={`restaurant-${restaurant.id}`}
                  name="youtube_video_id"
                  defaultValue={restaurant.youtube_video_id ?? ""}
                  placeholder="YouTube ID"
                />
                <Input
                  form={`restaurant-${restaurant.id}`}
                  name="youtube_url"
                  defaultValue={restaurant.youtube_url ?? ""}
                  placeholder="YouTube URL"
                />
              </td>
              <td className="p-3">
                <input
                  form={`restaurant-${restaurant.id}`}
                  className="size-5 accent-[var(--primary)]"
                  name="visited"
                  type="checkbox"
                  defaultChecked={restaurant.visited}
                />
              </td>
              <td className="p-3">
                <Button form={`restaurant-${restaurant.id}`} size="sm" type="submit">
                  <Save className="size-4" />
                  Guardar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
