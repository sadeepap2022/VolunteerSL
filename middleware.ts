import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"
import { getToken } from "next-auth/jwt"
import { routing } from "@/i18n/routing"

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if path is under an admin segment (any locale)
  const isAdminPath = /^\/[a-z]{2}\/admin/.test(pathname)

  if (isAdminPath) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    })

    if (!token || token.role !== "ADMIN") {
      // Extract locale from pathname or default to 'en'
      const localeMatch = pathname.match(/^\/([a-z]{2})\//)
      const locale = localeMatch ? localeMatch[1] : "en"
      return NextResponse.redirect(new URL(`/${locale}`, request.url))
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Match all paths except static assets and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
