import "server-only";
import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";
import type { ChiniotStory } from "@/types/database";

export type PublicStory = Pick<ChiniotStory, "id" | "title" | "slug" | "content" | "image_url" | "video_url">;

/**
 * Published heritage stories, in the admin's chosen order.
 * An error returns an empty list, so the page still renders its introduction.
 */
export const getPublishedStories = cache(async (): Promise<PublicStory[]> => {
  const { data, error } = await getPublicClient()
    .from("chiniot_stories")
    .select("id, title, slug, content, image_url, video_url")
    .eq("is_published", true)
    .order("display_order")
    .order("created_at");
  if (error) {
    console.error("Failed to load heritage stories", error);
    return [];
  }
  return data;
});
