import { siteConfig } from "@/config/site";

/** A wa.me link that opens a chat with `phone` (any format; non-digits are removed). */
export function whatsAppUrl(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  return message ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : `https://wa.me/${digits}`;
}

/** Opens a chat with the store, optionally with a pre-filled message. */
export function storeWhatsAppUrl(message?: string) {
  return whatsAppUrl(siteConfig.whatsapp.number, message);
}
