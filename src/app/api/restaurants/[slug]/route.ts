import { NextResponse } from "next/server";
import { getRestaurantBySlug } from "@/lib/restaurants";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(restaurant);
}
