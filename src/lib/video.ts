/**
 * Turns a YouTube or Vimeo page link into a privacy-friendly embed. Only these two hosts are
 * accepted, and they're the only ones the Content-Security-Policy in next.config.ts allows in frames.
 */
export type VideoEmbed = { provider: "youtube" | "vimeo"; id: string; embedUrl: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;

export function parseVideoUrl(value: string): VideoEmbed | null {
  if (!URL.canParse(value)) return null;
  const url = new URL(value);
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  const segments = url.pathname.split("/").filter(Boolean);

  let youtubeId: string | null = null;
  if (host === "youtu.be") youtubeId = segments[0] ?? null;
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (segments[0] === "watch") youtubeId = url.searchParams.get("v");
    else if (["embed", "shorts", "live"].includes(segments[0] ?? "")) youtubeId = segments[1] ?? null;
  }
  if (youtubeId && YOUTUBE_ID.test(youtubeId)) {
    return {
      provider: "youtube",
      id: youtubeId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const vimeoId = segments.find((segment) => VIMEO_ID.test(segment));
    if (vimeoId) {
      return { provider: "vimeo", id: vimeoId, embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&dnt=1` };
    }
  }

  return null;
}
