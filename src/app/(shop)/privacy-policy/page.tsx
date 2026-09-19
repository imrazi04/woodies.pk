import Link from "next/link";
import { LegalList, LegalPage, legalMetadata, type LegalSection } from "@/components/shop/legal-page";
import { siteConfig } from "@/config/site";

export const metadata = legalMetadata(
  "Privacy Policy",
  `How ${siteConfig.name} collects, uses and protects your personal information when you shop with us in Pakistan.`,
  "/privacy-policy",
);

const sections: LegalSection[] = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: (
      <>
        <p>We only ask for what we need to deliver your order and look after you:</p>
        <LegalList>
          <li>
            <strong className="font-medium text-espresso">Order details</strong>: your name, mobile number, delivery
            address, city, an optional landmark and an optional email address.
          </li>
          <li>
            <strong className="font-medium text-espresso">Pinned location</strong>: if you choose to drop a pin on the
            map at checkout, its coordinates, so our courier can find your door.
          </li>
          <li>
            <strong className="font-medium text-espresso">What you order</strong>: the products, quantities, prices and
            the status of your order.
          </li>
          <li>
            <strong className="font-medium text-espresso">Reviews</strong>: the name, rating, comment and any photos you
            share. If you add an order number to verify a review, we also check it against the mobile number on that
            order; your number is never published.
          </li>
          <li>
            <strong className="font-medium text-espresso">Messages</strong>: anything you send us on WhatsApp or by
            email.
          </li>
        </LegalList>
        <p>We never ask for card or bank details on this website. All orders are paid in cash on delivery.</p>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use your information",
    content: (
      <LegalList>
        <li>To confirm your order by phone or WhatsApp, prepare it and deliver it.</li>
        <li>
          To let you{" "}
          <Link
            href="/track-order"
            className="underline decoration-espresso/30 underline-offset-4 hover:decoration-espresso"
          >
            track your order
          </Link>{" "}
          and to answer your questions about it.
        </li>
        <li>To handle returns, repairs, replacements and refunds.</li>
        <li>To show genuine customer reviews on our product pages.</li>
        <li>To keep our website secure and prevent fraudulent or fake orders.</li>
        <li>To meet our legal, tax and accounting obligations in Pakistan.</li>
      </LegalList>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    content: (
      <>
        <p>We do not sell, rent or trade your personal information. We only share it where it&apos;s needed:</p>
        <LegalList>
          <li>
            <strong className="font-medium text-espresso">Courier partners</strong> (such as Leopards Courier or TCS)
            receive your name, mobile number, delivery address and the cash-on-delivery amount so they can deliver your
            parcel.
          </li>
          <li>
            <strong className="font-medium text-espresso">Service providers</strong> who host our website and database
            store your information securely on our behalf. Their servers may be located outside Pakistan.
          </li>
          <li>
            <strong className="font-medium text-espresso">Map tiles</strong> on the checkout map are loaded from
            OpenStreetMap, which receives your IP address the way any website you visit does.
          </li>
          <li>
            <strong className="font-medium text-espresso">Authorities</strong>, only when Pakistani law requires it.
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: "security",
    title: "How we keep your data secure",
    content: (
      <>
        <LegalList>
          <li>Every page on our website is served over an encrypted HTTPS connection.</li>
          <li>Order information can only be read by our team through a password-protected admin area.</li>
          <li>
            Order tracking only shows an order when both the order number and the mobile number or email used at
            checkout match, and lookups are limited to stop guessing.
          </li>
          <li>
            To prevent abuse, we count requests per visitor using a one-way, keyed fingerprint of your IP address. We
            don&apos;t store the address itself.
          </li>
        </LegalList>
        <p>
          No system is completely secure, but we work hard to protect your information and will let you know promptly if
          a problem ever affects you.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    content: (
      <>
        <p>
          We don&apos;t use advertising or cross-site tracking cookies. Your cart and wishlist are saved in your own
          browser&apos;s storage so they&apos;re still there when you come back; they aren&apos;t sent to us until you
          place an order. Clearing your browser data removes them.
        </p>
        <p>Our admin area uses a sign-in cookie for our team only.</p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    content: (
      <p>
        We keep order records for as long as we need them for deliveries, returns, warranty questions and our legal and
        tax records. Reviews stay published until you ask us to remove them. When information is no longer needed, we
        delete it or make it anonymous.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your choices and rights",
    content: (
      <>
        <p>You can ask us at any time to:</p>
        <LegalList>
          <li>tell you what personal information we hold about you;</li>
          <li>correct information that is wrong, such as your address or number;</li>
          <li>delete your information or remove a review, unless we must keep it for legal reasons;</li>
          <li>stop contacting you about anything other than your orders.</li>
        </LegalList>
        <p>
          Message us on WhatsApp at {siteConfig.whatsapp.display} with your request. We may ask you to confirm an order
          number and mobile number so we know it&apos;s really you.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    content: (
      <p>
        Our website is meant for adults. We don&apos;t knowingly collect information from anyone under 18. If you think
        a child has shared information with us, please contact us and we&apos;ll delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this policy as our store grows. The date at the top of this page shows when it last changed.
        Significant changes will be highlighted on our website.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      href="/privacy-policy"
      intro={
        <p>
          At {siteConfig.name}, your trust matters as much as the furniture we make. This policy explains what personal
          information we collect when you shop with us, why we need it, and how we keep it safe.
        </p>
      }
      sections={sections}
    />
  );
}
