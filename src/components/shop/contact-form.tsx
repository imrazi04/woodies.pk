"use client";

import { Check, LoaderCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sendContactMessage } from "@/actions/contact";
import { Alert } from "@/components/ui/alert";
import { useActionForm } from "@/hooks/use-action-form";
import { shopButtonClasses } from "./shop-button";
import { ShopField, ShopTextarea } from "./shop-field";

export function ContactForm() {
  // Remounting the form clears its fields and state for another message.
  const [formKey, setFormKey] = useState(0);
  return <ContactFormInner key={formKey} onReset={() => setFormKey((key) => key + 1)} />;
}

function ContactFormInner({ onReset }: { onReset: () => void }) {
  const { state, pending, onSubmit } = useActionForm(sendContactMessage);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Move focus to the first invalid field, or to the confirmation once the message is sent.
  useEffect(() => {
    if (state.status === "error" && state.fieldErrors) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    } else if (state.status === "success") {
      successRef.current?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex animate-fade-up flex-col items-center py-12 text-center outline-none"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-olive text-cream shadow-soft">
          <Check className="size-6" strokeWidth={2} aria-hidden />
        </span>
        <p className="mt-6 font-display text-4xl leading-tight">Thank you for writing</p>
        <p className="mt-3 max-w-sm leading-relaxed text-taupe">
          Your message has reached our team. We usually reply within one working day.
        </p>
        <button
          type="button"
          onClick={onReset}
          className={shopButtonClasses({ variant: "outline", className: "mt-8" })}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <ShopField
          label="Name"
          name="name"
          autoComplete="name"
          maxLength={100}
          required
          errors={state.fieldErrors}
          className="sm:col-span-2"
        />
        <ShopField
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          required
          errors={state.fieldErrors}
        />
        <ShopField
          label="Phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0300 1234567"
          optional
          errors={state.fieldErrors}
        />
      </div>
      <ShopTextarea
        label="Message"
        name="message"
        rows={6}
        maxLength={3000}
        placeholder="Tell us about the piece you have in mind, a question about an order, or anything else."
        required
        errors={state.fieldErrors}
      />

      {/* Honeypot: hidden from people, so only bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && !state.fieldErrors && <Alert tone="error">{state.message}</Alert>}

      <div className="flex flex-col-reverse gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-taupe">We only use your details to reply to you.</p>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
          className={shopButtonClasses({ className: "w-full disabled:opacity-70 sm:w-auto" })}
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <Send className="size-4" aria-hidden />
          )}
          {pending ? "Sending" : "Send message"}
        </button>
      </div>
    </form>
  );
}
