"use server";

import { errorState, successState, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth/session";
import { revalidateSite } from "@/lib/revalidate";
import { TEAM_PHOTOS_BUCKET } from "@/lib/storage/public-photos";
import { removeUnusedPhoto } from "@/lib/storage/public-photos.server";
import type { ServerSupabaseClient } from "@/lib/supabase/server";
import { readTeamMemberForm, teamMemberSchema } from "@/lib/validations/team";
import { isUuid, validationError } from "@/lib/validations/utils";

/** Deletes an uploaded team photo unless another member still uses it. */
async function removeTeamPhoto(supabase: ServerSupabaseClient, url: string | null) {
  await removeUnusedPhoto(supabase, TEAM_PHOTOS_BUCKET, url, async (photoUrl) => {
    const { data, error } = await supabase.from("team_members").select("id").eq("image_url", photoUrl).limit(1);
    if (error) throw error;
    return data.length > 0;
  });
}

/** Creates a team member, or updates one when `memberId` is given. */
export async function saveTeamMember(
  memberId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (memberId !== null && !isUuid(memberId)) return errorState("Team member not found.");

  const parsed = teamMemberSchema.safeParse(readTeamMemberForm(formData));
  if (!parsed.success) return validationError(parsed.error);
  const member = parsed.data;

  if (memberId) {
    const { data: existing, error: readError } = await supabase
      .from("team_members")
      .select("image_url")
      .eq("id", memberId)
      .maybeSingle();
    if (readError) return errorState("Could not save the team member. Please try again.");
    if (!existing) return errorState("Team member not found. They may have been deleted.");

    const { error } = await supabase.from("team_members").update(member).eq("id", memberId);
    if (error) return errorState("Could not save the team member. Please try again.");

    if (existing.image_url !== member.image_url) await removeTeamPhoto(supabase, existing.image_url);
  } else {
    const { error } = await supabase.from("team_members").insert(member);
    if (error) return errorState("Could not add the team member. Please try again.");
  }

  revalidateSite();
  return successState(memberId ? `Saved ${member.name}.` : `Added ${member.name}.`);
}

export async function setTeamMemberPublished(memberId: string, isPublished: boolean): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(memberId)) return errorState("Team member not found.");

  const { error } = await supabase.from("team_members").update({ is_published: isPublished }).eq("id", memberId);
  if (error) return errorState("Could not update the team member.");

  revalidateSite();
  return successState();
}

/** Deletes a team member and their uploaded photo. */
export async function deleteTeamMember(memberId: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(memberId)) return errorState("Team member not found.");

  const { data, error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId)
    .select("image_url")
    .maybeSingle();
  if (error) return errorState("Could not delete the team member.");
  if (!data) return errorState("Team member not found. They may have been deleted already.");

  await removeTeamPhoto(supabase, data.image_url);
  revalidateSite();
  return successState();
}

/** Removes a photo uploaded for a save that then failed, so it isn't left behind. */
export async function discardTeamPhoto(url: string): Promise<void> {
  const { supabase } = await requireAdmin();
  await removeTeamPhoto(supabase, url);
}
