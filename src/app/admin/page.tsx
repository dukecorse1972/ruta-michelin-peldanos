import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRestaurants } from "@/lib/restaurants";

export default async function AdminPage() {
  const restaurants = await getRestaurants();
  const visited = restaurants.filter((restaurant) => restaurant.visited).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Visitados</p>
          <p className="mt-2 text-4xl font-black">
            {visited}/{restaurants.length}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Restaurantes activos</p>
          <p className="mt-2 text-4xl font-black">{restaurants.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2 p-5">
          <Button asChild className="w-full">
            <Link href="/admin/restaurants">Editar restaurantes</Link>
          </Button>
          <Button asChild className="w-full" variant="outline">
            <Link href="/admin/videos">Revisar vídeos</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
