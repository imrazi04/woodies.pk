import { z } from "zod";
import { isStorageImageUrl } from "@/lib/storage/public-photos";
import { normalizePakistaniMobile } from "./checkout";

const emailSchema = z.email();

export const teamMemberSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a name.").max(80, "Keep the name under 80 characters."),
    role: z.string().trim().min(1, "Enter a role or designation.").max(80, "Keep this under 80 characters."),
    bio: z.string().trim().max(600, "Keep the bio under 600 characters."),
    image_url: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || isStorageImageUrl(value),
        "Upload a photo, or use an image link from this store's Supabase Storage.",
      ),
    phone: z
      .string()
      .trim()
      .max(20, "Keep the number under 20 characters.")
      .refine(
        (value) => value === "" || /^\+?[\d\s()-]{7,20}$/.test(value),
        "Enter a valid phone number, e.g. 0300 1234567.",
      ),
    is_whatsapp: z.boolean(),
    email: z
      .string()
      .trim()
      .max(254, "Keep the email under 254 characters.")
      .refine((value) => value === "" || emailSchema.safeParse(value).success, "Enter a valid email address."),
    display_order: z.coerce
      .number("Enter a number.")
      .int("Use a whole number.")
      .min(0, "Use 0 or more.")
      .max(999, "Use 999 or less."),
    is_published: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.is_whatsapp && normalizePakistaniMobile(data.phone) === null) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "WhatsApp needs a mobile number, e.g. 0300 1234567." });
    }
  })
  .transform((data) => ({
    name: data.name,
    role: data.role,
    bio: data.bio || null,
    image_url: data.image_url || null,
    // Mobiles are stored as +92XXXXXXXXXX so WhatsApp links work; landlines are kept as typed.
    phone: data.phone ? (normalizePakistaniMobile(data.phone) ?? data.phone) : null,
    is_whatsapp: data.is_whatsapp,
    email: data.email || null,
    display_order: data.display_order,
    is_published: data.is_published,
  }));

export function readTeamMemberForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    name: text("name"),
    role: text("role"),
    bio: text("bio"),
    image_url: text("image_url"),
    phone: text("phone"),
    is_whatsapp: formData.get("is_whatsapp") === "on",
    email: text("email"),
    display_order: text("display_order") || "0",
    is_published: formData.get("is_published") === "on",
  };
}
