import "server-only";
import { z } from "zod";
import { siteConfig } from "@/config/site";
import type { ServerSupabaseClient } from "@/lib/supabase/server";

const dashboardStatsSchema = z.object({
  sales_period: z.number(),
  sales_previous: z.number(),
  orders_period: z.number(),
  orders_previous: z.number(),
  status_counts: z.record(z.string(), z.number()),
  low_stock: z.number(),
  sold_out: z.number(),
  visible_reviews: z.number(),
  hidden_reviews: z.number(),
  average_rating: z.number().nullable(),
  daily: z.array(z.object({ date: z.string(), sales: z.number(), orders: z.number() })),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

/** Sales, order, inventory and review figures for the last `days` days, from one database call. */
export async function getDashboardStats(supabase: ServerSupabaseClient, days: number): Promise<DashboardStats> {
  const { data, error } = await supabase.rpc("admin_dashboard_stats", {
    p_days: days,
    p_timezone: siteConfig.timeZone,
  });
  if (error) throw new Error(`Failed to load dashboard stats: ${error.message}`);
  return dashboardStatsSchema.parse(data);
}

/** Percentage change, or null when there is no previous value to compare with. */
export function percentChange(current: number, previous: number) {
  return previous === 0 ? null : ((current - previous) / previous) * 100;
}
