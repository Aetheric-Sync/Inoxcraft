import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export default {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        if ("role" in user) {
          token.role = user.role;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && token.role) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
