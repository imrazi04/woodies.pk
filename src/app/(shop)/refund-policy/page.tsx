import { LegalList, LegalPage, legalMetadata, type LegalSection } from "@/components/shop/legal-page";
import { siteConfig } from "@/config/site";

export const metadata = legalMetadata(
  "Return & Refund Policy",
  `How to inspect your delivery, report damage, and return or get a refund on ${siteConfig.name} furniture in Pakistan.`,
  "/refund-policy",
);

const { returnWindowDays, damageReportHours, refundProcessingDays } = siteConfig.policies;
const strong = "font-medium text-espresso";

const sections: LegalSection[] = [
  {
    id: "at-a-glance",
    title: "At a glance",
    content: (
      <LegalList>
        <li>
          <strong className={strong}>Inspect on delivery</strong>: check your parcel before paying the courier.
        </li>
        <li>
          <strong className={strong}>Damaged or wrong item</strong>: tell us within {damageReportHours} hours of
          delivery and we&apos;ll repair, replace or refund it at no cost to you.
        </li>
        <li>
          <strong className={strong}>Changed your mind</strong>: request a return within {returnWindowDays} days of
          delivery for unused items in their original packaging.
        </li>
        <li>
          <strong className={strong}>Refunds</strong>: sent by bank transfer, JazzCash or Easypaisa within{" "}
          {refundProcessingDays} working days of us receiving and checking the return.
        </li>
      </LegalList>
    ),
  },
  {
    id: "inspection",
    title: "Inspection upon delivery",
    content: (
      <>
        <p>Furniture travels a long way to reach you, so please take a moment to check it when it arrives:</p>
        <LegalList>
          <li>Check the outer packaging for tears, crushed corners or signs of water before you accept it.</li>
          <li>
            Where the courier allows, open the parcel in front of the rider and check the item for visible damage or
            missing parts.
          </li>
          <li>
            If something is clearly damaged, you may refuse the delivery, or note the damage with the rider, take clear
            photos, and message us straight away.
          </li>
          <li>
            We strongly recommend recording a short, uncut video while unboxing. It makes any claim much faster to
            resolve.
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: "damaged-or-wrong",
    title: "Damaged, defective or wrong items",
    content: (
      <>
        <p>
          If your order arrives damaged, has a manufacturing defect, has missing parts, or isn&apos;t what you ordered,
          message us on WhatsApp within <strong className={strong}>{damageReportHours} hours of delivery</strong> with:
        </p>
        <LegalList>
          <li>your order number (for example WP-10001);</li>
          <li>clear photos of the item, the damage and the packaging;</li>
          <li>your unboxing video, if you recorded one.</li>
        </LegalList>
        <p>
          Once we&apos;ve reviewed it, we&apos;ll arrange a repair, a replacement or a full refund, whichever suits you
          and is possible. We cover all return and redelivery costs in these cases. Please keep the item and its
          packaging until your claim is resolved.
        </p>
      </>
    ),
  },
  {
    id: "change-of-mind",
    title: "Returns for a change of mind",
    content: (
      <>
        <p>
          If a piece isn&apos;t right for your home, you can request a return within{" "}
          <strong className={strong}>{returnWindowDays} days of delivery</strong>, as long as:
        </p>
        <LegalList>
          <li>the item is unused, unassembled (or returned to its delivered state) and undamaged;</li>
          <li>it is in its original packaging, with all parts and accessories;</li>
          <li>you arrange and pay for the return shipping, or we deduct our courier cost from your refund.</li>
        </LegalList>
        <p>
          We&apos;ll inspect the item when it reaches us. If it has been used or damaged after delivery, we may refuse
          the return or deduct a reasonable amount for repair.
        </p>
      </>
    ),
  },
  {
    id: "not-returnable",
    title: "Items that can't be returned",
    content: (
      <>
        <p>Unless they arrive damaged or defective, we can&apos;t accept returns of:</p>
        <LegalList>
          <li>custom-made, made-to-order or personalised pieces (for example, a custom size or finish);</li>
          <li>items marked as final sale;</li>
          <li>items that have been used, assembled and fixed to a wall, altered or damaged after delivery.</li>
        </LegalList>
        <p>
          Natural variations in wood grain, knots and tone are part of handmade furniture and aren&apos;t considered
          defects.
        </p>
      </>
    ),
  },
  {
    id: "how-to-return",
    title: "How to request a return",
    content: (
      <ol className="list-decimal space-y-2 pl-5 marker:text-clay">
        <li>
          Message us on WhatsApp at {siteConfig.whatsapp.display} with your order number and the reason for the return.
        </li>
        <li>We&apos;ll confirm whether the item is eligible and share the return address or arrange a pickup.</li>
        <li>Pack the item securely in its original packaging and hand it to the courier.</li>
        <li>We inspect the item when it arrives and let you know the outcome.</li>
      </ol>
    ),
  },
  {
    id: "refunds",
    title: "Refunds",
    content: (
      <>
        <p>
          Because orders are paid in cash on delivery, refunds are sent to your bank account, JazzCash or Easypaisa
          wallet. We&apos;ll ask for your account details over WhatsApp once your return is approved.
        </p>
        <LegalList>
          <li>
            Approved refunds are sent within <strong className={strong}>{refundProcessingDays} working days</strong> of
            us receiving and checking the item.
          </li>
          <li>
            For damaged, defective or wrong items, you receive a full refund of the amount you paid, including any
            delivery charge.
          </li>
          <li>For change-of-mind returns, delivery and return shipping charges are not refunded.</li>
        </LegalList>
      </>
    ),
  },
  {
    id: "cancellations",
    title: "Cancellations",
    content: (
      <>
        <p>
          You can cancel free of charge any time before your order is dispatched. Just message us with your order
          number. Once an order has been dispatched, it can&apos;t be cancelled, but you can return it under this
          policy.
        </p>
        <p>
          Please don&apos;t refuse a cash-on-delivery parcel without a valid reason, such as visible damage. Refused
          orders cost us two-way shipping, and repeated refusals may mean we can&apos;t accept future cash-on-delivery
          orders from you.
        </p>
      </>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Return & Refund Policy"
      href="/refund-policy"
      intro={
        <p>
          Each {siteConfig.name} piece is made by hand and packed with care. If something isn&apos;t right when it
          arrives, we&apos;ll make it right. Here&apos;s how inspection, returns and refunds work.
        </p>
      }
      sections={sections}
    />
  );
}
