import { z } from "zod";
import { normalizePakistaniMobile } from "./checkout";

const emailSchema = z.email();

const optionalEmail = z
  .string()
  .trim()
  .max(254, "Keep the email under 254 characters.")
  .refine((value) => value === "" || emailSchema.safeParse(value).success, "Enter a valid email address.");

/** A message sent from the public contact form. */
export const contactMessageSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name.").max(100, "Keep your name under 100 characters."),
    email: z
      .string()
      .trim()
      .max(254, "Keep your email under 254 characters.")
      .refine((value) => emailSchema.safeParse(value).success, "Enter a valid email address so we can reply."),
    phone: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || normalizePakistaniMobile(value) !== null,
        "Enter a valid mobile number, e.g. 0300 1234567, or leave it blank.",
      ),
    message: z
      .string()
      .trim()
      .min(10, "Tell us a little more (at least 10 characters).")
      .max(3000, "Keep your message under 3,000 characters."),
  })
  .transform((data) => ({
    name: data.name,
    email: data.email,
    phone: data.phone ? normalizePakistaniMobile(data.phone) : null,
    message: data.message,
  }));

export function readContactMessageForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  return { name: text("name"), email: text("email"), phone: text("phone"), message: text("message") };
}

/** A support contact or department managed in the admin panel. */
export const contactPersonSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a name.").max(80, "Keep the name under 80 characters."),
    department: z.string().trim().min(1, "Enter a department or role.").max(80, "Keep this under 80 characters."),
    phone: z
      .string()
      .trim()
      .max(20, "Keep the number under 20 characters.")
      .refine(
        (value) => value === "" || /^\+?[\d\s()-]{7,20}$/.test(value),
        "Enter a valid phone number, e.g. 0300 1234567 or 041 1234567.",
      ),
    is_whatsapp: z.boolean(),
    email: optionalEmail,
    hours: z.string().trim().max(80, "Keep the hours under 80 characters."),
    sort_order: z.coerce
      .number("Enter a number.")
      .int("Use a whole number.")
      .min(0, "Use 0 or more.")
      .max(999, "Use 999 or less."),
    is_published: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.phone === "" && data.email === "") {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Add a phone number or an email." });
    }
    if (data.is_whatsapp && normalizePakistaniMobile(data.phone) === null) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "WhatsApp needs a mobile number, e.g. 0300 1234567." });
    }
  })
  .transform((data) => ({
    name: data.name,
    department: data.department,
    // Mobiles are stored as +92XXXXXXXXXX so WhatsApp links work; landlines are kept as typed.
    phone: data.phone ? (normalizePakistaniMobile(data.phone) ?? data.phone) : null,
    is_whatsapp: data.is_whatsapp,
    email: data.email || null,
    hours: data.hours || null,
    sort_order: data.sort_order,
    is_published: data.is_published,
  }));

export function readContactPersonForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    name: text("name"),
    department: text("department"),
    phone: text("phone"),
    is_whatsapp: formData.get("is_whatsapp") === "on",
    email: text("email"),
    hours: text("hours"),
    sort_order: text("sort_order") || "0",
    is_published: formData.get("is_published") === "on",
  };
}
