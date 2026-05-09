import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];
const ADMIN_PATHS = ["/admin"];

export default auth(
  (
    req: NextRequest & {
      auth: { user?: { role?: string } } | null;
    },
  ) => {
    const { pathname } = req.nextUrl;

    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (isPublic) return NextResponse.next();

    if (!req.auth) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAdminPath = ADMIN_PATHS.some((p) => pathname.includes(p));
    if (isAdminPath && req.auth.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
