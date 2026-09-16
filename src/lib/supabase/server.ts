import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { supabasePublishableKey, supabaseUrl } from "./config";

export type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

/** Session cookies stay same-site, and HTTPS-only outside development. */
export const AUTH_COOKIE_OPTIONS = {
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Acts as the signed-in user (or anon), so RLS applies. Create one per request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can't write cookies; src/proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
