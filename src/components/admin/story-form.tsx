"use client";

import { Check, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { discardStoryImage, saveStory } from "@/actions/stories";
import { PhotoPicker, usePhotoPicker } from "@/components/admin/photo-picker";
import { Alert, FormMessage } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import { Field, fieldProps, Input, Switch, Textarea } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useActionForm } from "@/hooks/use-action-form";
import { errorState } from "@/lib/action-state";
import { slugify } from "@/lib/slug";
import { HERITAGE_IMAGES_BUCKET } from "@/lib/storage/public-photos";
import { parseVideoUrl } from "@/lib/video";
import type { ChiniotStory } from "@/types/database";

/** Adds a heritage story, or edits `story` when given. */
export function StoryForm({ story }: { story?: ChiniotStory }) {
  // Remounting clears the fields after a story is added.
  const [added, setAdded] = useState({ count: 0, message: "" });
  return (
    <StoryFormInner
      key={story?.id ?? `new-${added.count}`}
      story={story}
      notice={story ? "" : added.message}
      onAdded={(message) => setAdded((previous) => ({ count: previous.count + 1, message }))}
    />
  );
}

function StoryFormInner({
  story,
  notice,
  onAdded,
}: {
  story?: ChiniotStory;
  notice: string;
  onAdded: (message: string) => void;
}) {
  const router = useRouter();
  const image = usePhotoPicker(story?.image_url);
  const [title, setTitle] = useState(story?.title ?? "");
  const [content, setContent] = useState(story?.content ?? "");
  const [videoUrl, setVideoUrl] = useState(story?.video_url ?? "");
  const video = videoUrl.trim() ? parseVideoUrl(videoUrl.trim()) : null;

  const { state, pending, onSubmit } = useActionForm(async (prev, formData) => {
    let resolved: { url: string; uploaded: boolean };
    try {
      resolved = await image.resolve(HERITAGE_IMAGES_BUCKET);
    } catch (error) {
      console.error("Story image upload failed", error);
      return errorState("The image couldn't be uploaded. Try another image, or try again.");
    }
    formData.set("image_url", resolved.url);

    const result = await saveStory(story?.id ?? null, prev, formData);
    if (result.status === "success") {
      if (story) router.push("/admin/heritage");
      else onAdded(result.message ?? "Story added.");
    } else if (resolved.uploaded) {
      // Nothing points at the new file; it's uploaded again on the next save.
      void discardStoryImage(resolved.url);
    }
    return result;
  });
  const errors = state.fieldErrors;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Title" htmlFor="title" errors={errors?.title}>
        <Input
          {...fieldProps("title", errors)}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Omar Hayat Mahal"
          maxLength={120}
          required
        />
      </Field>
      <Field
        label="Link name"
        htmlFor="slug"
        errors={errors?.slug}
        hint="Optional. Used in the page link, e.g. /chiniot-heritage#omar-hayat-mahal."
      >
        <Input
          {...fieldProps("slug", errors)}
          defaultValue={story?.slug}
          placeholder={slugify(title) || "generated-from-title"}
          maxLength={80}
          className="font-mono"
        />
      </Field>
      <Field
        label="Story"
        htmlFor="content"
        errors={errors?.content}
        hint={
          <>
            Leave a blank line between paragraphs. Start a line with <code>## </code> for a subheading or{" "}
            <code>&gt; </code> for a highlighted quote. {content.length.toLocaleString()} / 20,000
          </>
        }
      >
        <Textarea
          {...fieldProps("content", errors)}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={12}
          maxLength={20000}
          placeholder="Tell the history, the people and the craft behind this place or tradition."
          required
        />
      </Field>

      <PhotoPicker
        picker={image}
        label="Image"
        aspect="landscape"
        hint="Landscape photos look best. Resized automatically."
        serverError={errors?.image_url?.[0]}
        disabled={pending}
      />

      <Field
        label="Video link"
        htmlFor="video_url"
        errors={errors?.video_url}
        hint={
          video ? (
            <span className="inline-flex items-center gap-1 text-olive">
              <Check className="size-3.5" aria-hidden />
              {video.provider === "youtube" ? "YouTube" : "Vimeo"} video found. The image is used as its cover.
            </span>
          ) : (
            "Optional. A YouTube or Vimeo link."
          )
        }
      >
        <Input
          {...fieldProps("video_url", errors)}
          type="url"
          inputMode="url"
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          maxLength={500}
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
          defaultValue={story?.display_order ?? 0}
        />
      </Field>
      <Switch
        name="is_published"
        label="Show on heritage page"
        description="Turn off to keep this story as a draft."
        defaultChecked={story?.is_published ?? true}
      />

      {state.status === "idle" && notice ? <Alert tone="success">{notice}</Alert> : <FormMessage state={state} />}
      <div className="flex gap-2">
        {story && (
          <Link href="/admin/heritage" className={buttonClasses({ variant: "secondary", className: "flex-1" })}>
            Cancel
          </Link>
        )}
        <SubmitButton pending={pending} className="flex-1">
          {!pending && (story ? <Save className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />)}
          {pending ? "Saving" : story ? "Save changes" : "Add story"}
        </SubmitButton>
      </div>
    </form>
  );
}
