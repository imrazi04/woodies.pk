import "server-only";
import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";
import type { TeamMember } from "@/types/database";

export type PublicTeamMember = Pick<
  TeamMember,
  "id" | "name" | "role" | "bio" | "image_url" | "phone" | "is_whatsapp" | "email"
>;

/**
 * Published team members for the team page, in the admin's chosen order.
 * An error returns an empty list, so the page still renders.
 */
export const getPublishedTeam = cache(async (): Promise<PublicTeamMember[]> => {
  const { data, error } = await getPublicClient()
    .from("team_members")
    .select("id, name, role, bio, image_url, phone, is_whatsapp, email")
    .eq("is_published", true)
    .order("display_order")
    .order("created_at");
  if (error) {
    console.error("Failed to load team members", error);
    return [];
  }
  return data;
});
