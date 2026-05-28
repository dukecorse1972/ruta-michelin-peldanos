type YoutubeEmbedProps = {
  videoId?: string | null;
  title?: string;
};

export function YoutubeEmbed({ videoId, title = "Vídeo de Peldaños" }: YoutubeEmbedProps) {
  if (!videoId) {
    return null;
  }

  return (
    <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
