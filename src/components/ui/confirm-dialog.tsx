"use client";

import { LoaderCircle, TriangleAlert } from "lucide-react";
import { useId } from "react";
import { useModalDialog } from "@/hooks/use-modal-dialog";
import { Button } from "./button";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "danger" | "default";
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmOptions & {
  open: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useModalDialog(open);
  const id = useId();

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(event) => {
        // Keep the dialog open (and the result visible) while the action runs.
        if (pending) event.preventDefault();
      }}
      onClose={onCancel}
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) dialogRef.current?.close();
      }}
      className="modal m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl bg-white p-0 text-left text-espresso shadow-lift"
    >
      <div className="flex gap-4 p-6">
        {tone === "danger" && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rust/10 text-rust">
            <TriangleAlert className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="font-display text-2xl leading-tight font-medium">
            {title}
          </h2>
          {description && (
            <p id={`${id}-description`} className="mt-2 text-sm leading-relaxed text-muted">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-espresso/8 bg-linen/40 px-6 py-4">
        <Button variant="secondary" onClick={() => dialogRef.current?.close()} disabled={pending}>
          Cancel
        </Button>
        <Button
          variant={tone === "danger" ? "destructive" : "primary"}
          onClick={onConfirm}
          disabled={pending}
          aria-busy={pending || undefined}
        >
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
