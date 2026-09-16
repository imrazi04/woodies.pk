import { z } from "zod";
import { normalizePakistaniMobile } from "./checkout";

const ORDER_NUMBER_PATTERN = /^WP-\d{5,}$/;

export const reviewSchema = z
  .object({
    customer_name: z.string().trim().min(2, "Enter your name.").max(60, "Keep your name under 60 characters."),
    rating: z.enum(["1", "2", "3", "4", "5"], "Choose a star rating."),
    comment: z
      .string()
      .trim()
      .min(10, "Tell us a little more (at least 10 characters).")
      .max(2000, "Keep your review under 2,000 characters."),
    order_number: z
      .string()
      .trim()
      .toUpperCase()
      .refine((value) => value === "" || ORDER_NUMBER_PATTERN.test(value), "Order numbers look like WP-10001."),
    phone: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (data.order_number !== "" && normalizePakistaniMobile(data.phone) === null) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter the mobile number you used for this order." });
    }
  })
  .transform((data) => ({
    customer_name: data.customer_name,
    rating: Number(data.rating),
    comment: data.comment,
    order_number: data.order_number || null,
    phone: data.order_number ? normalizePakistaniMobile(data.phone) : null,
  }));

export function readReviewForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    customer_name: text("customer_name"),
    rating: text("rating"),
    comment: text("comment"),
    order_number: text("order_number"),
    phone: text("phone"),
  };
}
