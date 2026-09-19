import "server-only";
import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";
import type { ContactPerson } from "@/types/database";

export type PublicContact = Pick<
  ContactPerson,
  "id" | "name" | "department" | "phone" | "is_whatsapp" | "email" | "hours"
>;

/**
 * Published support contacts for the contact page, in the admin's chosen order.
 * An error returns an empty list, so the page still shows the store's main contact details.
 */
export const getPublishedContacts = cache(async (): Promise<PublicContact[]> => {
  const { data, error } = await getPublicClient()
    .from("contact_persons")
    .select("id, name, department, phone, is_whatsapp, email, hours")
    .eq("is_published", true)
    .order("sort_order")
    .order("created_at");
  if (error) {
    console.error("Failed to load contacts", error);
    return [];
  }
  return data;
});
