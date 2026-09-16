import { ImagePlus } from "lucide-react";
import { useId } from "react";
import { MAX_PRODUCT_IMAGE_BYTES, PRODUCT_IMAGE_ACCEPT } from "@/lib/storage/product-images";
import { cn } from "@/lib/utils";

/** Click-or-drop picker for product images. Validation happens in the caller. */
export function ImageDropzone({ onFiles, disabled }: { onFiles: (files: File[]) => void; disabled?: boolean }) {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (!disabled && event.dataTransfer.files.length > 0) onFiles(Array.from(event.dataTransfer.files));
      }}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-espresso/20 bg-linen/30 px-4 py-9 text-center transition duration-300 hover:border-espresso/40 hover:bg-linen/70",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-espresso",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-white text-espresso shadow-soft transition-transform duration-500 ease-luxe group-hover:-translate-y-0.5">
        <ImagePlus className="size-5" strokeWidth={1.5} aria-hidden />
      </span>
      <span className="text-sm font-medium text-espresso">Click to add images or drag them here</span>
      <span className="text-xs text-muted">
        JPG, PNG, WebP or AVIF, up to {MAX_PRODUCT_IMAGE_BYTES / 1024 / 1024} MB each
      </span>
      <input
        id={inputId}
        type="file"
        accept={PRODUCT_IMAGE_ACCEPT}
        multiple
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length > 0) onFiles(files);
        }}
      />
    </label>
  );
}
