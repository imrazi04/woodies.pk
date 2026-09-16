import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function GalleryArrow({
  direction,
  onClick,
  className,
}: {
  direction: "previous" | "next";
  onClick: () => void;
  className?: string;
}) {
  const Icon = direction === "next" ? ChevronRight : ChevronLeft;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "next" ? "Next image" : "Previous image"}
      className={cn(
        "flex size-11 items-center justify-center rounded-full bg-cream/90 text-espresso shadow-soft backdrop-blur transition duration-300 hover:bg-cream focus-visible:outline-2 focus-visible:outline-espresso",
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={1.5} aria-hidden />
    </button>
  );
}
