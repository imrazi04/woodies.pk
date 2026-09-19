"use client";

import { Plus, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveContactPerson } from "@/actions/contact-admin";
import { Alert, FormMessage } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import { Field, fieldProps, Input, Switch } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useActionForm } from "@/hooks/use-action-form";
import { formatPhone } from "@/lib/format";
import type { ContactPerson } from "@/types/database";

/** Adds a contact, or edits `contact` when given. */
export function ContactPersonForm({ contact }: { contact?: ContactPerson }) {
  // Remounting clears the fields after a contact is added.
  const [added, setAdded] = useState({ count: 0, message: "" });
  return (
    <ContactPersonFormInner
      key={contact?.id ?? `new-${added.count}`}
      contact={contact}
      notice={contact ? "" : added.message}
      onAdded={(message) => setAdded((previous) => ({ count: previous.count + 1, message }))}
    />
  );
}

function ContactPersonFormInner({
  contact,
  notice,
  onAdded,
}: {
  contact?: ContactPerson;
  notice: string;
  onAdded: (message: string) => void;
}) {
  const router = useRouter();
  const { state, pending, onSubmit } = useActionForm(async (prev, formData) => {
    const result = await saveContactPerson(contact?.id ?? null, prev, formData);
    if (result.status === "success") {
      if (contact) router.push("/admin/contacts");
      else onAdded(result.message ?? "Contact added.");
    }
    return result;
  });
  const errors = state.fieldErrors;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Name" htmlFor="name" errors={errors?.name}>
        <Input
          {...fieldProps("name", errors)}
          defaultValue={contact?.name}
          placeholder="e.g. Ahmed Raza"
          maxLength={80}
          required
        />
      </Field>
      <Field
        label="Department or role"
        htmlFor="department"
        errors={errors?.department}
        hint="Shown above the name, e.g. Orders & delivery, Custom furniture."
      >
        <Input
          {...fieldProps("department", errors)}
          defaultValue={contact?.department}
          placeholder="e.g. Orders & delivery"
          maxLength={80}
          required
        />
      </Field>
      <Field
        label="Phone"
        htmlFor="phone"
        errors={errors?.phone}
        hint="Mobile or landline. Add a phone, an email, or both."
      >
        <Input
          {...fieldProps("phone", errors)}
          type="tel"
          inputMode="tel"
          defaultValue={contact?.phone ? formatPhone(contact.phone) : undefined}
          placeholder="0300 1234567"
          maxLength={20}
        />
      </Field>
      <Switch
        name="is_whatsapp"
        label="Available on WhatsApp"
        description="Shows a WhatsApp button for this number."
        defaultChecked={contact?.is_whatsapp ?? false}
      />
      <Field label="Email" htmlFor="email" errors={errors?.email}>
        <Input
          {...fieldProps("email", errors)}
          type="email"
          inputMode="email"
          defaultValue={contact?.email ?? undefined}
          placeholder="orders@example.com"
          maxLength={254}
        />
      </Field>
      <Field label="Hours" htmlFor="hours" errors={errors?.hours} hint="Optional.">
        <Input
          {...fieldProps("hours", errors)}
          defaultValue={contact?.hours ?? undefined}
          placeholder="e.g. Mon–Sat, 10am – 7pm"
          maxLength={80}
        />
      </Field>
      <Field
        label="Display order"
        htmlFor="sort_order"
        errors={errors?.sort_order}
        hint="Lower numbers are shown first."
      >
        <Input
          {...fieldProps("sort_order", errors)}
          type="number"
          inputMode="numeric"
          min={0}
          max={999}
          step={1}
          defaultValue={contact?.sort_order ?? 0}
        />
      </Field>
      <Switch
        name="is_published"
        label="Show on contact page"
        description="Turn off to hide this contact without deleting it."
        defaultChecked={contact?.is_published ?? true}
      />

      {state.status === "idle" && notice ? <Alert tone="success">{notice}</Alert> : <FormMessage state={state} />}
      <div className="flex gap-2">
        {contact && (
          <Link href="/admin/contacts" className={buttonClasses({ variant: "secondary", className: "flex-1" })}>
            Cancel
          </Link>
        )}
        <SubmitButton pending={pending} className="flex-1">
          {!pending && (contact ? <Save className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />)}
          {contact ? "Save changes" : "Add contact"}
        </SubmitButton>
      </div>
    </form>
  );
}
