"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { LocaleSwitcher } from "./LocaleSwitcher"
import { cn } from "@/lib/utils"

const NavbarAuthSection = dynamic(
  () => import("./NavbarAuthSection").then((m) => m.NavbarAuthSection),
  { ssr: false, loading: () => <div className="h-8 w-20 animate-pulse rounded bg-gray-200" /> }
)

export function Navbar() {
  const t = useTranslations("nav")
  const pathname = usePathname()

  const publicLinks = [
    { href: "/" as const, label: t("home") },
    { href: "/availability" as const, label: t("availability") },
    { href: "/donate" as const, label: t("donate") },
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
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-emerald-600",
                pathname === link.href ? "text-emerald-700" : "text-gray-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <NavbarAuthSection />
        </div>
      </div>
    </header>
  )
}
