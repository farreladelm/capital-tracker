import type { NextAuthConfig } from "next-auth"

// This file is used specifically for Edge-compatible NextAuth configuration (like Middleware).
// Providers that rely on Node.js APIs (like Prisma/Bcrypt) are added in the main auth.ts file.
export default {
  providers: [],
  pages: {
    signIn: "/login",
  },
  trustHost: true,
} satisfies NextAuthConfig
