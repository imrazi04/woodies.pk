import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/orders";

export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, "Choose a valid status."),
});
