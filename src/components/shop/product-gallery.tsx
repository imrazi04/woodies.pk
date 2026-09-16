"use client";

import { Maximize2 } from "lucide-react";
import Image from "next/image";
import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { GalleryArrow } from "./gallery-arrow";
import { ZoomDialog } from "./zoom-dialog";

export type GalleryImage = { id: string; url: string };

/** Magnification of the hover lens. */
const LENS_ZOOM = 2.5;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const count = images.length;

  if (count === 0) {
    return (
      <div
        aria-hidden
        className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-linen font-display text-9xl text-espresso/15"
      >
        {title.charAt(0)}
      </div>
    );
  }

  const active = images[activeIndex];
  const show = (index: number) => setActiveIndex((index + count) % count);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setLens({
      x: clamp((event.clientX - rect.left) / rect.width),
      y: clamp((event.clientY - rect.top) / rect.height),
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (count < 2 || zoomOpen) return;
    if (event.key === "ArrowRight") show(activeIndex + 1);
    else if (event.key === "ArrowLeft") show(activeIndex - 1);
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:gap-5" onKeyDown={handleKeyDown}>
      <div
        className="group relative aspect-[4/5] flex-1 overflow-hidden rounded-3xl bg-linen"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setLens(null)}
      >
        {/* All images stay mounted so switching is instant and cross-fades. */}
        {images.map((image, index) => (
          <Image
            key={image.id}
            src={image.url}
            alt={index === activeIndex ? `${title}, image ${index + 1} of ${count}` : ""}
            aria-hidden={index !== activeIndex}
            fill
            preload={index === 0}
            quality={90}
            sizes="(min-width: 1024px) 55vw, 100vw"
            className={cn(
              "object-cover transition-[opacity,scale] duration-700 ease-luxe",
              index === activeIndex ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
            )}
          />
        ))}

        {/* Hover lens (mouse only): a 2.5× larger render of the same image, shifted so the point under the cursor stays put. */}
        {lens && (
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
            <div
              className="absolute"
              style={{
                width: `${LENS_ZOOM * 100}%`,
                height: `${LENS_ZOOM * 100}%`,
                left: `${-lens.x * (LENS_ZOOM - 1) * 100}%`,
                top: `${-lens.y * (LENS_ZOOM - 1) * 100}%`,
              }}
            >
              <Image
                src={active.url}
                alt=""
                fill
                quality={90}
                sizes={`(min-width: 1024px) ${Math.round(55 * LENS_ZOOM)}vw, ${LENS_ZOOM * 100}vw`}
                className="object-cover"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          aria-label={`Open full-screen zoom of ${title}`}
          className="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-espresso"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-cream/90 text-espresso shadow-soft backdrop-blur transition-opacity duration-500 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-within:opacity-100"
        >
          <Maximize2 className="size-4" strokeWidth={1.5} />
        </span>

        {count > 1 && (
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between">
            <span className="rounded-full bg-cream/90 px-3 py-1.5 text-xs font-medium tabular-nums backdrop-blur">
              {activeIndex + 1} / {count}
            </span>
            <div className="pointer-events-auto flex gap-2 transition-opacity duration-500 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-within:opacity-100 md:focus-within:opacity-100">
              <GalleryArrow direction="previous" onClick={() => show(activeIndex - 1)} />
              <GalleryArrow direction="next" onClick={() => show(activeIndex + 1)} />
            </div>
          </div>
        )}
      </div>

      {count > 1 && (
        <ul
          aria-label="Product images"
          className="-m-1 flex gap-3 overflow-x-auto p-1 lg:w-22 lg:shrink-0 lg:flex-col lg:overflow-visible"
        >
          {images.map((image, index) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1} of ${count}`}
                aria-pressed={index === activeIndex}
                className={cn(
                  "relative block size-18 overflow-hidden rounded-xl bg-linen transition duration-500 ease-luxe lg:size-20",
                  index === activeIndex
                    ? "opacity-100 ring-1 ring-espresso ring-offset-2 ring-offset-cream"
                    : "opacity-55 hover:opacity-100",
                )}
              >
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ZoomDialog
        images={images}
        title={title}
        open={zoomOpen}
        index={activeIndex}
        onIndexChange={setActiveIndex}
        onClose={() => setZoomOpen(false)}
      />
    </div>
  );
}
