"use client";

import { startTransition, useActionState, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ConfirmDialog, type ConfirmOptions } from "@/components/ui/confirm-dialog";
import { initialActionState, type ActionState } from "@/lib/action-state";

type ActionButtonProps = Omit<ButtonProps, "type" | "onClick"> & {
  /** Usually a Server Action with its arguments bound, e.g. `deleteReview.bind(null, id)`. */
  action: (state: ActionState) => Promise<ActionState>;
  /** Asks for confirmation in a dialog before running the action. */
  confirm?: ConfirmOptions;
  /** Shorthand for `confirm` with a generic title. */
  confirmMessage?: string;
};

/** A button that runs a Server Action (optionally after confirming) and shows its error, if any. */
export function ActionButton({ action, confirm, confirmMessage, disabled, ...buttonProps }: ActionButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, dispatch, pending] = useActionState<ActionState>(async (previous) => {
    const result = await action(previous);
    setConfirmOpen(false);
    return result;
  }, initialActionState);

  const confirmation = confirm ?? (confirmMessage ? { title: "Are you sure?", description: confirmMessage } : undefined);
  const run = () => startTransition(() => dispatch());

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        type="button"
        onClick={() => (confirmation ? setConfirmOpen(true) : run())}
        disabled={pending || disabled}
        aria-busy={pending || undefined}
        {...buttonProps}
      />
      {state.status === "error" && (
        <p role="alert" className="max-w-56 text-right text-xs text-rust">
          {state.message}
        </p>
      )}
      {confirmation && (
        <ConfirmDialog
          {...confirmation}
          open={confirmOpen}
          pending={pending}
          onConfirm={run}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
