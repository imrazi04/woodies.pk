"use client";

import { BadgeCheck, Camera, Check, ChevronDown, LoaderCircle, Pencil, Star, X } from "lucide-react";
import { useState } from "react";
import { submitReview } from "@/actions/product-reviews";
import { useActionForm } from "@/hooks/use-action-form";
import { useModalDialog } from "@/hooks/use-modal-dialog";
import { compressImage } from "@/lib/reviews/compress-image";
import { MAX_REVIEW_PHOTO_BYTES, MAX_REVIEW_PHOTOS, REVIEW_PHOTO_ACCEPT } from "@/lib/reviews/constants";
import { cn } from "@/lib/utils";
import { shopButtonClasses } from "./shop-button";
import { ShopField, ShopTextarea } from "./shop-field";

const RATING_LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

type StagedPhoto = { file: File; previewUrl: string };

export function ReviewFormDialog({
  productId,
  productTitle,
  className,
}: {
  productId: string;
  productTitle: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  // A new key after closing gives the next review a fresh, empty form.
  const [formKey, setFormKey] = useState(0);
  const dialogRef = useModalDialog(open);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={shopButtonClasses({ className })}
      >
        <Pencil className="size-4" strokeWidth={1.75} aria-hidden />
        Write a review
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="review-dialog-title"
        onClose={() => {
          setOpen(false);
          setFormKey((key) => key + 1);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="modal m-auto max-h-[min(92dvh,60rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto overscroll-contain rounded-3xl bg-cream p-0 text-espresso shadow-lift"
      >
        <ReviewForm
          key={formKey}
          productId={productId}
          productTitle={productTitle}
          onClose={() => dialogRef.current?.close()}
        />
      </dialog>
    </>
  );
}

function ReviewForm({
  productId,
  productTitle,
  onClose,
}: {
  productId: string;
  productTitle: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState<StagedPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const { state, pending, onSubmit } = useActionForm(async (prev, formData) => {
    formData.delete("photos");
    photos.forEach((photo) => formData.append("photos", photo.file));
    return submitReview(productId, prev, formData);
  });
  const errors = state.fieldErrors;

  async function addPhotos(files: File[]) {
    const room = MAX_REVIEW_PHOTOS - photos.length;
    setPhotoError(files.length > room ? `You can add up to ${MAX_REVIEW_PHOTOS} photos.` : null);
    if (room <= 0) return;

    setProcessingPhotos(true);
    const accepted: StagedPhoto[] = [];
    for (const file of files.slice(0, room)) {
      try {
        const compressed = await compressImage(file);
        if (compressed.size > MAX_REVIEW_PHOTO_BYTES) {
          setPhotoError("One photo is too large to upload. Try a smaller one.");
          continue;
        }
        accepted.push({ file: compressed, previewUrl: URL.createObjectURL(compressed) });
      } catch {
        setPhotoError("One of your photos couldn't be read. Please use a JPG, PNG or WebP image.");
      }
    }
    setPhotos((current) => [...current, ...accepted]);
    setProcessingPhotos(false);
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photos[index].previewUrl);
    setPhotos((current) => current.filter((_, i) => i !== index));
    setPhotoError(null);
  }

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center sm:px-10">
        <div className="flex size-14 animate-fade-up items-center justify-center rounded-full bg-olive text-cream">
          <Check className="size-6" strokeWidth={2} aria-hidden />
        </div>
        <h2 id="review-dialog-title" className="mt-6 font-display text-4xl">
          Thank you
        </h2>
        <p role="status" className="mt-3 max-w-sm leading-relaxed text-taupe">
          {state.message} It helps other customers choose with confidence.
        </p>
        <button type="button" onClick={onClose} className={shopButtonClasses({ className: "mt-8" })}>
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex items-start justify-between gap-4 border-b border-espresso/10 px-6 pt-6 pb-5 sm:px-8">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-clay uppercase">Write a review</p>
          <h2 id="review-dialog-title" className="mt-2 font-display text-3xl leading-tight font-medium text-balance">
            {productTitle}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mt-1 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-espresso/5"
        >
          <X className="size-5" strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      <div className="space-y-6 px-6 py-6 sm:px-8">
        {/* Honeypot for bots: invisible to customers and assistive technology. */}
        <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <StarInput value={rating} onChange={setRating} error={errors?.rating?.[0]} />

        <ShopField
          label="Your name"
          name="customer_name"
          autoComplete="name"
          placeholder="Shown with your review"
          maxLength={60}
          required
          errors={errors}
        />

        <ShopTextarea
          label="Your review"
          name="comment"
          placeholder="What do you love about it? How does it look in your home?"
          rows={5}
          maxLength={2000}
          required
          errors={errors}
        />

        <div>
          <p className="mb-2 flex items-baseline justify-between gap-3 text-[13px] font-medium">
            Photos
            <span className="text-xs font-normal text-taupe">Optional · up to {MAX_REVIEW_PHOTOS}</span>
          </p>
          <ul className="flex flex-wrap gap-3">
            {photos.map((photo, index) => (
              <li key={photo.previewUrl} className="relative size-20 overflow-hidden rounded-xl bg-linen">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={photo.previewUrl} alt={`Photo ${index + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-cream/90 text-espresso shadow-soft transition hover:bg-cream"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
            {photos.length < MAX_REVIEW_PHOTOS && (
              <li>
                <label
                  className={cn(
                    "flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-espresso/25 text-taupe transition-colors hover:border-espresso/50 hover:text-espresso",
                    "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-espresso",
                    (processingPhotos || pending) && "pointer-events-none opacity-60",
                  )}
                >
                  {processingPhotos ? (
                    <LoaderCircle className="size-5 animate-spin" aria-hidden />
                  ) : (
                    <Camera className="size-5" strokeWidth={1.5} aria-hidden />
                  )}
                  <span className="text-[11px] font-medium">{processingPhotos ? "Adding…" : "Add"}</span>
                  <input
                    type="file"
                    accept={REVIEW_PHOTO_ACCEPT}
                    multiple
                    disabled={processingPhotos || pending}
                    aria-label="Add photos"
                    className="sr-only"
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []);
                      event.target.value = "";
                      if (files.length > 0) void addPhotos(files);
                    }}
                  />
                </label>
              </li>
            )}
          </ul>
          {photoError && (
            <p role="alert" className="mt-2 text-[13px] text-rust">
              {photoError}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-linen/80 p-4">
          <button
            type="button"
            onClick={() => setVerifyOpen((open) => !open)}
            aria-expanded={verifyOpen}
            aria-controls="verify-purchase"
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <span className="flex items-center gap-3">
              <BadgeCheck className="size-5 shrink-0 text-olive" strokeWidth={1.75} aria-hidden />
              <span>
                <span className="block text-sm font-medium">Bought this from us?</span>
                <span className="block text-xs text-taupe">Add your order number to get a “Verified buyer” badge.</span>
              </span>
            </span>
            <ChevronDown
              className={cn("size-4 shrink-0 transition-transform duration-300", verifyOpen && "rotate-180")}
              aria-hidden
            />
          </button>
          {verifyOpen && (
            <div id="verify-purchase" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <ShopField label="Order number" name="order_number" placeholder="WP-10001" autoComplete="off" errors={errors} />
                <ShopField
                  label="Mobile number"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0300 1234567"
                  errors={errors}
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-taupe">
                Only used to confirm your purchase. Your order details are never shown.
              </p>
            </div>
          )}
        </div>

        {state.status === "error" && state.message && (
          <p role="alert" className="rounded-2xl bg-rust/10 px-4 py-3 text-sm text-rust">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || processingPhotos}
          aria-busy={pending || undefined}
          className={shopButtonClasses({ size: "lg", className: "w-full disabled:opacity-60" })}
        >
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {pending ? "Posting review…" : "Post review"}
        </button>
      </div>
    </form>
  );
}

function StarInput({ value, onChange, error }: { value: number; onChange: (value: number) => void; error?: string }) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <fieldset aria-describedby={error ? "rating-error" : undefined}>
      <legend className="mb-2 text-[13px] font-medium">Your rating</legend>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="-ml-1 flex" onPointerLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className="cursor-pointer p-1" onPointerEnter={() => setHovered(star)}>
              <input
                type="radio"
                name="rating"
                value={star}
                checked={value === star}
                onChange={() => onChange(star)}
                className="peer sr-only"
              />
              <span className="sr-only">
                {star} {star === 1 ? "star" : "stars"}, {RATING_LABELS[star - 1]}
              </span>
              <Star
                aria-hidden
                strokeWidth={1.5}
                className={cn(
                  "size-7 rounded-sm transition sm:size-8 duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-espresso",
                  star <= shown ? "scale-105 fill-gold text-gold" : "text-sand",
                )}
              />
            </label>
          ))}
        </div>
        <span aria-hidden className="text-sm text-taupe">
          {shown ? RATING_LABELS[shown - 1] : ""}
        </span>
      </div>
      {error && (
        <p id="rating-error" className="mt-1 text-[13px] text-rust">
          {error}
        </p>
      )}
    </fieldset>
  );
}
