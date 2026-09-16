"use client";

import { signIn } from "@/actions/auth";
import { FormMessage } from "@/components/ui/alert";
import { Field, fieldProps, Input } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useActionForm } from "@/hooks/use-action-form";

export function LoginForm({ next }: { next?: string }) {
  const { state, pending, onSubmit } = useActionForm(signIn);
  const errors = state.fieldErrors;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <FormMessage state={state} />
      <Field label="Email" htmlFor="email" errors={errors?.email}>
        <Input {...fieldProps("email", errors)} type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" htmlFor="password" errors={errors?.password}>
        <Input {...fieldProps("password", errors)} type="password" autoComplete="current-password" required />
      </Field>
      <SubmitButton pending={pending} className="w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
