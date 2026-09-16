"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useModalDialog } from "@/hooks/use-modal-dialog";
import { GalleryArrow } from "./gallery-arrow";

export type LightboxState = { photos: string[]; index: number; author: string };

export function ReviewPhotoLightbox({
  state,
  onIndexChange,
  onClose,
}: {
  state: LightboxState | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useModalDialog(state !== null);
  const count = state?.photos.length ?? 0;
  const url = state?.photos[state.index];
  const show = (index: number) => onIndexChange((index + count) % count);

  return (
    <dialog
      ref={dialogRef}
      aria-label={state ? `Photos from ${state.author}'s review` : "Review photos"}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
      onKeyDown={(event) => {
        if (!state || count < 2) return;
        if (event.key === "ArrowRight") show(state.index + 1);
        else if (event.key === "ArrowLeft") show(state.index - 1);
      }}
      className="modal m-auto h-[min(90dvh,52rem)] w-[calc(100%-2rem)] max-w-4xl overflow-hidden rounded-3xl bg-espresso p-0 text-cream shadow-lift"
    >
      {state && url && (
        <div className="flex h-full flex-col font-body">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <p className="text-sm text-cream/75">
              {state.author} · {state.index + 1} / {count}
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-cream/10"
            >
              <X className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
          <div className="relative flex-1">
            <Image
              key={url}
              src={url}
              alt={`Photo ${state.index + 1} from ${state.author}'s review`}
              fill
              sizes="(min-width: 896px) 896px, 100vw"
              className="animate-fade-in object-contain px-4 [animation-duration:400ms]"
            />
          </div>
          {count > 1 && (
            <div className="flex items-center justify-center gap-4 py-4">
              <GalleryArrow direction="previous" onClick={() => show(state.index - 1)} />
              <GalleryArrow direction="next" onClick={() => show(state.index + 1)} />
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
