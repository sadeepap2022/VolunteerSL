"use client"

import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { LocaleSwitcher } from "./LocaleSwitcher"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as { role?: string } | undefined)?.role

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/availability", label: t("availability") },
    { href: "/donate", label: t("donate") },
    ...(session ? [{ href: "/dashboard", label: t("dashboard") }] : []),
    ...(role === "ADMIN" ? [{ href: "/admin", label: t("admin") }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-emerald-700">VSL</span>
          <span className="hidden text-sm text-gray-500 sm:inline">
            VolunteerSL
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-emerald-600",
                pathname === link.href
                  ? "text-emerald-700"
                  : "text-gray-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          {session ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/en" })}
            >
              {t("logout")}
            </Button>
          ) : (
            <Link href="/auth/signin">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                {t("login")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
