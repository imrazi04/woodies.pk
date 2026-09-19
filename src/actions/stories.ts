"use server";

import { errorState, successState, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth/session";
import { revalidateSite } from "@/lib/revalidate";
import { HERITAGE_IMAGES_BUCKET } from "@/lib/storage/public-photos";
import { removeUnusedPhoto } from "@/lib/storage/public-photos.server";
import type { ServerSupabaseClient } from "@/lib/supabase/server";
import { readStoryForm, storySchema } from "@/lib/validations/story";
import { isUuid, validationError } from "@/lib/validations/utils";

const UNIQUE_VIOLATION = "23505";

/** Deletes an uploaded story image unless another story still uses it. */
async function removeStoryImage(supabase: ServerSupabaseClient, url: string | null) {
  await removeUnusedPhoto(supabase, HERITAGE_IMAGES_BUCKET, url, async (imageUrl) => {
    const { data, error } = await supabase.from("chiniot_stories").select("id").eq("image_url", imageUrl).limit(1);
    if (error) throw error;
    return data.length > 0;
  });
}

/** Creates a story, or updates one when `storyId` is given. */
export async function saveStory(storyId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (storyId !== null && !isUuid(storyId)) return errorState("Story not found.");

  const parsed = storySchema.safeParse(readStoryForm(formData));
  if (!parsed.success) return validationError(parsed.error);
  const story = parsed.data;

  let previousImage: string | null = null;
  if (storyId) {
    const { data: existing, error } = await supabase
      .from("chiniot_stories")
      .select("image_url")
      .eq("id", storyId)
      .maybeSingle();
    if (error) return errorState("Could not save the story. Please try again.");
    if (!existing) return errorState("Story not found. It may have been deleted.");
    previousImage = existing.image_url;
  }

  const { error } = storyId
    ? await supabase.from("chiniot_stories").update(story).eq("id", storyId)
    : await supabase.from("chiniot_stories").insert(story);
  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return errorState("Please fix the highlighted fields.", {
        slug: [`Another story already uses the link name "${story.slug}".`],
      });
    }
    return errorState("Could not save the story. Please try again.");
  }

  if (previousImage !== story.image_url) await removeStoryImage(supabase, previousImage);

  revalidateSite();
  return successState(storyId ? `Saved "${story.title}".` : `Added "${story.title}".`);
}

export async function setStoryPublished(storyId: string, isPublished: boolean): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(storyId)) return errorState("Story not found.");

  const { error } = await supabase.from("chiniot_stories").update({ is_published: isPublished }).eq("id", storyId);
  if (error) return errorState("Could not update the story.");

  revalidateSite();
  return successState();
}

/** Deletes a story and its uploaded image. */
export async function deleteStory(storyId: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(storyId)) return errorState("Story not found.");

  const { data, error } = await supabase
    .from("chiniot_stories")
    .delete()
    .eq("id", storyId)
    .select("image_url")
    .maybeSingle();
  if (error) return errorState("Could not delete the story.");
  if (!data) return errorState("Story not found. It may have been deleted already.");

  await removeStoryImage(supabase, data.image_url);
  revalidateSite();
  return successState();
}

/** Removes an image uploaded for a save that then failed, so it isn't left behind. */
export async function discardStoryImage(url: string): Promise<void> {
  const { supabase } = await requireAdmin();
  await removeStoryImage(supabase, url);
}
