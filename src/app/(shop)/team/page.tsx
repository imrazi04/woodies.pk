import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { Container } from "@/components/shop/container";
import { shopButtonClasses } from "@/components/shop/shop-button";
import { siteConfig } from "@/config/site";
import { getPublishedTeam, type PublicTeamMember } from "@/lib/data/team";
import { formatPhone } from "@/lib/format";
import { socialImage } from "@/lib/seo";
import { whatsAppUrl } from "@/lib/whatsapp";

const description = `Meet the artisans and people behind ${siteConfig.name}: woodworkers from Chiniot who shape every piece by hand.`;

export const metadata: Metadata = {
  title: "Our team & artisans",
  description,
  alternates: { canonical: "/team" },
  openGraph: { title: `The ${siteConfig.name} team`, description, url: "/team", images: [socialImage] },
};

export default async function TeamPage() {
  const team = await getPublishedTeam();

  return (
    <>
      <header className="border-b border-espresso/8">
        <Container className="pt-8 pb-10 md:pt-12 md:pb-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Our team" }]} />
          <p className="mt-10 animate-fade-up text-[11px] font-semibold tracking-[0.28em] text-clay uppercase md:mt-14">
            Team &amp; artisans
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <h1 className="max-w-3xl animate-fade-up font-display text-5xl leading-none font-medium tracking-tight text-balance [animation-delay:100ms] md:text-7xl lg:text-8xl">
              The hands <em className="text-clay">behind</em> the wood
            </h1>
            <p className="max-w-md animate-fade-up leading-relaxed text-taupe [animation-delay:200ms]">
              Every piece passes through the hands of the people below: carvers, joiners and finishers who learned their
              craft in Chiniot, and the team who brings it to your door.
            </p>
          </div>
        </Container>
      </header>

      <Container className="pt-12 pb-20 md:pt-16 md:pb-28">
        {team.length === 0 ? (
          <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl bg-linen px-6 py-20 text-center">
            <p className="font-display text-4xl leading-tight text-balance">Our team is being introduced</p>
            <p className="mt-4 leading-relaxed text-taupe">
              We&apos;re gathering the stories of the artisans behind our furniture. In the meantime, we&apos;d love to
              hear from you.
            </p>
            <Link href="/contact" className={shopButtonClasses({ className: "mt-8" })}>
              Contact us
            </Link>
          </div>
        ) : (
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => (
              <TeamCard key={member.id} member={member} index={index} />
            ))}
          </ul>
        )}
      </Container>

      <section aria-labelledby="commission-title" className="bg-linen">
        <Container className="flex flex-col items-start gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-20">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.28em] text-clay uppercase">Made to order</p>
            <h2 id="commission-title" className="mt-4 font-display text-4xl leading-tight text-balance md:text-5xl">
              Have a piece in mind? Our artisans would love to hear about it.
            </h2>
          </div>
          <Link href="/contact" className={shopButtonClasses()}>
            Talk to our team
            <ArrowRight
              className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </Container>
      </section>
    </>
  );
}

const contactButtonClasses =
  "inline-flex h-10 items-center gap-2 rounded-full px-4 text-[11px] font-semibold tracking-[0.14em] uppercase ring-1 ring-espresso/15 transition duration-500 ease-luxe ring-inset hover:bg-espresso hover:text-cream hover:ring-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso";

function TeamCard({ member, index }: { member: PublicTeamMember; index: number }) {
  const phoneHref = member.phone ? `tel:${member.phone.replace(/[^\d+]/g, "")}` : null;

  return (
    <li
      className="group flex animate-fade-up flex-col"
      // Cards rise in one after another, capped so long lists don't wait.
      style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-sand shadow-soft">
        {member.image_url ? (
          <Image
            src={member.image_url}
            alt={`${member.name}, ${member.role}`}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-[1.6s] ease-luxe group-hover:scale-[1.03]"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-full items-center justify-center bg-linen font-display text-8xl text-espresso/25"
          >
            {member.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-1 flex-col">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-clay uppercase">{member.role}</p>
        <h2 className="mt-2 font-display text-3xl leading-tight">{member.name}</h2>
        {member.bio && <p className="mt-3 leading-relaxed whitespace-pre-line text-taupe">{member.bio}</p>}

        {(member.phone || member.email) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {phoneHref && member.phone && (
              <a
                href={phoneHref}
                className={contactButtonClasses}
                aria-label={`Call ${member.name}, ${formatPhone(member.phone)}`}
              >
                <Phone className="size-3.5" aria-hidden />
                Call
              </a>
            )}
            {member.phone && member.is_whatsapp && (
              <a
                href={whatsAppUrl(member.phone, `Hi ${member.name}! I found you on the ${siteConfig.name} website.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={contactButtonClasses}
                aria-label={`WhatsApp ${member.name}`}
              >
                <MessageCircle className="size-3.5" aria-hidden />
                WhatsApp
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`} className={contactButtonClasses} aria-label={`Email ${member.name}`}>
                <Mail className="size-3.5" aria-hidden />
                Email
              </a>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
