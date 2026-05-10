import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import { prisma } from "@/lib/prisma"

async function provisionUser(params: {
  sub: string
  name: string
  email: string
  phone?: string
}) {
  return prisma.user.upsert({
    where: { id: params.sub },
    update: { name: params.name, email: params.email },
    create: {
      id: params.sub,
      name: params.name,
      email: params.email,
      role: "DONOR",
    },
  })
}

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: "asgardeo",
      name: "WSO2 Asgardeo",
      type: "oidc",
      issuer: process.env.ASGARDEO_ISSUER,
      clientId: process.env.ASGARDEO_CLIENT_ID,
      clientSecret: process.env.ASGARDEO_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile email phone",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username ?? "Unknown",
          email: profile.email ?? "",
          image: profile.picture ?? null,
        }
      },
    },
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!profile?.sub || !user.email) return false
      try {
        const dbUser = await provisionUser({
          sub: profile.sub as string,
          name: user.name ?? "Unknown",
          email: user.email,
        })
        // Attach role from DB onto user so jwt callback can read it
        ;(user as { role?: string }).role = dbUser.role
        return true
      } catch {
        return false
      }
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.sub = (profile?.sub as string) ?? user.id
        token.role = (user as { role?: string }).role ?? "DONOR"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        ;(session.user as { role?: string }).role =
          (token.role as string) ?? "DONOR"
      }
      return session
    },
  },
  pages: {
    signIn: "/en/auth/signin",
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
