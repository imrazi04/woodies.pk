// NEXT_PUBLIC_* values must be read with direct property access so Next.js can inline them in client bundles.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export function isSupabaseConfigured() {
  return URL.canParse(supabaseUrl) && supabasePublishableKey.length > 0;
}
