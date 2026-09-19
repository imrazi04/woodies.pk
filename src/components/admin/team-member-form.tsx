"use client";

import { ImagePlus, Plus, Save, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { discardTeamPhoto, saveTeamMember } from "@/actions/team";
import { Alert, FormMessage } from "@/components/ui/alert";
import { Button, buttonClasses } from "@/components/ui/button";
import { Field, fieldProps, Input, Switch, Textarea } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useActionForm } from "@/hooks/use-action-form";
import { errorState } from "@/lib/action-state";
import { formatPhone } from "@/lib/format";
import { compressImage } from "@/lib/reviews/compress-image";
import {
  isStorageImageUrl,
  TEAM_PHOTO_ACCEPT,
  TEAM_PHOTOS_BUCKET,
  teamPhotoPath,
  validateTeamPhotoFile,
} from "@/lib/storage/team-photos";
import { createClient } from "@/lib/supabase/client";
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

/** Resizes the photo and uploads it straight to Supabase Storage (admin session + storage RLS). */
async function uploadTeamPhoto(file: File) {
  const resized = await compressImage(file);
  const supabase = createClient();
  const path = teamPhotoPath();
  const { error } = await supabase.storage
    .from(TEAM_PHOTOS_BUCKET)
    .upload(path, resized, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return supabase.storage.from(TEAM_PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;
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
  const fileInputId = useId();
  const [photoUrl, setPhotoUrl] = useState(member?.image_url ?? "");
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Release the preview's memory when it's replaced or the form unmounts.
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.preview);
    },
    [photo],
  );

  const { state, pending, onSubmit } = useActionForm(async (prev, formData) => {
    let uploadedUrl: string | null = null;
    if (photo) {
      try {
        uploadedUrl = await uploadTeamPhoto(photo.file);
      } catch (error) {
        console.error("Team photo upload failed", error);
        return errorState("The photo couldn't be uploaded. Try another image, or try again.");
      }
    }
    formData.set("image_url", uploadedUrl ?? photoUrl);

    const result = await saveTeamMember(member?.id ?? null, prev, formData);
    if (result.status === "success") {
      if (member) router.push("/admin/team");
      else onAdded(result.message ?? "Team member added.");
    } else if (uploadedUrl) {
      // Nothing points at the new file; it's uploaded again on the next save.
      void discardTeamPhoto(uploadedUrl);
    }
    return result;
  });
  const errors = state.fieldErrors;

  function choosePhoto(file: File) {
    const invalid = validateTeamPhotoFile(file);
    setPhotoError(invalid);
    if (!invalid) setPhoto({ file, preview: URL.createObjectURL(file) });
  }

  function clearPhoto() {
    setPhoto(null);
    setPhotoUrl("");
    setPhotoError(null);
  }

  // Only preview links that can actually be saved (and loaded under the site's image policy).
  const previewSrc = photo?.preview ?? (isStorageImageUrl(photoUrl) ? photoUrl : null);
  const photoMessage = photoError ?? errors?.image_url?.[0];

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <p className="mb-1.5 text-[13px] font-medium text-espresso">Photo</p>
        <div className="flex items-start gap-4">
          <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-xl bg-linen ring-1 ring-espresso/8">
            {previewSrc ? (
              <Image src={previewSrc} alt="" fill sizes="96px" unoptimized className="object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-taupe/60">
                <UserRound className="size-8" strokeWidth={1.25} aria-hidden />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <label
              htmlFor={fileInputId}
              className={buttonClasses({
                variant: "secondary",
                size: "sm",
                className: "cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-espresso",
              })}
            >
              <ImagePlus className="size-3.5" aria-hidden />
              {previewSrc || photoUrl ? "Replace photo" : "Upload photo"}
              <input
                id={fileInputId}
                type="file"
                accept={TEAM_PHOTO_ACCEPT}
                disabled={pending}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) choosePhoto(file);
                }}
              />
            </label>
            {(previewSrc || photoUrl) && (
              <Button variant="ghost" size="sm" onClick={clearPhoto} disabled={pending}>
                <X className="size-3.5" aria-hidden />
                Remove
              </Button>
            )}
            <p className="text-xs text-muted">A portrait works best. Resized automatically.</p>
          </div>
        </div>
        {!photo && (
          <Input
            id="image_url"
            aria-label="Or paste an image link"
            aria-invalid={photoMessage ? true : undefined}
            aria-describedby={photoMessage ? "image_url-error" : undefined}
            value={photoUrl}
            onChange={(event) => {
              setPhotoUrl(event.target.value);
              setPhotoError(null);
            }}
            placeholder="Or paste an image link from your store's storage"
            className="mt-3"
          />
        )}
        {photoMessage && (
          <p id="image_url-error" className="mt-1.5 text-xs text-rust">
            {photoMessage}
          </p>
        )}
      </div>

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
