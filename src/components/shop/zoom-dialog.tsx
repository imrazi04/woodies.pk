"use client";

import { X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { GalleryArrow } from "./gallery-arrow";
import type { GalleryImage } from "./product-gallery";

/** Zoomed images are at least this many times the viewport width, or their native size if larger. */
const MIN_ZOOM = 1.75;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

type Size = { width: number; height: number };

/**
 * Full-screen inspection view. Uses the original uploaded file (not a resized copy),
 * and zooms to its native resolution so fine details stay sharp.
 */
export function ZoomDialog({
  images,
  title,
  open,
  index,
  onIndexChange,
  onClose,
}: {
  images: GalleryImage[];
  title: string;
  open: boolean;
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const focusPoint = useRef({ x: 0.5, y: 0.5 });
  const [natural, setNatural] = useState<Size | null>(null);
  const [zoomWidth, setZoomWidth] = useState<number | null>(null);
  const image = images[index];
  const count = images.length;
  const zoomed = zoomWidth !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  // After zooming in, scroll so the chosen point is in view.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!zoomWidth || !viewport) return;
    viewport.scrollLeft = focusPoint.current.x * (viewport.scrollWidth - viewport.clientWidth);
    viewport.scrollTop = focusPoint.current.y * (viewport.scrollHeight - viewport.clientHeight);
  }, [zoomWidth]);

  function zoomIn(point: { x: number; y: number }) {
    const viewport = viewportRef.current;
    if (!natural || !viewport) return;
    focusPoint.current = point;
    setZoomWidth(Math.max(natural.width / window.devicePixelRatio, viewport.clientWidth * MIN_ZOOM));
  }

  function goTo(next: number) {
    setZoomWidth(null);
    setNatural(null);
    onIndexChange((next + count) % count);
  }

  function handleViewportClick(event: MouseEvent<HTMLDivElement>) {
    if (zoomed) {
      setZoomWidth(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    zoomIn({ x: clamp((event.clientX - rect.left) / rect.width), y: clamp((event.clientY - rect.top) / rect.height) });
  }

  // Mouse users pan by moving the pointer; touch users scroll natively.
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!zoomed || event.pointerType !== "mouse") return;
    const viewport = event.currentTarget;
    const rect = viewport.getBoundingClientRect();
    viewport.scrollLeft = clamp((event.clientX - rect.left) / rect.width) * (viewport.scrollWidth - viewport.clientWidth);
    viewport.scrollTop = clamp((event.clientY - rect.top) / rect.height) * (viewport.scrollHeight - viewport.clientHeight);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={`${title}, zoom view`}
      onClose={() => {
        setZoomWidth(null);
        onClose();
      }}
      onKeyDown={(event) => {
        if (count < 2) return;
        if (event.key === "ArrowRight") goTo(index + 1);
        else if (event.key === "ArrowLeft") goTo(index - 1);
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-cream p-0 text-espresso backdrop:bg-espresso/40 open:animate-fade-in open:[animation-duration:400ms]"
    >
      {open && image && (
        <div className="flex h-full flex-col font-body">
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <p className="truncate font-display text-xl sm:text-2xl">{title}</p>
            <div className="flex shrink-0 items-center gap-2">
              <p className="mr-2 hidden text-xs tracking-wide text-taupe md:block">
                {zoomed ? "Move to explore · click to zoom out" : "Click the image to zoom in"}
              </p>
              <button
                type="button"
                onClick={() => (zoomed ? setZoomWidth(null) : zoomIn({ x: 0.5, y: 0.5 }))}
                disabled={!natural}
                aria-label={zoomed ? "Zoom out" : "Zoom in"}
                className="flex size-11 items-center justify-center rounded-full ring-1 ring-espresso/15 transition duration-300 ring-inset hover:bg-espresso hover:text-cream disabled:opacity-40"
              >
                {zoomed ? (
                  <ZoomOut className="size-5" strokeWidth={1.5} aria-hidden />
                ) : (
                  <ZoomIn className="size-5" strokeWidth={1.5} aria-hidden />
                )}
              </button>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close"
                className="flex size-11 items-center justify-center rounded-full ring-1 ring-espresso/15 transition duration-300 ring-inset hover:bg-espresso hover:text-cream"
              >
                <X className="size-5" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
          </div>

          <div
            ref={viewportRef}
            onClick={handleViewportClick}
            onPointerMove={handlePointerMove}
            className={cn(
              "relative flex-1 overscroll-contain",
              zoomed ? "cursor-zoom-out overflow-auto" : "cursor-zoom-in overflow-hidden",
            )}
          >
            {zoomed && natural ? (
              // eslint-disable-next-line @next/next/no-img-element -- full-resolution original, explicitly sized for panning
              <img
                src={image.url}
                alt={title}
                draggable={false}
                className="max-w-none select-none"
                style={{ width: zoomWidth, height: (zoomWidth ?? 0) * (natural.height / natural.width) }}
              />
            ) : (
              <Image
                key={image.id}
                src={image.url}
                alt={title}
                fill
                unoptimized
                className="object-contain p-4 sm:p-10"
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget;
                  setNatural({ width: naturalWidth, height: naturalHeight });
                }}
              />
            )}
          </div>

          {count > 1 && (
            <div className="flex items-center justify-center gap-5 py-4">
              <GalleryArrow direction="previous" onClick={() => goTo(index - 1)} />
              <span className="text-sm text-taupe tabular-nums">
                {index + 1} / {count}
              </span>
              <GalleryArrow direction="next" onClick={() => goTo(index + 1)} />
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
