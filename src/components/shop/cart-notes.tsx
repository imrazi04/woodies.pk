import { X } from "lucide-react";

/** Tells the customer what changed after the cart was refreshed from the database. */
export function CartNotes({ notes, onDismiss }: { notes: string[]; onDismiss: () => void }) {
  if (notes.length === 0) return null;

  return (
    <div role="status" className="rounded-2xl bg-sand/50 p-4 text-sm ring-1 ring-sand ring-inset">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">Your cart was updated</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-1 rounded-full p-1 text-taupe transition-colors hover:text-espresso"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-espresso/80">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}
