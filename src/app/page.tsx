import { HomeExperience } from "@/components/home-experience";
import { SiteHeader } from "@/components/site-header";
import { getCurrentProfile } from "@/lib/auth";
import { getRestaurants } from "@/lib/restaurants";

export default async function Home() {
  const [restaurants, profile] = await Promise.all([
    getRestaurants(),
    getCurrentProfile(),
  ]);
  return (
    <>
      <SiteHeader profile={profile} />
      <HomeExperience restaurants={restaurants} />
    </>
  );
}
