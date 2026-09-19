import { BookUser, Eye, EyeOff, MessageCircle, Pencil, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { deleteContactPerson, setContactPublished } from "@/actions/contact-admin";
import { ActionButton } from "@/components/admin/action-button";
import { ContactPersonForm } from "@/components/admin/contact-person-form";
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

export const metadata: Metadata = { title: "Contacts" };

export default async function AdminContactsPage({ searchParams }: PageProps<"/admin/contacts">) {
  const [{ supabase }, params] = await Promise.all([requireAdmin(), searchParams]);
  const editId = firstParam(params.edit);

  const { data: contacts, error } = await supabase
    .from("contact_persons")
    .select("*")
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(error.message);

  const editing = isUuid(editId) ? contacts.find((contact) => contact.id === editId) : undefined;

  return (
    <>
      <PageHeader
        title="Contacts"
        description="People and departments listed on the public contact page. Changes appear on the store straight away."
        actions={
          <Link href="/contact" target="_blank" className={buttonClasses({ variant: "secondary" })}>
            View contact page
          </Link>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-5 sm:p-6 lg:sticky lg:top-6 lg:order-2">
          <h2 className="mb-5 text-[15px] font-semibold">{editing ? `Edit ${editing.name}` : "New contact"}</h2>
          <ContactPersonForm contact={editing} />
        </Card>

        <Card className="min-w-0">
          <CardHeader title={`All contacts (${contacts.length})`} />
          {contacts.length === 0 ? (
            <EmptyState
              icon={BookUser}
              title="No contacts yet"
              description="Add a person or department with the form. Until then, the contact page shows your main WhatsApp number."
            />
          ) : (
            <ul className="divide-y divide-espresso/6">
              {contacts.map((contact) => (
                <li
                  key={contact.id}
                  className={cn(
                    "flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center",
                    !contact.is_published && "bg-linen/40",
                    contact.id === editing?.id && "bg-linen/70",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <p className="font-medium">{contact.name}</p>
                      {!contact.is_published && <Badge dot>Hidden</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {contact.department} · Order {contact.sort_order}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {contact.phone && (
                        <span className="inline-flex items-center gap-1.5 tabular-nums">
                          {formatPhone(contact.phone)}
                          {contact.is_whatsapp && (
                            <MessageCircle className="size-3.5 text-olive" aria-label="On WhatsApp" />
                          )}
                        </span>
                      )}
                      {contact.email && <span className="break-all text-muted">{contact.email}</span>}
                      {contact.hours && <span className="text-muted">{contact.hours}</span>}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/admin/contacts?edit=${contact.id}`}
                      aria-label={`Edit ${contact.name}`}
                      className={buttonClasses({ variant: "ghost", size: "icon" })}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <ActionButton
                      action={setContactPublished.bind(null, contact.id, !contact.is_published)}
                      variant="ghost"
                      size="icon"
                      aria-label={contact.is_published ? `Hide ${contact.name}` : `Show ${contact.name}`}
                      title={contact.is_published ? "Hide from contact page" : "Show on contact page"}
                    >
                      {contact.is_published ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </ActionButton>
                    <ActionButton
                      action={deleteContactPerson.bind(null, contact.id)}
                      confirm={{
                        title: `Delete “${contact.name}”?`,
                        description:
                          "They'll be removed from the contact page. To keep them for later, hide them instead.",
                        confirmLabel: "Delete contact",
                      }}
                      variant="danger"
                      size="icon"
                      aria-label={`Delete ${contact.name}`}
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
