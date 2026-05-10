import Link from "next/link";
import { LayoutDashboard, Briefcase, FileText, Users, Settings, Menu } from "lucide-react";

import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { UserNav } from "./user-nav";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: Briefcase },
  { label: "Quotations", href: "/quotations", icon: FileText },
  { label: "Customers", href: "/customers", icon: Users },
];

const NAV_LINK_CLASS =
  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-inox-50 hover:text-inox-600 text-slate-600";

function NavLinks({ role }: { role: string }) {
  return (
    <nav className="flex-1 space-y-1 px-4 py-4">
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className={cn(NAV_LINK_CLASS)}>
          <item.icon className="h-5 w-5 shrink-0" />
          {item.label}
        </Link>
      ))}
      {role === "admin" && (
        <Link href="/admin/materials" className={cn(NAV_LINK_CLASS)}>
          <Settings className="h-5 w-5 shrink-0" />
          Admin
        </Link>
      )}
    </nav>
  );
}

export async function SidebarNav() {
  const session = await auth();
  if (!session?.user) return null;

  const role = session.user.role;
  const user = session.user;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-white lg:flex">
        <div className="border-b p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-inox-600 text-lg leading-tight font-bold tracking-tight">
              HAKEEM&apos;S
              <br />
              INOXCRAFT
            </span>
          </Link>
        </div>
        <NavLinks role={role} />
        <div className="border-t p-4">
          <UserNav user={user} />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center border-b bg-white p-4 lg:hidden">
        <Sheet>
          <SheetTrigger className="mr-2 inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="border-b p-6">
              <Link href="/dashboard">
                <span className="text-inox-600 text-lg leading-tight font-bold tracking-tight">
                  HAKEEM&apos;S
                  <br />
                  INOXCRAFT
                </span>
              </Link>
            </div>
            <NavLinks role={role} />
            <div className="mt-auto border-t p-4">
              <UserNav user={user} />
            </div>
          </SheetContent>
        </Sheet>
        <span className="text-inox-600 text-sm font-bold">INOXCRAFT</span>
      </div>
    </>
  );
}
