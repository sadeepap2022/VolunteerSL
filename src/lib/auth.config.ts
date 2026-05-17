import type { NextAuthConfig } from "next-auth"

// Edge-compatible config — no Node.js / Prisma imports.
// Used by middleware for JWT verification only.
export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        if (user.id) token.sub = user.id
        token.role = ((user as { role?: string }).role ?? "DONOR") as "DONOR" | "ADMIN"
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as "DONOR" | "ADMIN"
      }
      return session
    },
  },
  pages: {
    signIn: "/en/auth/signin",
  },
}
