import { Package } from "lucide-react";
import Image from "next/image";

export function ProductThumbnail({ src, size = 44 }: { src?: string | null; size?: number }) {
  const style = { width: size, height: size };

  if (!src) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg bg-linen text-taupe/60 ring-1 ring-espresso/6"
        style={style}
      >
        <Package className="size-4" strokeWidth={1.5} aria-hidden />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-lg bg-linen object-cover ring-1 ring-espresso/6"
      style={style}
    />
  );
}
