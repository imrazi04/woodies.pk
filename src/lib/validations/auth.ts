import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string("Enter your password.").min(1, "Enter your password."),
});
