import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabasePublishableKey, supabaseUrl } from "./config";

let client: SupabaseClient<Database> | undefined;

/**
 * Cookie-less client for public catalog reads (publishable key, so RLS applies).
 * Because it never reads request cookies, storefront pages can be prerendered and cached.
 * Never use it for anything tied to a signed-in user.
 */
export function getPublicClient() {
  client ??= createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
