import { NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"
import { auth } from "@/lib/auth"
import { routing } from "@/i18n/routing"

const intlMiddleware = createMiddleware(routing)

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const isAdminPath = /^\/[a-z]{2}\/admin/.test(pathname)

  if (isAdminPath) {
    const role = (req.auth?.user as { role?: string } | undefined)?.role
    if (!req.auth || role !== "ADMIN") {
      const localeMatch = pathname.match(/^\/([a-z]{2})\//)
      const locale = localeMatch ? localeMatch[1] : "en"
      return NextResponse.redirect(new URL(`/${locale}`, req.url))
    }
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
