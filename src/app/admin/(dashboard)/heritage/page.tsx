import { Eye, EyeOff, Landmark, Pencil, PlayCircle, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { deleteStory, setStoryPublished } from "@/actions/stories";
import { ActionButton } from "@/components/admin/action-button";
import { StoryForm } from "@/components/admin/story-form";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth/session";
import { firstParam } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/validations/utils";

export const metadata: Metadata = { title: "Heritage stories" };

export default async function AdminHeritagePage({ searchParams }: PageProps<"/admin/heritage">) {
  const [{ supabase }, params] = await Promise.all([requireAdmin(), searchParams]);
  const editId = firstParam(params.edit);

  const { data: stories, error } = await supabase
    .from("chiniot_stories")
    .select("*")
    .order("display_order")
    .order("created_at");
  if (error) throw new Error(error.message);

  const editing = isUuid(editId) ? stories.find((story) => story.id === editId) : undefined;

  return (
    <>
      <PageHeader
        title="Heritage stories"
        description="Chapters on the Chiniot heritage page: places, people and crafts. Changes appear on the store straight away."
        actions={
          <Link href="/chiniot-heritage" target="_blank" className={buttonClasses({ variant: "secondary" })}>
            View heritage page
          </Link>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-5 sm:p-6 xl:order-2">
          <h2 className="mb-5 text-[15px] font-semibold">{editing ? `Edit “${editing.title}”` : "New story"}</h2>
          <StoryForm story={editing} />
        </Card>

        <Card className="min-w-0">
          <CardHeader title={`All stories (${stories.length})`} />
          {stories.length === 0 ? (
            <EmptyState
              icon={Landmark}
              title="No stories yet"
              description="Add your first chapter, such as Omar Hayat Mahal, the Shahi Masjid or Chiniot's woodcarving tradition."
            />
          ) : (
            <ol className="divide-y divide-espresso/6">
              {stories.map((story, index) => (
                <li
                  key={story.id}
                  className={cn(
                    "flex gap-4 px-5 py-5 sm:px-6",
                    !story.is_published && "bg-linen/40",
                    story.id === editing?.id && "bg-linen/70",
                  )}
                >
                  <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg bg-linen ring-1 ring-espresso/6">
                    {story.image_url ? (
                      <Image src={story.image_url} alt="" fill sizes="96px" className="object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center font-display text-2xl text-taupe tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                    {story.video_url && (
                      <PlayCircle
                        className="absolute right-1 bottom-1 size-5 rounded-full bg-espresso/70 text-cream"
                        aria-label="Has a video"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <p className="font-medium">{story.title}</p>
                      {!story.is_published && <Badge dot>Draft</Badge>}
                    </div>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted">
                      #{story.slug} · Order {story.display_order}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-espresso/80">{story.content}</p>
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-1 sm:flex-row sm:items-start">
                    <Link
                      href={`/admin/heritage?edit=${story.id}`}
                      aria-label={`Edit ${story.title}`}
                      className={buttonClasses({ variant: "ghost", size: "icon" })}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <ActionButton
                      action={setStoryPublished.bind(null, story.id, !story.is_published)}
                      variant="ghost"
                      size="icon"
                      aria-label={story.is_published ? `Hide ${story.title}` : `Publish ${story.title}`}
                      title={story.is_published ? "Hide from heritage page" : "Publish on heritage page"}
                    >
                      {story.is_published ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </ActionButton>
                    <ActionButton
                      action={deleteStory.bind(null, story.id)}
                      confirm={{
                        title: `Delete “${story.title}”?`,
                        description:
                          "The story and its uploaded image will be permanently deleted. To keep it for later, hide it instead.",
                        confirmLabel: "Delete story",
                      }}
                      variant="danger"
                      size="icon"
                      aria-label={`Delete ${story.title}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </ActionButton>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </>
  );
}
