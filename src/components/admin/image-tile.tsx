import { Trash2 } from "lucide-react";
import Image from "next/image";

const overlayButton =
  "rounded-lg bg-white/90 text-xs font-medium text-espresso shadow-soft backdrop-blur transition-colors hover:bg-white disabled:opacity-50";

export function ImageTile({
  src,
  isPrimary,
  onMakePrimary,
  onRemove,
  disabled,
  preview,
}: {
  src: string;
  isPrimary: boolean;
  onMakePrimary: () => void;
  onRemove: () => void;
  disabled?: boolean;
  /** A local blob: URL, which next/image can't load. */
  preview?: boolean;
}) {
  return (
    <li className="group relative aspect-square overflow-hidden rounded-xl bg-linen ring-1 ring-espresso/6">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob: previews can't go through next/image
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 640px) 220px, 50vw"
          className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
        />
      )}

      {isPrimary && (
        <span className="absolute top-2 left-2 rounded-full bg-espresso/85 px-2.5 py-0.5 text-[11px] font-medium text-cream backdrop-blur">
          Primary
        </span>
      )}

      <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
        {isPrimary ? (
          <span />
        ) : (
          <button type="button" onClick={onMakePrimary} disabled={disabled} className={`${overlayButton} px-2.5 py-1`}>
            Make primary
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove image"
          className={`${overlayButton} p-1.5 text-rust`}
        >
          <Trash2 className="size-3.5" aria-hidden />
        </button>
      </div>
    </li>
  );
}
