import { AdminRestaurantTable } from "@/components/admin-restaurant-table";
import { getRestaurants } from "@/lib/restaurants";

export default async function AdminRestaurantsPage() {
  const restaurants = await getRestaurants();
  return <AdminRestaurantTable restaurants={restaurants} />;
}
