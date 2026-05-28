import { RefreshCw } from "lucide-react";
import { rerunYoutubeSyncAction, resolveVideoAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Restaurant, YoutubeVideo } from "@/lib/types";

export function AdminVideoReviewTable({
  videos,
  restaurants,
}: {
  videos: YoutubeVideo[];
  restaurants: Restaurant[];
}) {
  return (
    <div className="space-y-4">
      <form action={rerunYoutubeSyncAction}>
        <Button type="submit">
          <RefreshCw className="size-4" />
          Forzar sync de YouTube
        </Button>
      </form>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3">Vídeo</th>
              <th className="p-3">Publicado</th>
              <th className="p-3">Confianza</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Resolver</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.youtube_video_id} className="border-t align-top">
                <td className="p-3">
                  <p className="font-bold">{video.title}</p>
                  <p className="mt-1 line-clamp-2 text-muted-foreground">
                    {video.description}
                  </p>
                  {video.url ? (
                    <a
                      className="mt-2 inline-block font-semibold text-primary"
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir vídeo
                    </a>
                  ) : null}
                </td>
                <td className="p-3">{video.published_at?.slice(0, 10) ?? "-"}</td>
                <td className="p-3">
                  {video.matched_confidence
                    ? `${Math.round(video.matched_confidence * 100)}%`
                    : "-"}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {video.match_reason}
                  </p>
                </td>
                <td className="p-3">
                  {video.needs_review ? "Revisar" : "Procesado"}
                </td>
                <td className="p-3">
                  <form action={resolveVideoAction} className="flex gap-2">
                    <input type="hidden" name="video_id" value={video.id} />
                    <input
                      type="hidden"
                      name="youtube_video_id"
                      value={video.youtube_video_id}
                    />
                    <input type="hidden" name="youtube_url" value={video.url ?? ""} />
                    <Select name="restaurant_id">
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Restaurante" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id ?? ""}>
                            {restaurant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="submit" variant="outline">
                      Asociar
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!videos.length ? (
        <div className="rounded-lg border border-dashed bg-card p-8 text-center">
          <p className="font-bold">Aún no hay vídeos detectados.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ejecuta el cron cuando tengas claves de YouTube configuradas.
          </p>
        </div>
      ) : null}
    </div>
  );
}
