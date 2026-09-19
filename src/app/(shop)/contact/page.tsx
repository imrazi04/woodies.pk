import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { ContactForm } from "@/components/shop/contact-form";
import { Container } from "@/components/shop/container";
import { siteConfig } from "@/config/site";
import { getPublishedContacts, type PublicContact } from "@/lib/data/contact";
import { formatPhone } from "@/lib/format";
import { socialImage } from "@/lib/seo";
import { storeWhatsAppUrl, whatsAppUrl } from "@/lib/whatsapp";

const { business } = siteConfig;
const cityLine = `${business.address.city}, ${business.address.region} ${business.address.postalCode}, Pakistan`;
const fullAddress = [business.address.street, cityLine].filter(Boolean).join(", ");
const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

const description = `Talk to ${siteConfig.name} about an order, a custom piece or anything else. Handmade wooden furniture from Chiniot, Pakistan.`;

export const metadata: Metadata = {
  title: "Contact us",
  description,
  alternates: { canonical: "/contact" },
  openGraph: { title: `Contact ${siteConfig.name}`, description, url: "/contact", images: [socialImage] },
};

const linkClasses =
  "rounded-sm underline decoration-espresso/25 underline-offset-4 transition-colors duration-300 hover:decoration-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso";

export default async function ContactPage() {
  const contacts = await getPublishedContacts();

  return (
    <>
      <header className="border-b border-espresso/8">
        <Container className="pt-8 pb-10 md:pt-12 md:pb-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
          <p className="mt-10 animate-fade-up text-[11px] font-semibold tracking-[0.28em] text-clay uppercase md:mt-14">
            Get in touch
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <h1 className="max-w-3xl animate-fade-up font-display text-5xl leading-none font-medium tracking-tight text-balance [animation-delay:100ms] md:text-7xl lg:text-8xl">
              Let&apos;s talk <em className="text-clay">wood</em>
            </h1>
            <p className="max-w-md animate-fade-up leading-relaxed text-taupe [animation-delay:200ms]">
              A question about an order, a custom size, or just the right finish for your room. Write to us and a real
              person from our workshop will reply.
            </p>
          </div>
        </Container>
      </header>

      <Container className="pt-10 pb-20 md:pt-14 md:pb-28">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <section
            aria-labelledby="contact-form-title"
            className="rounded-3xl bg-linen p-6 shadow-soft sm:p-10 lg:col-span-7"
          >
            <h2 id="contact-form-title" className="font-display text-3xl md:text-4xl">
              Send us a message
            </h2>
            <p className="mt-2 mb-8 text-sm leading-relaxed text-taupe">
              We usually reply within one working day. For anything urgent, WhatsApp is quickest.
            </p>
            <ContactForm />
          </section>

          <aside aria-label="Contact details" className="space-y-5 lg:col-span-5">
            <a
              href={storeWhatsAppUrl(`Hi ${siteConfig.name}! I have a question.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-5 rounded-3xl bg-espresso p-6 text-cream shadow-soft transition duration-500 ease-luxe hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-espresso sm:p-7"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cream/10">
                <MessageCircle className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold tracking-[0.2em] text-cream/60 uppercase">
                  Fastest reply
                </span>
                <span className="mt-1 block font-display text-2xl">Chat on WhatsApp</span>
                <span className="mt-0.5 block text-sm text-cream/70 tabular-nums">{siteConfig.whatsapp.display}</span>
              </span>
              <ArrowUpRight
                className="size-5 shrink-0 text-cream/60 transition-transform duration-500 ease-luxe group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cream"
                aria-hidden
              />
            </a>

            <div className="rounded-3xl p-6 ring-1 ring-espresso/10 ring-inset sm:p-7">
              <ul className="space-y-6">
                <DetailRow icon={MapPin} label="Workshop">
                  {business.address.street && <span className="block">{business.address.street}</span>}
                  <span className="block">{cityLine}</span>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-2 inline-block text-sm font-medium ${linkClasses}`}
                  >
                    Get directions
                  </a>
                </DetailRow>
                <DetailRow icon={Phone} label="Call us">
                  <a href={`tel:+${siteConfig.whatsapp.number}`} className={`tabular-nums ${linkClasses}`}>
                    {siteConfig.whatsapp.display}
                  </a>
                </DetailRow>
                {business.email && (
                  <DetailRow icon={Mail} label="Email">
                    <a href={`mailto:${business.email}`} className={`break-all ${linkClasses}`}>
                      {business.email}
                    </a>
                  </DetailRow>
                )}
                <DetailRow icon={Clock} label="Hours">
                  {business.hours}
                  <span className="block text-sm text-taupe">Pakistan Standard Time</span>
                </DetailRow>
              </ul>
            </div>

            <div className="rounded-3xl bg-linen/60 p-6 sm:p-7">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-taupe uppercase">Quick help</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/track-order" className={linkClasses}>
                    Track your order
                  </Link>
                  <span className="text-taupe"> with your order number and phone</span>
                </li>
                <li>
                  <Link href="/refund-policy" className={linkClasses}>
                    Returns &amp; refunds
                  </Link>
                  <span className="text-taupe">, including what to check on delivery</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {contacts.length > 0 && <ContactDirectory contacts={contacts} />}
      </Container>

      <section aria-labelledby="heritage-title" className="bg-linen">
        <Container className="grid gap-10 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-5">
            <p className="text-[11px] font-semibold tracking-[0.28em] text-clay uppercase">Rooted in Chiniot</p>
            <h2 id="heritage-title" className="mt-4 font-display text-4xl leading-tight text-balance md:text-5xl">
              Made where Pakistan&apos;s finest woodwork is made
            </h2>
          </div>
          <div className="space-y-5 leading-relaxed text-taupe md:col-span-6 md:col-start-7">
            <p>
              For generations, Chiniot on the banks of the Chenab has been known across Pakistan for its woodworkers:
              carvers, joiners and polishers whose furniture fills homes and havelis far beyond the city.
            </p>
            <p>
              Our workshop is part of that tradition. Every {siteConfig.name} piece is shaped by hand from solid wood,
              joined with care and finished slowly, so it can be lived with for years and handed on after that.
            </p>
            <p className="font-display text-xl text-espresso italic">
              Planning a visit? Message us first and we&apos;ll share directions.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

function DetailRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linen text-espresso">
        <Icon className="size-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-taupe uppercase">{label}</p>
        <div className="mt-1.5 leading-relaxed">{children}</div>
      </div>
    </li>
  );
}

function ContactDirectory({ contacts }: { contacts: PublicContact[] }) {
  return (
    <section aria-labelledby="team-title" className="mt-20 md:mt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.28em] text-clay uppercase">Our team</p>
          <h2 id="team-title" className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            Speak to the right person
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-taupe">
          Reach the team who can help with your question directly.
        </p>
      </div>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <li
            key={contact.id}
            className="flex flex-col rounded-3xl bg-white/60 p-6 shadow-soft ring-1 ring-espresso/6 transition duration-500 ease-luxe hover:-translate-y-0.5 hover:shadow-lift sm:p-7"
          >
            <p className="text-[11px] font-semibold tracking-[0.2em] text-clay uppercase">{contact.department}</p>
            <p className="mt-3 font-display text-2xl leading-tight">{contact.name}</p>
            <div className="mt-5 flex-1 space-y-2.5 text-sm">
              {contact.phone && (
                <a
                  href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-2.5 tabular-nums hover:underline"
                >
                  <Phone className="size-4 shrink-0 text-taupe" strokeWidth={1.75} aria-hidden />
                  {formatPhone(contact.phone)}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 break-all hover:underline">
                  <Mail className="size-4 shrink-0 text-taupe" strokeWidth={1.75} aria-hidden />
                  {contact.email}
                </a>
              )}
              {contact.hours && (
                <p className="flex items-center gap-2.5 text-taupe">
                  <Clock className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  {contact.hours}
                </p>
              )}
            </div>
            {contact.phone && contact.is_whatsapp && (
              <a
                href={whatsAppUrl(
                  contact.phone,
                  `Hi ${contact.name}! I'm contacting you from the ${siteConfig.name} website.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full text-[12px] font-semibold tracking-[0.16em] uppercase ring-1 ring-espresso/20 transition duration-500 ease-luxe ring-inset hover:bg-espresso hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-espresso"
              >
                <MessageCircle className="size-4" aria-hidden />
                WhatsApp
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
