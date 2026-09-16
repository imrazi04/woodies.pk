import type { JwtPayload } from "@supabase/supabase-js";

export const ADMIN_ROLE = "admin";

/**
 * The admin role lives in app_metadata, which only SQL or the secret key can change.
 * Accepts JWT claims or a User object. Shared by the proxy, so it must stay free of server-only imports.
 */
export function isAdmin(subject: Pick<JwtPayload, "app_metadata"> | null | undefined) {
  return subject?.app_metadata?.role === ADMIN_ROLE;
}
