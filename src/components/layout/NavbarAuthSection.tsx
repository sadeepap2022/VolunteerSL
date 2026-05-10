"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Link, usePathname } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function NavbarAuthSection() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as { role?: string } | undefined)?.role

  const authLinks = [
    ...(session ? [{ href: "/dashboard" as const, label: t("dashboard") }] : []),
    ...(role === "ADMIN" ? [{ href: "/admin" as const, label: t("admin") }] : []),
  ]

  return (
    <>
      <nav className="hidden items-center gap-6 md:flex">
        {authLinks.map((link) => (
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
    </>
  )
}
