import { Eye, EyeOff, Mail, MessageCircle, Pencil, Phone, Trash2, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { deleteTeamMember, setTeamMemberPublished } from "@/actions/team";
import { ActionButton } from "@/components/admin/action-button";
import { TeamMemberForm } from "@/components/admin/team-member-form";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth/session";
import { formatPhone } from "@/lib/format";
import { firstParam } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/validations/utils";

export const metadata: Metadata = { title: "Team" };

export default async function AdminTeamPage({ searchParams }: PageProps<"/admin/team">) {
  const [{ supabase }, params] = await Promise.all([requireAdmin(), searchParams]);
  const editId = firstParam(params.edit);

  const { data: members, error } = await supabase
    .from("team_members")
    .select("*")
    .order("display_order")
    .order("created_at");
  if (error) throw new Error(error.message);

  const editing = isUuid(editId) ? members.find((member) => member.id === editId) : undefined;

  return (
    <>
      <PageHeader
        title="Team"
        description="The people and artisans on the public team page. Changes appear on the store straight away."
        actions={
          <Link href="/team" target="_blank" className={buttonClasses({ variant: "secondary" })}>
            View team page
          </Link>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5 sm:p-6 lg:order-2">
          <h2 className="mb-5 text-[15px] font-semibold">{editing ? `Edit ${editing.name}` : "New team member"}</h2>
          <TeamMemberForm member={editing} />
        </Card>

        <Card className="min-w-0">
          <CardHeader title={`All team members (${members.length})`} />
          {members.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="No team members yet"
              description="Add your first artisan with the form. The team page shows a short note until someone is published."
            />
          ) : (
            <ul className="divide-y divide-espresso/6">
              {members.map((member) => (
                <li
                  key={member.id}
                  className={cn(
                    "flex gap-4 px-5 py-5 sm:px-6",
                    !member.is_published && "bg-linen/40",
                    member.id === editing?.id && "bg-linen/70",
                  )}
                >
                  <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-lg bg-linen ring-1 ring-espresso/6">
                    {member.image_url ? (
                      <Image src={member.image_url} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center font-display text-xl text-taupe">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <p className="font-medium">{member.name}</p>
                      {!member.is_published && <Badge dot>Hidden</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {member.role} · Order {member.display_order}
                    </p>
                    {member.bio && <p className="mt-2 line-clamp-2 text-sm text-espresso/80">{member.bio}</p>}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      {member.phone && (
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Phone className="size-3.5" aria-hidden />
                          {formatPhone(member.phone)}
                          {member.is_whatsapp && (
                            <MessageCircle className="ml-0.5 size-3.5 text-olive" aria-label="On WhatsApp" />
                          )}
                        </span>
                      )}
                      {member.email && (
                        <span className="inline-flex items-center gap-1 break-all">
                          <Mail className="size-3.5 shrink-0" aria-hidden />
                          {member.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-1 sm:flex-row sm:items-start">
                    <Link
                      href={`/admin/team?edit=${member.id}`}
                      aria-label={`Edit ${member.name}`}
                      className={buttonClasses({ variant: "ghost", size: "icon" })}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <ActionButton
                      action={setTeamMemberPublished.bind(null, member.id, !member.is_published)}
                      variant="ghost"
                      size="icon"
                      aria-label={member.is_published ? `Hide ${member.name}` : `Show ${member.name}`}
                      title={member.is_published ? "Hide from team page" : "Show on team page"}
                    >
                      {member.is_published ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </ActionButton>
                    <ActionButton
                      action={deleteTeamMember.bind(null, member.id)}
                      confirm={{
                        title: `Delete ${member.name}?`,
                        description:
                          "They'll be removed from the team page and their uploaded photo deleted. To keep them for later, hide them instead.",
                        confirmLabel: "Delete member",
                      }}
                      variant="danger"
                      size="icon"
                      aria-label={`Delete ${member.name}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
