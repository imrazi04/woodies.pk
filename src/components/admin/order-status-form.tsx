"use client";

import { updateOrderStatus } from "@/actions/orders";
import { FormMessage } from "@/components/ui/alert";
import { Label, Select } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useActionForm } from "@/hooks/use-action-form";
import { ORDER_STATUSES } from "@/lib/orders";
import type { OrderStatus } from "@/types/database";

export function OrderStatusForm({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const { state, pending, onSubmit } = useActionForm((prev, formData) => updateOrderStatus(orderId, prev, formData));

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label htmlFor="status">Update status</Label>
        <Select id="status" name="status" defaultValue={status}>
          {ORDER_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="w-full">
        Save status
      </SubmitButton>
    </form>
  );
}
