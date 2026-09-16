import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * A keyed hash of the visitor's IP address. Rate limits can be counted per visitor without
 * ever storing an address, and the hash can't be reversed without the server's secret.
 */
export async function requestIdentity() {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
  return createHmac("sha256", process.env.SUPABASE_SECRET_KEY ?? "").update(ip).digest("hex");
}

/**
 * Counts one request and returns false once the visitor is over the limit.
 * Fails open (allows the request) if the database can't be reached, so an outage
 * can't block checkout; the other checks in each action still apply.
 */
export async function consumeRateLimit(bucket: string, identity: string, limit: number, windowSeconds: number) {
  const { data, error } = await createAdminClient().rpc("consume_rate_limit", {
    p_bucket: bucket,
    p_identity: identity,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("Rate limit check failed", error);
    return true;
  }
  return data !== false;
}
