import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";
import { JsonLd } from "./json-ld";

/**
 * Store-wide structured data: who runs the site and how to contact them.
 * Publishes LocalBusiness when a real address is configured, otherwise Organization.
 */
export function SiteSchema() {
  const { business } = siteConfig;
  const hasStreetAddress = business.address.street !== null;
  const organizationId = absoluteUrl("/#organization");
  const telephone = `+${siteConfig.whatsapp.number}`;

  const organization: Record<string, unknown> = {
    "@type": hasStreetAddress ? "LocalBusiness" : "Organization",
    "@id": organizationId,
    name: siteConfig.name,
    legalName: business.legalName,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon"),
    image: absoluteUrl("/opengraph-image"),
    telephone,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone,
      availableLanguage: ["English", "Urdu"],
      areaServed: "PK",
    },
  };

  if (business.email) organization.email = business.email;
  if (business.socialProfiles.length > 0) organization.sameAs = [...business.socialProfiles];
  if (hasStreetAddress) {
    organization.address = {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    };
    organization.currenciesAccepted = siteConfig.currency;
    organization.paymentAccepted = "Cash on delivery";
  }

  const website = {
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: absoluteUrl("/"),
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: "en-PK",
    publisher: { "@id": organizationId },
  };

  return <JsonLd data={{ "@context": "https://schema.org", "@graph": [organization, website] }} />;
}
