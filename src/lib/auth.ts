import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import { prisma } from "@/lib/prisma"

async function provisionUser(params: {
  sub: string
  name: string
  email: string
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

const issuer = process.env.ASGARDEO_ISSUER ?? ""

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: "asgardeo",
      name: "WSO2 Asgardeo",
      type: "oidc",
      // Use manual endpoints to avoid eager OIDC discovery at module load
      issuer,
      authorization: {
        url: `${issuer}/authorize`,
        params: { scope: "openid profile email phone", response_type: "code" },
      },
      token: `${issuer}/token`,
      userinfo: `${issuer}/userinfo`,
      jwks_endpoint: `${issuer}/jwks`,
      clientId: process.env.ASGARDEO_CLIENT_ID,
      clientSecret: process.env.ASGARDEO_CLIENT_SECRET,
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
    async signIn({ user, profile }) {
      if (!profile?.sub || !user.email) return false
      try {
        const dbUser = await provisionUser({
          sub: profile.sub as string,
          name: user.name ?? "Unknown",
          email: user.email,
        })
        ;(user as { role?: string }).role = dbUser.role
        return true
      } catch {
        return false
      }
    },
    async jwt({ token, user, profile }) {
      if (user) {
        token.sub = (profile?.sub as string) ?? user.id
        const rawRole = (user as { role?: string }).role
        token.role = (rawRole === "ADMIN" ? "ADMIN" : "DONOR") as "DONOR" | "ADMIN"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/en/auth/signin",
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
