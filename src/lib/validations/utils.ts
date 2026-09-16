import { z } from "zod";
import type { ActionState } from "@/lib/action-state";

export function validationError(error: z.ZodError): ActionState<never> {
  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}

const uuidSchema = z.uuid();

export function isUuid(value: unknown): value is string {
  return uuidSchema.safeParse(value).success;
}
