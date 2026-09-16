"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";
import { storeWhatsAppUrl } from "@/lib/whatsapp";

const subscribeNothing = () => () => {};

/** Floating "chat on WhatsApp" button. On product pages the message includes a link to the product. */
export function WhatsAppButton() {
  const pathname = usePathname();
  // The origin is only known in the browser; the server renders the generic message.
  const origin = useSyncExternalStore(
    subscribeNothing,
    () => window.location.origin,
    () => "",
  );

  const message =
    origin && pathname.startsWith("/products/")
      ? `Hi ${siteConfig.name}! I have a question about this product: ${origin}${pathname}`
      : `Hi ${siteConfig.name}! I have a question.`;

  return (
    <a
      href={storeWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${siteConfig.name} on WhatsApp`}
      className="group fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-30 flex h-12 animate-fade-up items-center rounded-full bg-[#0c7f47] px-3 text-white sm:h-14 sm:px-4 shadow-lift transition-[background-color,padding] duration-500 ease-luxe [animation-delay:800ms] hover:bg-[#0a6b3c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-espresso sm:right-8 sm:bottom-[calc(2rem+env(safe-area-inset-bottom))]"
    >
      <MessageCircle className="size-6 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-500 ease-luxe group-hover:ml-2.5 group-hover:max-w-44 group-hover:opacity-100 group-focus-visible:ml-2.5 group-focus-visible:max-w-44 group-focus-visible:opacity-100">
        Chat on WhatsApp
      </span>
    </a>
  );
}
