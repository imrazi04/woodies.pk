"use server";

import { redirect } from "next/navigation";
import { errorState, type ActionState } from "@/lib/action-state";
import { isAdmin } from "@/lib/auth/roles";
import { consumeRateLimit, requestIdentity } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validations/auth";
import { validationError } from "@/lib/validations/utils";

/** Sign-in attempts per visitor per 15 minutes, to slow password guessing. */
const LOGIN_ATTEMPT_LIMIT = 20;
const LOGIN_WINDOW_SECONDS = 15 * 60;

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return validationError(parsed.error);

  if (!isSupabaseConfigured()) {
    return errorState("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL in .env.local.");
  }

  const identity = await requestIdentity();
  if (!(await consumeRateLimit("admin-login", identity, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_SECONDS))) {
    return errorState("Too many sign-in attempts. Please wait 15 minutes and try again.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return errorState(
      error.status === 429
        ? "Too many sign-in attempts. Please wait a moment and try again."
        : "Invalid email or password.",
    );
  }

  if (!isAdmin(data.user)) {
    await supabase.auth.signOut();
    return errorState("This account does not have admin access.");
  }

  redirect(safeAdminPath(formData.get("next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Only follow `next` back into the admin area, to avoid open redirects. */
function safeAdminPath(next: FormDataEntryValue | null) {
  if (typeof next === "string" && /^\/admin(\/|\?|$)/.test(next) && !next.startsWith("/admin/login")) {
    return next;
  }
  return "/admin";
}
