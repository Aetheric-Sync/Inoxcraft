"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import type { Session } from "next-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Layers,
  Shield,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  {
    label: "Dashboard",
    href:  "/dashboard",
    icon:  LayoutDashboard,
  },
  {
    label: "Projects",
    href:  "/projects",
    icon:  FolderOpen,
  },
  {
    label: "Quotations",
    href:  "/quotations",
    icon:  FileText,
  },
  {
    label: "Customers",
    href:  "/customers",
    icon:  Users,
  },
];

const adminItems = [
  {
    label: "Materials",
    href:  "/admin/materials",
    icon:  Layers,
  },
  {
    label: "Users",
    href:  "/admin/users",
    icon:  Shield,
  },
];

function NavLink({
  item,
  active,
  onClick,
}: {
  item: { label: string; href: string; icon: any };
  active: boolean;
  onClick?: (() => void) | undefined;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href as any}
      {...(onClick ? { onClick } : {})}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-inox-600 text-white shadow-inox"
          : "text-neutral-400 hover:bg-white/8 hover:text-white"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-inox-600 shadow-inox"
          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-3">
        <Icon
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-transform duration-200",
            active ? "text-white" : "text-neutral-500 group-hover:text-neutral-300",
            !active && "group-hover:scale-110"
          )}
        />
        {item.label}
      </span>
      {active && (
        <ChevronRight className="relative z-10 ml-auto h-3.5 w-3.5 text-white/60" />
      )}
    </Link>
  );
}

function SidebarContent({ onLinkClick, session }: { onLinkClick?: () => void; session: Session }) {
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "admin";

  const initials = session?.user?.name
    ?.split(" ")
    .map((n: any) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <div className="flex h-full flex-col bg-neutral-950 text-white">
      {/* ── Logo ───────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-white/8 px-5 py-5">
        <div className="flex items-center justify-center overflow-hidden rounded-lg bg-white p-0.5">
          <img src="/images/logo.png" alt="Logo" className="h-7 w-auto object-contain" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-white">
            INOXCRAFT
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-neutral-500">
            Fabrication Suite
          </p>
        </div>
      </div>

      {/* ── Nav ────────────────────────────────── */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 scrollbar-none">
        <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
          Main
        </div>
        {navItems.map((item: any) => (
          <NavLink
            key={item.href}
            item={item}
            active={
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            }
            onClick={onLinkClick}
          />
        ))}

        {isAdmin && (
          <>
            <div className="mb-1 mt-5 px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
              Admin
            </div>
            {adminItems.map((item: any) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname.startsWith(item.href)}
                onClick={onLinkClick}
              />
            ))}
          </>
        )}
      </nav>

      {/* ── User ───────────────────────────────── */}
      <div className="border-t border-white/8 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-8 w-8 ring-2 ring-inox-600/40">
            <AvatarFallback className="bg-inox-700 text-xs font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {session?.user?.name ?? "User"}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {session?.user?.email ?? ""}
            </p>
          </div>
          <button
            onClick={() => void signOut({ callbackUrl: "/login" })}
            className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-white/8 hover:text-red-400"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SidebarNav({ session }: { session: Session }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Mobile hamburger ────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 text-muted-foreground hover:bg-muted"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 p-0 border-0">
            <SidebarContent onLinkClick={() => setMobileOpen(false)} session={session} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-8 items-center justify-center overflow-hidden rounded-md bg-white p-0.5 shadow-sm">
            <img src="/images/logo.png" alt="Logo" className="h-full w-auto" />
          </div>
          <span className="text-sm font-bold tracking-tight">INOXCRAFT</span>
        </div>
      </div>

      {/* ── Desktop sidebar ──────────────────────── */}
      <aside className="hidden w-60 flex-shrink-0 lg:block">
        <div className="sticky top-0 h-screen overflow-hidden">
          <SidebarContent session={session} />
        </div>
      </aside>
    </>
  );
}
