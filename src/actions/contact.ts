"use server";

import { errorState, successState, type ActionState } from "@/lib/action-state";
import { consumeRateLimit, requestIdentity } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { contactMessageSchema, readContactMessageForm } from "@/lib/validations/contact";
import { validationError } from "@/lib/validations/utils";

const GENERIC_ERROR = "We couldn't send your message right now. Please try again, or message us on WhatsApp.";

/** Messages per visitor per hour, counted even when validation fails. */
const MESSAGE_LIMIT = 5;
const MESSAGE_WINDOW_SECONDS = 60 * 60;

/** Saves a message from the contact form to the admin inbox. */
export async function sendContactMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // Honeypot field: hidden from customers, so anything in it came from a bot. Pretend it worked.
  if (String(formData.get("company") ?? "") !== "") return successState();

  const identity = await requestIdentity();
  if (!(await consumeRateLimit("contact", identity, MESSAGE_LIMIT, MESSAGE_WINDOW_SECONDS))) {
    return errorState(
      "You've sent several messages in the last hour. Please wait a little, or message us on WhatsApp.",
    );
  }

  const parsed = contactMessageSchema.safeParse(readContactMessageForm(formData));
  if (!parsed.success) return validationError(parsed.error);

  const { error } = await createAdminClient().from("contact_messages").insert(parsed.data);
  if (error) {
    console.error("Failed to save contact message", error);
    return errorState(GENERIC_ERROR);
  }

  return successState();
}
