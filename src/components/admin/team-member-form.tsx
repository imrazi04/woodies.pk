"use client";

import { Plus, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { discardTeamPhoto, saveTeamMember } from "@/actions/team";
import { PhotoPicker, usePhotoPicker } from "@/components/admin/photo-picker";
import { Alert, FormMessage } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import { Field, fieldProps, Input, Switch, Textarea } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useActionForm } from "@/hooks/use-action-form";
import { errorState } from "@/lib/action-state";
import { formatPhone } from "@/lib/format";
import { TEAM_PHOTOS_BUCKET } from "@/lib/storage/public-photos";
import type { TeamMember } from "@/types/database";

/** Adds a team member, or edits `member` when given. */
export function TeamMemberForm({ member }: { member?: TeamMember }) {
  // Remounting clears the fields after a member is added.
  const [added, setAdded] = useState({ count: 0, message: "" });
  return (
    <TeamMemberFormInner
      key={member?.id ?? `new-${added.count}`}
      member={member}
      notice={member ? "" : added.message}
      onAdded={(message) => setAdded((previous) => ({ count: previous.count + 1, message }))}
    />
  );
}

function TeamMemberFormInner({
  member,
  notice,
  onAdded,
}: {
  member?: TeamMember;
  notice: string;
  onAdded: (message: string) => void;
}) {
  const router = useRouter();
  const photo = usePhotoPicker(member?.image_url);

  const { state, pending, onSubmit } = useActionForm(async (prev, formData) => {
    let image: { url: string; uploaded: boolean };
    try {
      image = await photo.resolve(TEAM_PHOTOS_BUCKET);
    } catch (error) {
      console.error("Team photo upload failed", error);
      return errorState("The photo couldn't be uploaded. Try another image, or try again.");
    }
    formData.set("image_url", image.url);

    const result = await saveTeamMember(member?.id ?? null, prev, formData);
    if (result.status === "success") {
      if (member) router.push("/admin/team");
      else onAdded(result.message ?? "Team member added.");
    } else if (image.uploaded) {
      // Nothing points at the new file; it's uploaded again on the next save.
      void discardTeamPhoto(image.url);
    }
    return result;
  });
  const errors = state.fieldErrors;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <PhotoPicker
        picker={photo}
        hint="A portrait works best. Resized automatically."
        serverError={errors?.image_url?.[0]}
        disabled={pending}
      />

      <Field label="Name" htmlFor="name" errors={errors?.name}>
        <Input
          {...fieldProps("name", errors)}
          defaultValue={member?.name}
          placeholder="e.g. Ustad Muhammad Aslam"
          maxLength={80}
          required
        />
      </Field>
      <Field label="Role or designation" htmlFor="role" errors={errors?.role}>
        <Input
          {...fieldProps("role", errors)}
          defaultValue={member?.role}
          placeholder="e.g. Master woodcarver"
          maxLength={80}
          required
        />
      </Field>
      <Field label="Short bio" htmlFor="bio" errors={errors?.bio} hint="Optional. Up to 600 characters.">
        <Textarea
          {...fieldProps("bio", errors)}
          defaultValue={member?.bio ?? undefined}
          rows={4}
          maxLength={600}
          placeholder="Their craft, experience and what they love making."
        />
      </Field>
      <Field label="Phone" htmlFor="phone" errors={errors?.phone} hint="Optional. Shown as a call button.">
        <Input
          {...fieldProps("phone", errors)}
          type="tel"
          inputMode="tel"
          defaultValue={member?.phone ? formatPhone(member.phone) : undefined}
          placeholder="0300 1234567"
          maxLength={20}
        />
      </Field>
      <Switch
        name="is_whatsapp"
        label="Available on WhatsApp"
        description="Shows a WhatsApp button for this number."
        defaultChecked={member?.is_whatsapp ?? false}
      />
      <Field label="Email" htmlFor="email" errors={errors?.email} hint="Optional.">
        <Input
          {...fieldProps("email", errors)}
          type="email"
          inputMode="email"
          defaultValue={member?.email ?? undefined}
          maxLength={254}
        />
      </Field>
      <Field
        label="Display order"
        htmlFor="display_order"
        errors={errors?.display_order}
        hint="Lower numbers are shown first."
      >
        <Input
          {...fieldProps("display_order", errors)}
          type="number"
          inputMode="numeric"
          min={0}
          max={999}
          step={1}
          defaultValue={member?.display_order ?? 0}
        />
      </Field>
      <Switch
        name="is_published"
        label="Show on team page"
        description="Turn off to hide this person without deleting them."
        defaultChecked={member?.is_published ?? true}
      />

      {state.status === "idle" && notice ? <Alert tone="success">{notice}</Alert> : <FormMessage state={state} />}
      <div className="flex gap-2">
        {member && (
          <Link href="/admin/team" className={buttonClasses({ variant: "secondary", className: "flex-1" })}>
            Cancel
          </Link>
        )}
        <SubmitButton pending={pending} className="flex-1">
          {!pending && (member ? <Save className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />)}
          {pending ? "Saving" : member ? "Save changes" : "Add member"}
        </SubmitButton>
      </div>
    </form>
  );
}
