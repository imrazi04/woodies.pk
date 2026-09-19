"use server";

import { revalidatePath } from "next/cache";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth/session";
import { revalidateSite } from "@/lib/revalidate";
import { contactPersonSchema, readContactPersonForm } from "@/lib/validations/contact";
import { isUuid, validationError } from "@/lib/validations/utils";

// ---------------------------------------------------------------------------
// Contact persons (shown on the public contact page)
// ---------------------------------------------------------------------------

/** Creates a contact, or updates it when `contactId` is given. */
export async function saveContactPerson(
  contactId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (contactId !== null && !isUuid(contactId)) return errorState("Contact not found.");

  const parsed = contactPersonSchema.safeParse(readContactPersonForm(formData));
  if (!parsed.success) return validationError(parsed.error);

  if (contactId) {
    const { data, error } = await supabase
      .from("contact_persons")
      .update(parsed.data)
      .eq("id", contactId)
      .select("id")
      .maybeSingle();
    if (error) return errorState("Could not save the contact. Please try again.");
    if (!data) return errorState("Contact not found. It may have been deleted.");
  } else {
    const { error } = await supabase.from("contact_persons").insert(parsed.data);
    if (error) return errorState("Could not add the contact. Please try again.");
  }

  revalidateSite();
  return successState(contactId ? `Saved "${parsed.data.name}".` : `Added "${parsed.data.name}".`);
}

export async function setContactPublished(contactId: string, isPublished: boolean): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(contactId)) return errorState("Contact not found.");

  const { error } = await supabase.from("contact_persons").update({ is_published: isPublished }).eq("id", contactId);
  if (error) return errorState("Could not update the contact.");

  revalidateSite();
  return successState();
}

export async function deleteContactPerson(contactId: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(contactId)) return errorState("Contact not found.");

  const { error } = await supabase.from("contact_persons").delete().eq("id", contactId);
  if (error) return errorState("Could not delete the contact.");

  revalidateSite();
  return successState();
}

// ---------------------------------------------------------------------------
// Messages from the contact form (admin inbox)
// ---------------------------------------------------------------------------

/** Messages are admin-only, so only the admin pages (and the sidebar's unread count) need refreshing. */
function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

export async function setMessageRead(messageId: string, isRead: boolean): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(messageId)) return errorState("Message not found.");

  const { error } = await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", messageId);
  if (error) return errorState("Could not update the message.");

  revalidateAdmin();
  return successState();
}

export async function deleteContactMessage(messageId: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(messageId)) return errorState("Message not found.");

  const { error } = await supabase.from("contact_messages").delete().eq("id", messageId);
  if (error) return errorState("Could not delete the message.");

  revalidateAdmin();
  return successState();
}
