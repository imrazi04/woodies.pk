// Security probe: acts as an anonymous visitor (publishable key) and tries what an attacker would.
// Run with:  npm run security:rls
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const anon = createClient(url, key, { auth: { persistSession: false } });
const results = [];

function record(name, passed, detail) {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

/** The query must fail outright (no privilege). */
async function mustError(name, run) {
  const { error } = await run();
  record(name, Boolean(error), error ? `blocked: ${error.code ?? ""} ${error.message}`.trim() : "NO ERROR — allowed!");
}

/** The query may succeed but must return no rows (RLS filters them). */
async function mustBeEmpty(name, run) {
  const { data, error } = await run();
  if (error) return record(name, true, `blocked: ${error.code ?? ""} ${error.message}`.trim());
  const rows = Array.isArray(data) ? data.length : data ? 1 : 0;
  record(name, rows === 0, rows === 0 ? "no rows returned" : `${rows} row(s) returned — leaked!`);
}

/** Positive control: this must work for the storefront to function. */
async function mustSucceed(name, run) {
  const { error } = await run();
  record(name, !error, error ? `unexpectedly blocked: ${error.message}` : "allowed as intended");
}

console.log(`\nProbing ${url} as an anonymous visitor\n`);

// --- Reads that must be blocked -------------------------------------------------
await mustBeEmpty("orders are not readable", () => anon.from("orders").select("id, customer_name, phone, address"));
await mustBeEmpty("order items are not readable", () => anon.from("order_items").select("id, quantity, price"));
await mustBeEmpty("hidden reviews are not readable", () =>
  anon.from("reviews").select("id, comment").eq("is_visible", false),
);
await mustError("review submitter_hash column is not readable", () =>
  anon.from("reviews").select("id, submitter_hash"),
);
await mustError("review order_id column is not readable", () => anon.from("reviews").select("id, order_id"));
await mustError("select * on reviews is refused", () => anon.from("reviews").select("*"));
await mustError("rate_limits table is not readable", () => anon.from("rate_limits").select("bucket, identity"));
await mustError("contact messages are not readable", () => anon.from("contact_messages").select("id, email, message"));
await mustBeEmpty("draft heritage stories are not readable", () =>
  anon.from("chiniot_stories").select("id, title").eq("is_published", false),
);
await mustBeEmpty("hidden team members are not readable", () =>
  anon.from("team_members").select("id, name").eq("is_published", false),
);
await mustBeEmpty("hidden contacts are not readable", () =>
  anon.from("contact_persons").select("id, name").eq("is_published", false),
);

// --- Writes that must be blocked ------------------------------------------------
await mustError("cannot insert a product", () =>
  anon.from("products").insert({ title: "pwned", price: 1 }).select("id"),
);
await mustBeEmpty("cannot change a product price", () =>
  anon.from("products").update({ price: 1 }).neq("id", "00000000-0000-0000-0000-000000000000").select("id"),
);
await mustBeEmpty("cannot delete categories", () =>
  anon.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000").select("id"),
);
await mustError("cannot insert a review directly", () =>
  anon
    .from("reviews")
    .insert({ product_id: "00000000-0000-0000-0000-000000000000", customer_name: "bot", rating: 5 })
    .select("id"),
);
await mustError("cannot insert an order directly", () =>
  anon
    .from("orders")
    .insert({ customer_name: "bot", phone: "+923000000000", address: "x", total_amount: 0 })
    .select("id"),
);
await mustError("cannot insert a contact message directly", () =>
  anon
    .from("contact_messages")
    .insert({ name: "bot", email: "bot@example.com", message: "spam spam spam" })
    .select("id"),
);
await mustError("cannot add a heritage story", () =>
  anon.from("chiniot_stories").insert({ title: "pwned", slug: "pwned", content: "x" }).select("id"),
);
await mustBeEmpty("cannot change a heritage story", () =>
  anon
    .from("chiniot_stories")
    .update({ title: "pwned" })
    .neq("id", "00000000-0000-0000-0000-000000000000")
    .select("id"),
);
await mustError("cannot upload a heritage image", () =>
  anon.storage.from("heritage-images").upload(`probe-${Date.now()}.jpg`, new Blob(["x"], { type: "image/jpeg" })),
);
await mustError("cannot add a team member", () =>
  anon.from("team_members").insert({ name: "bot", role: "x" }).select("id"),
);
await mustBeEmpty("cannot change a team member", () =>
  anon.from("team_members").update({ name: "pwned" }).neq("id", "00000000-0000-0000-0000-000000000000").select("id"),
);
await mustBeEmpty("cannot delete team members", () =>
  anon.from("team_members").delete().neq("id", "00000000-0000-0000-0000-000000000000").select("id"),
);
await mustError("cannot upload a team photo", () =>
  anon.storage.from("team-photos").upload(`probe-${Date.now()}.jpg`, new Blob(["x"], { type: "image/jpeg" })),
);
await mustError("cannot add a contact person", () =>
  anon.from("contact_persons").insert({ name: "bot", department: "x", phone: "+923000000000" }).select("id"),
);
await mustBeEmpty("cannot change a contact person", () =>
  anon
    .from("contact_persons")
    .update({ phone: "+923000000000" })
    .neq("id", "00000000-0000-0000-0000-000000000000")
    .select("id"),
);
await mustBeEmpty("cannot change order status", () =>
  anon.from("orders").update({ status: "Delivered" }).neq("id", "00000000-0000-0000-0000-000000000000").select("id"),
);

// --- Privileged functions -------------------------------------------------------
await mustError("cannot call place_order", () =>
  anon.rpc("place_order", { p_customer: {}, p_items: [], p_idempotency_key: "00000000-0000-0000-0000-000000000000" }),
);
await mustError("cannot call consume_rate_limit", () =>
  anon.rpc("consume_rate_limit", { p_bucket: "x", p_identity: "x", p_limit: 1, p_window_seconds: 60 }),
);
await mustError("cannot call admin_dashboard_stats", () => anon.rpc("admin_dashboard_stats", { p_days: 14 }));
await mustError("cannot call set_primary_product_image", () =>
  anon.rpc("set_primary_product_image", { p_image_id: "00000000-0000-0000-0000-000000000000" }),
);

// --- Storage --------------------------------------------------------------------
const file = new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" });
await mustError("cannot upload to product-images", () =>
  anon.storage.from("product-images").upload(`probe-${Date.now()}.jpg`, file),
);
await mustError("cannot upload to review-images", () =>
  anon.storage.from("review-images").upload(`probe-${Date.now()}.jpg`, file),
);

// --- Positive controls (the storefront needs these) -----------------------------
await mustSucceed("can read products", () => anon.from("products").select("id, title, price").limit(1));
await mustSucceed("can read visible reviews", () =>
  anon.from("reviews").select("id, customer_name, rating, comment, image_urls, is_verified, created_at").limit(1),
);
await mustSucceed("can read rating summaries", () =>
  anon.from("product_rating_summaries").select("product_id, average_rating").limit(1),
);

const failed = results.filter((result) => !result.passed);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length > 0) {
  console.log("\nProblems:");
  for (const result of failed) console.log(`  - ${result.name}: ${result.detail}`);
}
process.exit(failed.length > 0 ? 1 : 0);
