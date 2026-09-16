import { z } from "zod";
import { isUuid } from "./utils";

/** Fits numeric(12, 2). */
const MONEY_PATTERN = /^\d{1,10}(\.\d{1,2})?$/;
const STOCK_PATTERN = /^\d{1,6}$/;

export const productSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(200, "Keep the title under 200 characters."),
    description: z.string().trim().max(5000, "Keep the description under 5,000 characters."),
    price: z.string().trim().regex(MONEY_PATTERN, "Enter a price, e.g. 499 or 499.99."),
    sale_price: z
      .string()
      .trim()
      .refine((value) => value === "" || MONEY_PATTERN.test(value), "Enter a sale price, e.g. 399 or 399.99."),
    category_id: z.string().refine((value) => value === "" || isUuid(value), "Choose a valid category."),
    is_on_sale: z.boolean(),
    stock_quantity: z
      .string()
      .trim()
      .refine((value) => value === "" || STOCK_PATTERN.test(value), "Enter a whole number, or leave it blank."),
    is_featured: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.is_on_sale && data.sale_price === "") {
      ctx.addIssue({ code: "custom", path: ["sale_price"], message: "Set a sale price to put this product on sale." });
    }
    if (MONEY_PATTERN.test(data.sale_price) && Number(data.sale_price) >= Number(data.price)) {
      ctx.addIssue({ code: "custom", path: ["sale_price"], message: "Sale price must be lower than the price." });
    }
  })
  .transform((data) => ({
    title: data.title,
    description: data.description || null,
    price: Number(data.price),
    sale_price: data.sale_price === "" ? null : Number(data.sale_price),
    category_id: data.category_id || null,
    is_on_sale: data.is_on_sale,
    stock_quantity: data.stock_quantity === "" ? null : Number(data.stock_quantity),
    is_featured: data.is_featured,
  }));

export function readProductForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    title: text("title"),
    description: text("description"),
    price: text("price"),
    sale_price: text("sale_price"),
    category_id: text("category_id"),
    is_on_sale: formData.get("is_on_sale") === "on",
    stock_quantity: text("stock_quantity"),
    is_featured: formData.get("is_featured") === "on",
  };
}
