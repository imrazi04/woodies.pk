"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { createCategory } from "@/actions/categories";
import { FormMessage } from "@/components/ui/alert";
import { Field, fieldProps, Input } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useActionForm } from "@/hooks/use-action-form";
import { slugify } from "@/lib/slug";

export function CategoryForm() {
  const [name, setName] = useState("");
  const { state, pending, onSubmit } = useActionForm(async (prev, formData) => {
    const result = await createCategory(prev, formData);
    if (result.status === "success") setName("");
    return result;
  });
  const slug = slugify(name);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Name" htmlFor="name" errors={state.fieldErrors?.name}>
        <Input
          {...fieldProps("name", state.fieldErrors)}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Living Room"
          maxLength={80}
          required
        />
      </Field>

      <div>
        <p className="mb-1.5 text-sm font-medium">Slug</p>
        <p className="truncate rounded-xl bg-linen/60 px-3.5 py-2.5 font-mono text-sm text-muted">
          {slug || "generated-from-name"}
        </p>
        <p className="mt-1.5 text-xs text-muted">Generated automatically and used in the store URL.</p>
      </div>

      <FormMessage state={state} />
      <SubmitButton pending={pending} className="w-full">
        {!pending && <Plus className="size-4" aria-hidden />}
        Add category
      </SubmitButton>
    </form>
  );
}
