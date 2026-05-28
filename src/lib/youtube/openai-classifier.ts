import OpenAI from "openai";
import type { Restaurant } from "@/lib/types";

export async function classifyWithOpenAI(args: {
  title: string;
  description?: string | null;
  restaurants: Restaurant[];
}) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const candidates = args.restaurants.map((restaurant) => ({
    id: restaurant.id ?? restaurant.slug,
    slug: restaurant.slug,
    name: restaurant.name,
    city: restaurant.city,
    province: restaurant.province,
    stars: restaurant.stars,
  }));

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Identifica el restaurante Michelin español visitado en un vídeo de YouTube. Devuelve solo JSON con restaurant_slug, confidence y reason. Usa null si no hay confianza.",
      },
      {
        role: "user",
        content: JSON.stringify({
          title: args.title,
          description: args.description ?? "",
          candidates,
        }),
      },
    ],
  });

  const text = response.output_text;
  try {
    return JSON.parse(text) as {
      restaurant_slug: string | null;
      confidence: number;
      reason: string;
    };
  } catch {
    return null;
  }
}
