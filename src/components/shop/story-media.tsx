"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { parseVideoUrl } from "@/lib/video";

/**
 * A story's image, or its video behind a cover. The video player (and its cookies and scripts)
 * only loads once the visitor presses play.
 */
export function StoryMedia({
  title,
  imageUrl,
  videoUrl,
  priority = false,
}: {
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
  priority?: boolean;
}) {
  const video = videoUrl ? parseVideoUrl(videoUrl) : null;
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (video && playing) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-3xl bg-espresso shadow-lift">
        <iframe
          src={video.embedUrl}
          title={`Video: ${title}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full"
        />
      </div>
    );
  }

  const cover = (
    <>
      {/* Warm placeholder while the photo loads; the image fades in over it. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-sand transition-opacity duration-700",
          loaded ? "opacity-0" : "animate-pulse",
        )}
      />
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={video ? "" : title}
          fill
          priority={priority}
          quality={90}
          sizes="(min-width: 1024px) 55vw, 100vw"
          onLoad={() => setLoaded(true)}
          className={cn(
            "object-cover transition duration-[1.4s] ease-luxe",
            loaded ? "scale-100 opacity-100" : "scale-[1.04] opacity-0",
            video && "group-hover:scale-[1.02]",
          )}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--color-linen),var(--color-sand))]"
        />
      )}
    </>
  );

  if (!video) {
    if (!imageUrl) return null;
    return <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft sm:aspect-[4/3]">{cover}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-3xl shadow-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-espresso"
    >
      {cover}
      <span
        aria-hidden
        className="absolute inset-0 bg-espresso/25 transition-colors duration-500 group-hover:bg-espresso/35"
      />
      <span
        aria-hidden
        className="absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-espresso shadow-lift backdrop-blur transition duration-500 ease-luxe group-hover:scale-105"
      >
        <Play className="ml-1 size-7" fill="currentColor" strokeWidth={0} />
      </span>
      <span className="absolute bottom-4 left-5 text-[11px] font-semibold tracking-[0.2em] text-cream uppercase drop-shadow">
        Watch the film
      </span>
    </button>
  );
}
