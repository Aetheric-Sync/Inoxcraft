import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { userRepository } from "@/repositories/user.repository";

import authConfig from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          console.error("Auth: Invalid credentials schema", parsed.error.format());
          return null;
        }

        try {
          const user = await userRepository.findByEmail(parsed.data.email);
          if (!user) {
            console.warn(`Auth: User not found: ${parsed.data.email}`);
            return null;
          }
          if (user.deletedAt) {
            console.warn(`Auth: User account deleted: ${parsed.data.email}`);
            return null;
          }

          if (!user.passwordHash) {
            console.error(`Auth: User has no password hash: ${parsed.data.email}`);
            return null;
          }

          const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!isValid) {
            console.warn(`Auth: Invalid password for: ${parsed.data.email}`);
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth: Database error during authorize", error);
          return null;
        }
      },
    }),
  ],
});
