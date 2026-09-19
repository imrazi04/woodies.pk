import { Inbox, Mail, MailOpen, MessageCircle, Phone, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { deleteContactMessage, setMessageRead } from "@/actions/contact-admin";
import { ActionButton } from "@/components/admin/action-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatPhone } from "@/lib/format";
import { ADMIN_PAGE_SIZE, firstParam, pageRange, parsePage, RANGE_NOT_SATISFIABLE } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { whatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const [{ supabase }, params] = await Promise.all([requireAdmin(), searchParams]);
  const unreadOnly = firstParam(params.filter) === "unread";
  const page = parsePage(params.page);
  const { from, to } = pageRange(page);

  let query = supabase
    .from("contact_messages")
    .select("id, name, email, phone, message, is_read, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (unreadOnly) query = query.eq("is_read", false);

  const { data, count, error } = await query;
  if (error && error.code !== RANGE_NOT_SATISFIABLE) throw new Error(error.message);
  const messages = data ?? [];

  const tabs = [
    { label: "All", href: "/admin/messages", active: !unreadOnly },
    { label: "Unread", href: "/admin/messages?filter=unread", active: unreadOnly },
  ];

  return (
    <>
      <PageHeader
        title="Messages"
        description="Messages sent through the contact page. Reply by email, phone or WhatsApp."
      />
      <FilterTabs label="Filter messages" tabs={tabs} />

      <Card>
        {messages.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={unreadOnly ? "You're all caught up" : "No messages yet"}
            description={
              unreadOnly ? "There are no unread messages." : "Messages from the contact page will show up here."
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-espresso/6">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={cn("flex flex-col gap-5 px-6 py-6 sm:flex-row", !message.is_read && "bg-linen/40")}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linen font-display text-lg"
                      >
                        {message.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <p className="font-medium">{message.name}</p>
                          {!message.is_read && (
                            <Badge tone="amber" dot>
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted">{formatDateTime(message.created_at)}</p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-espresso/90">
                      {message.message}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                      <a
                        href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: your message to ${siteConfig.name}`)}`}
                        className="inline-flex items-center gap-1.5 font-medium break-all hover:underline"
                      >
                        <Mail className="size-4 shrink-0 text-muted" aria-hidden />
                        {message.email}
                      </a>
                      {message.phone && (
                        <>
                          <a
                            href={`tel:${message.phone}`}
                            className="inline-flex items-center gap-1.5 tabular-nums hover:underline"
                          >
                            <Phone className="size-4 text-muted" aria-hidden />
                            {formatPhone(message.phone)}
                          </a>
                          <a
                            href={whatsAppUrl(
                              message.phone,
                              `Hi ${message.name}, this is ${siteConfig.name} replying to your message.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-olive hover:underline"
                          >
                            <MessageCircle className="size-4" aria-hidden />
                            WhatsApp
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-start gap-1 sm:flex-col sm:items-end">
                    <ActionButton
                      action={setMessageRead.bind(null, message.id, !message.is_read)}
                      variant="secondary"
                      size="sm"
                    >
                      {message.is_read ? (
                        <Mail className="size-3.5" aria-hidden />
                      ) : (
                        <MailOpen className="size-3.5" aria-hidden />
                      )}
                      {message.is_read ? "Mark unread" : "Mark read"}
                    </ActionButton>
                    <ActionButton
                      action={deleteContactMessage.bind(null, message.id)}
                      confirm={{
                        title: "Delete this message?",
                        description: `The message from ${message.name} will be permanently deleted.`,
                        confirmLabel: "Delete message",
                      }}
                      variant="danger"
                      size="sm"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Delete
                    </ActionButton>
                  </div>
                </li>
              ))}
            </ul>
            <Pagination
              page={page}
              pageSize={ADMIN_PAGE_SIZE}
              total={count ?? 0}
              pathname="/admin/messages"
              params={{ filter: unreadOnly ? "unread" : undefined }}
            />
          </>
        )}
      </Card>
    </>
  );
}
