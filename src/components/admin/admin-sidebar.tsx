"use client";

import {
  BookUser,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  ShoppingBag,
  Tags,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/actions/auth";
import { siteConfig } from "@/config/site";
import { useModalDialog } from "@/hooks/use-modal-dialog";
import { cn } from "@/lib/utils";

type AdminHref = (typeof siteConfig.adminNav)[number]["href"];

const icons: Record<AdminHref, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/categories": Tags,
  "/admin/products": Package,
  "/admin/orders": ShoppingBag,
  "/admin/reviews": MessageSquare,
  "/admin/messages": Inbox,
  "/admin/contacts": BookUser,
  "/admin/team": UsersRound,
};

type SidebarProps = { email?: string; pendingOrders: number; unreadMessages: number };

export function AdminSidebar({ email, pendingOrders, unreadMessages }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useModalDialog(mobileOpen);

  return (
    <>
      {/* Mobile: top bar with a slide-in navigation drawer */}
      <header className="sticky top-0 print:hidden z-30 flex h-14 items-center justify-between border-b border-espresso/8 bg-background/85 px-3 backdrop-blur-xl md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          aria-haspopup="dialog"
          className="flex size-10 items-center justify-center rounded-xl text-espresso transition-colors hover:bg-espresso/5"
        >
          <Menu className="size-5" strokeWidth={1.75} aria-hidden />
        </button>
        <Link href="/admin" className="font-display text-2xl leading-none font-medium tracking-tight">
          {siteConfig.name}
        </Link>
        <Link
          href="/"
          target="_blank"
          aria-label="View store"
          className="flex size-10 items-center justify-center rounded-xl text-espresso transition-colors hover:bg-espresso/5"
        >
          <ExternalLink className="size-[18px]" strokeWidth={1.75} aria-hidden />
        </Link>
      </header>

      <dialog
        ref={drawerRef}
        aria-label="Admin navigation"
        onClose={() => setMobileOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) drawerRef.current?.close();
        }}
        className="drawer drawer-left m-0 mr-auto h-dvh max-h-none w-72 max-w-[85vw] bg-espresso p-0 text-cream md:hidden"
      >
        <SidebarContent
          email={email}
          pendingOrders={pendingOrders}
          unreadMessages={unreadMessages}
          onNavigate={() => drawerRef.current?.close()}
          onClose={() => drawerRef.current?.close()}
        />
      </dialog>

      {/* Desktop: fixed dark sidebar */}
      <aside className="hidden bg-espresso text-cream md:sticky md:top-0 md:flex md:h-dvh md:w-64 md:shrink-0 md:flex-col print:hidden">
        <SidebarContent email={email} pendingOrders={pendingOrders} unreadMessages={unreadMessages} />
      </aside>
    </>
  );
}

function SidebarContent({
  email,
  pendingOrders,
  unreadMessages,
  onNavigate,
  onClose,
}: SidebarProps & { onNavigate?: () => void; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col font-body">
      <div className="flex h-20 items-center justify-between gap-3 px-6">
        <Link href="/admin" onClick={onNavigate} className="flex items-baseline gap-2.5">
          <span className="font-display text-[1.75rem] leading-none font-medium tracking-tight text-cream">
            {siteConfig.name}
          </span>
          <span className="rounded-full bg-cream/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-cream/75 uppercase">
            Admin
          </span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="-mr-2 flex size-10 items-center justify-center rounded-xl text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
          >
            <X className="size-5" strokeWidth={1.75} aria-hidden />
          </button>
        )}
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-2">
        <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.2em] text-cream/55 uppercase">Manage</p>
        <ul className="space-y-1">
          {siteConfig.adminNav.map((item) => {
            const Icon = icons[item.href];
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const badge =
              item.href === "/admin/orders"
                ? { count: pendingOrders, label: "pending" }
                : item.href === "/admin/messages"
                  ? { count: unreadMessages, label: "unread" }
                  : null;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-300",
                    active ? "bg-cream/10 font-medium text-cream" : "text-cream/70 hover:bg-cream/5 hover:text-cream",
                  )}
                >
                  {active && <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-clay" />}
                  <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="flex-1">{item.title}</span>
                  {badge && badge.count > 0 && (
                    <span className="rounded-full bg-clay px-2 py-0.5 text-[11px] font-semibold text-cream tabular-nums">
                      {badge.count}
                      <span className="sr-only"> {badge.label}</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-cream/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/70 transition-colors hover:bg-cream/5 hover:text-cream"
        >
          <ExternalLink className="size-[18px]" strokeWidth={1.75} aria-hidden />
          View store
        </Link>
        <div className="flex items-center gap-3 rounded-xl bg-cream/5 p-2.5">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-clay text-sm font-semibold text-cream uppercase"
          >
            {email?.charAt(0) ?? "A"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-cream" title={email}>
              {email ?? "Admin"}
            </p>
            <p className="text-xs text-cream/55">Administrator</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex size-9 items-center justify-center rounded-lg text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
