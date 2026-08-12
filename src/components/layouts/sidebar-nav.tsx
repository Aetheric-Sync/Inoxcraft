"use client";

import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import type { Session } from "next-auth";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Users,
  LogOut,
  Menu,
  ChevronRight,
  Layers,
  Shield,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderOpen,
  },
  {
    label: "Quotations",
    href: "/quotations",
    icon: FileText,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
  },
];

const adminItems = [
  {
    label: "Materials",
    href: "/admin/materials",
    icon: Layers,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Shield,
  },
];

function NavLink({
  item,
  active,
  onClick,
}: {
  item: { label: string; href: string; icon: LucideIcon };
  active: boolean;
  onClick?: (() => void) | undefined;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href as Route}
      {...(onClick ? { onClick } : {})}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-inox-600 shadow-inox text-white"
          : "text-neutral-400 hover:bg-white/8 hover:text-white",
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="bg-inox-600 shadow-inox absolute inset-0 rounded-lg"
          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-3">
        <Icon
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-transform duration-200",
            active ? "text-white" : "text-neutral-500 group-hover:text-neutral-300",
            !active && "group-hover:scale-110",
          )}
        />
        {item.label}
      </span>
      {active && <ChevronRight className="relative z-10 ml-auto h-3.5 w-3.5 text-white/60" />}
    </Link>
  );
}

function SidebarContent({ onLinkClick, session }: { onLinkClick?: () => void; session: Session }) {
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "admin";

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div className="flex h-full flex-col bg-neutral-950 text-white">
      {/* ── Logo ───────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-white/8 px-5 py-5">
        <div className="flex items-center justify-center overflow-hidden rounded-lg bg-white p-0.5">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={1408}
            height={768}
            className="h-7 w-auto object-contain"
          />
        </div>
        <div>
          <p className="text-sm leading-none font-semibold text-white">INOXCRAFT</p>
          <p className="mt-0.5 text-[10px] font-medium tracking-widest text-neutral-500 uppercase">
            Fabrication Suite
          </p>
        </div>
      </div>

      {/* ── Nav ────────────────────────────────── */}
      <nav className="flex-1 scrollbar-none space-y-0.5 overflow-y-auto px-3 py-4">
        <div className="mb-1 px-2 text-[10px] font-semibold tracking-widest text-neutral-600 uppercase">
          Main
        </div>
        {navItems.map((item) => (
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
            <div className="mt-5 mb-1 px-2 text-[10px] font-semibold tracking-widest text-neutral-600 uppercase">
              Admin
            </div>
            {adminItems.map((item) => (
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
          <Avatar className="ring-inox-600/40 h-8 w-8 ring-2">
            <AvatarFallback className="bg-inox-700 text-xs font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {session?.user?.name ?? "User"}
            </p>
            <p className="truncate text-xs text-neutral-500">{session?.user?.email ?? ""}</p>
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
      <div className="border-border bg-background/95 fixed top-0 right-0 left-0 z-40 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-sm lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-muted mr-2"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 border-0 p-0">
            <SidebarContent onLinkClick={() => setMobileOpen(false)} session={session} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-8 items-center justify-center overflow-hidden rounded-md bg-white p-0.5 shadow-sm">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={1408}
              height={768}
              className="h-full w-auto"
            />
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
