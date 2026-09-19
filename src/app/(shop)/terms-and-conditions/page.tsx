import Link from "next/link";
import { LegalList, LegalPage, legalMetadata, type LegalSection } from "@/components/shop/legal-page";
import { siteConfig } from "@/config/site";

export const metadata = legalMetadata(
  "Terms & Conditions",
  `The terms that apply when you browse and order handmade furniture and home decor from ${siteConfig.name} in Pakistan.`,
  "/terms-and-conditions",
);

const { deliveryTimes } = siteConfig.policies;
const linkClasses = "underline decoration-espresso/30 underline-offset-4 hover:decoration-espresso";

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    content: (
      <p>
        These terms apply when you use our website or place an order with {siteConfig.name}. By placing an order, you
        agree to them, along with our{" "}
        <Link href="/privacy-policy" className={linkClasses}>
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/refund-policy" className={linkClasses}>
          Return &amp; Refund Policy
        </Link>
        . We currently deliver within Pakistan only.
      </p>
    ),
  },
  {
    id: "handmade-products",
    title: "Our handmade products",
    content: (
      <>
        <p>Our pieces are made by hand from natural materials, so no two are exactly alike. Please expect and enjoy:</p>
        <LegalList>
          <li>variations in wood grain, knots, tone and texture;</li>
          <li>small differences in size, usually within a centimetre or two of the listed measurements;</li>
          <li>colours that look slightly different in person than on your screen.</li>
        </LegalList>
        <p>
          These are part of the character of handmade furniture and are not defects. Please check measurements against
          your space before ordering.
        </p>
      </>
    ),
  },
  {
    id: "prices",
    title: "Prices and availability",
    content: (
      <>
        <p>
          All prices are in Pakistani Rupees (PKR). Prices and stock can change without notice, but the price you see
          when you place your order is the price you pay.
        </p>
        <p>
          If a product is listed at a clearly wrong price because of an error, or turns out to be unavailable,
          we&apos;ll contact you before dispatch. You can then accept the correct price or cancel at no cost.
        </p>
      </>
    ),
  },
  {
    id: "orders",
    title: "Placing and confirming orders",
    content: (
      <>
        <p>
          After you place an order, you&apos;ll see an order number (for example WP-10001). We then call or message you
          on WhatsApp to confirm it. Your order is accepted once we&apos;ve confirmed it with you.
        </p>
        <p>We may cancel an order, and will tell you why, if:</p>
        <LegalList>
          <li>we can&apos;t reach you on the number provided after several attempts;</li>
          <li>the delivery address is incomplete or outside the areas our couriers serve;</li>
          <li>the item is out of stock or was listed at the wrong price;</li>
          <li>the order appears fraudulent, or previous cash-on-delivery orders were refused without reason.</li>
        </LegalList>
      </>
    ),
  },
  {
    id: "payment",
    title: "Payment",
    content: (
      <p>
        We currently accept cash on delivery only. Please have the exact amount ready when your order arrives; you pay
        the courier after you&apos;ve inspected your parcel as described in our{" "}
        <Link href="/refund-policy#inspection" className={linkClasses}>
          inspection guidelines
        </Link>
        . Never share bank or card details with anyone claiming to be from {siteConfig.name}; we won&apos;t ask for
        them.
      </p>
    ),
  },
  {
    id: "delivery",
    title: "Shipping and delivery",
    content: (
      <>
        <p>
          We ship across Pakistan through trusted courier partners such as Leopards Courier and TCS. Every piece is
          wrapped carefully for the journey. After your order is dispatched, delivery usually takes:
        </p>
        <LegalList>
          <li>
            <strong className="font-medium text-espresso">{deliveryTimes.majorCities} working days</strong> to major
            cities such as Karachi, Lahore and Islamabad;
          </li>
          <li>
            <strong className="font-medium text-espresso">{deliveryTimes.otherAreas} working days</strong> to other
            cities and remote areas.
          </li>
        </LegalList>
        <p>
          These are estimates, not guarantees. Weather, public holidays, courier delays and events outside our control
          can slow deliveries down. You can check progress on our{" "}
          <Link href="/track-order" className={linkClasses}>
            order tracking page
          </Link>
          .
        </p>
        <p>
          Larger pieces may be delivered to the ground floor or building entrance. Please make sure someone is available
          to receive the order and that your mobile number is reachable.
        </p>
      </>
    ),
  },
  {
    id: "inspection-and-risk",
    title: "Inspection and ownership",
    content: (
      <p>
        Please inspect your order when it arrives, as explained in our{" "}
        <Link href="/refund-policy#inspection" className={linkClasses}>
          Return &amp; Refund Policy
        </Link>
        . Ownership and responsibility for the items pass to you once you&apos;ve received the order and paid for it.
      </p>
    ),
  },
  {
    id: "care",
    title: "Care and use",
    content: (
      <p>
        Wood is a living material. Keep your pieces out of direct sunlight, away from heaters and damp walls, and wipe
        spills promptly. We are not responsible for wear, damage or warping caused by misuse, moisture, heat,
        overloading or improper assembly.
      </p>
    ),
  },
  {
    id: "reviews",
    title: "Reviews and content you share",
    content: (
      <p>
        When you post a review or photo, you confirm it&apos;s your honest experience and your own content, and you
        allow us to display it on our website and social media. We may remove reviews that are abusive, misleading,
        off-topic or contain personal information.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "Our designs and content",
    content: (
      <p>
        The {siteConfig.name} name, logo, product designs, photos and text on this website belong to us. Please
        don&apos;t copy or reuse them for commercial purposes without our written permission.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: (
      <p>
        To the extent permitted by law, our responsibility for any order is limited to the amount you paid for it. We
        are not liable for indirect losses, or for delays or failures caused by events outside our reasonable control.
        Nothing in these terms limits your rights under Pakistani consumer protection laws.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    content: (
      <p>
        These terms are governed by the laws of Pakistan. We&apos;d always rather resolve a concern with you directly,
        so please contact us first. Any dispute that can&apos;t be settled will be handled by the competent courts of
        Pakistan.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: (
      <p>
        We may update these terms from time to time. The version shown on this page when you place your order is the one
        that applies to it.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      href="/terms-and-conditions"
      intro={
        <p>
          Thank you for choosing {siteConfig.name}. We keep our terms simple and fair. Please read them before placing
          an order, and reach out if anything is unclear.
        </p>
      }
      sections={sections}
    />
  );
}
