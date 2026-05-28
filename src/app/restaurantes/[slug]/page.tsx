import { notFound } from "next/navigation";
import { RestaurantDetail } from "@/components/restaurant-detail";
import { SiteHeader } from "@/components/site-header";
import { getCurrentProfile } from "@/lib/auth";
import { getRestaurantBySlug } from "@/lib/restaurants";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [restaurant, profile] = await Promise.all([
    getRestaurantBySlug(slug),
    getCurrentProfile(),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <>
      <SiteHeader profile={profile} />
      <RestaurantDetail restaurant={restaurant} />
    </>
  );
}
