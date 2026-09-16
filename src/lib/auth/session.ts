import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "./roles";

/**
 * Verifies the request comes from an admin and returns a Supabase client acting as them.
 * Call it in every admin page and Server Action: the proxy is a first gate, not a security boundary.
 * Database RLS enforces the same rule as a last line of defense.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims || !isAdmin(data.claims)) {
    redirect("/admin/login");
  }

  return { supabase, claims: data.claims };
});
