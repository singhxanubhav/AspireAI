"use client";

import { cn } from "@/lib/utils";

export default function VideoPlayer({
  url,
  title,
  className,
}: {
  url: string | null;
  title?: string;
  className?: string;
}) {
  if (!url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-muted aspect-video",
          className,
        )}
      >
        <p className="text-muted-foreground">No video available</p>
      </div>
    );
  }

  const isYoutube =
    url.includes("youtube.com/watch") || url.includes("youtu.be");

  if (isYoutube) {
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    )?.[1];
    const embedUrl = videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : url;

    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl aspect-video",
          className,
        )}
      >
        <iframe
          src={embedUrl}
          title={title || "Video"}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-xl", className)}>
      <video
        controls
        className="w-full aspect-video"
        src={url}
        title={title}
      />
    </div>
  );
}
