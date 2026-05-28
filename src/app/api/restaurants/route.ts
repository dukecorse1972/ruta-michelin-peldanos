import { NextResponse } from "next/server";
import { getRestaurants } from "@/lib/restaurants";

export async function GET() {
  return NextResponse.json(await getRestaurants());
}
