"use client";

import { ImagePlus, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input } from "@/components/ui/form-fields";
import { isStorageImageUrl, PHOTO_ACCEPT, validatePhotoFile, type PhotoBucket } from "@/lib/storage/public-photos";
import { uploadPublicPhoto } from "@/lib/storage/upload-public-photo";
import { cn } from "@/lib/utils";

/** State for a photo that is either a chosen file (uploaded on save) or a link to an existing image. */
export function usePhotoPicker(initialUrl: string | null | undefined) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [file, setFile] = useState<{ file: File; preview: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Release the preview's memory when it's replaced or the form unmounts.
  useEffect(
    () => () => {
      if (file) URL.revokeObjectURL(file.preview);
    },
    [file],
  );

  return {
    url,
    file,
    error,
    /** Only links that can actually be saved are previewed (and loaded under the site's image policy). */
    previewSrc: file?.preview ?? (isStorageImageUrl(url) ? url : null),
    hasPhoto: file !== null || url !== "",
    choose(next: File) {
      const invalid = validatePhotoFile(next);
      setError(invalid);
      if (!invalid) setFile({ file: next, preview: URL.createObjectURL(next) });
    },
    setLink(next: string) {
      setUrl(next);
      setError(null);
    },
    clear() {
      setFile(null);
      setUrl("");
      setError(null);
    },
    /** Uploads a chosen file and returns its URL; otherwise returns the link ("" for no photo). */
    async resolve(bucket: PhotoBucket): Promise<{ url: string; uploaded: boolean }> {
      if (!file) return { url, uploaded: false };
      return { url: await uploadPublicPhoto(bucket, file.file), uploaded: true };
    },
  };
}

export type PhotoPickerState = ReturnType<typeof usePhotoPicker>;

export function PhotoPicker({
  picker,
  label = "Photo",
  hint,
  aspect = "portrait",
  serverError,
  disabled,
}: {
  picker: PhotoPickerState;
  label?: string;
  hint?: string;
  aspect?: "portrait" | "landscape";
  serverError?: string;
  disabled?: boolean;
}) {
  const fileInputId = useId();
  const message = picker.error ?? serverError;

  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-espresso">{label}</p>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-xl bg-linen ring-1 ring-espresso/8",
            aspect === "portrait" ? "aspect-[4/5] w-24" : "aspect-[4/3] w-32",
          )}
        >
          {picker.previewSrc ? (
            <Image src={picker.previewSrc} alt="" fill sizes="128px" unoptimized className="object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-taupe/60">
              <ImageIcon className="size-7" strokeWidth={1.25} aria-hidden />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <label
            htmlFor={fileInputId}
            className={buttonClasses({
              variant: "secondary",
              size: "sm",
              className: cn(
                "cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-espresso",
                disabled && "pointer-events-none opacity-50",
              ),
            })}
          >
            <ImagePlus className="size-3.5" aria-hidden />
            {picker.hasPhoto ? "Replace" : "Upload"}
            <input
              id={fileInputId}
              type="file"
              accept={PHOTO_ACCEPT}
              disabled={disabled}
              className="sr-only"
              onChange={(event) => {
                const next = event.target.files?.[0];
                event.target.value = "";
                if (next) picker.choose(next);
              }}
            />
          </label>
          {picker.hasPhoto && (
            <Button variant="ghost" size="sm" onClick={picker.clear} disabled={disabled}>
              <X className="size-3.5" aria-hidden />
              Remove
            </Button>
          )}
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      </div>
      {!picker.file && (
        <Input
          id="image_url"
          aria-label={`Or paste a link for the ${label.toLowerCase()}`}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? "image_url-error" : undefined}
          value={picker.url}
          onChange={(event) => picker.setLink(event.target.value)}
          placeholder="Or paste an image link from your store's storage"
          disabled={disabled}
          className="mt-3"
        />
      )}
      {message && (
        <p id="image_url-error" className="mt-1.5 text-xs text-rust">
          {message}
        </p>
      )}
    </div>
  );
}
