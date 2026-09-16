import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string("Name is required.")
    .trim()
    .min(1, "Name is required.")
    .max(80, "Keep the name under 80 characters."),
});
