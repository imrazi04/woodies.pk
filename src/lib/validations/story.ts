import { z } from "zod";
import { slugify } from "@/lib/slug";
import { isStorageImageUrl } from "@/lib/storage/public-photos";
import { parseVideoUrl } from "@/lib/video";

export const storySchema = z
  .object({
    title: z.string().trim().min(1, "Enter a title.").max(120, "Keep the title under 120 characters."),
    slug: z.string().trim(),
    content: z.string().trim().min(1, "Write the story.").max(20000, "Keep the story under 20,000 characters."),
    image_url: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || isStorageImageUrl(value),
        "Upload an image, or use an image link from this store's Supabase Storage.",
      ),
    video_url: z
      .string()
      .trim()
      .max(500, "Keep the link under 500 characters.")
      .refine((value) => value === "" || parseVideoUrl(value) !== null, "Paste a YouTube or Vimeo link."),
    display_order: z.coerce
      .number("Enter a number.")
      .int("Use a whole number.")
      .min(0, "Use 0 or more.")
      .max(999, "Use 999 or less."),
    is_published: z.boolean(),
  })
  .transform((data, ctx) => {
    // An empty slug is generated from the title; a typed one is tidied into the same format.
    const slug = slugify(data.slug || data.title);
    if (!slug) {
      ctx.addIssue({ code: "custom", path: ["slug"], message: "The link name must include letters or numbers." });
      return z.NEVER;
    }
    return {
      title: data.title,
      slug,
      content: data.content,
      image_url: data.image_url || null,
      video_url: data.video_url || null,
      display_order: data.display_order,
      is_published: data.is_published,
    };
  });

export function readStoryForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    title: text("title"),
    slug: text("slug"),
    content: text("content"),
    image_url: text("image_url"),
    video_url: text("video_url"),
    display_order: text("display_order") || "0",
    is_published: formData.get("is_published") === "on",
  };
}
