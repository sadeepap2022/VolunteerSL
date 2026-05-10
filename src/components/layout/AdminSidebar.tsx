"use client"

import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import {
  Building2,
  Clock,
  Gift,
  CheckSquare,
  ScrollText,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react"

export function AdminSidebar() {
  const t = useTranslations("admin")
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: t("title"), icon: LayoutDashboard },
    { href: "/admin/hospitals", label: t("hospitals"), icon: Building2 },
    { href: "/admin/mealtimes", label: t("mealtimes"), icon: Clock },
    { href: "/admin/donations", label: t("donations"), icon: Gift },
    { href: "/admin/donations/new", label: t("manualEntry"), icon: PlusCircle },
    { href: "/admin/verification", label: t("verification"), icon: CheckSquare },
    { href: "/admin/audit", label: t("audit"), icon: ScrollText },
  ]

  return (
    <aside className="w-60 shrink-0 border-r bg-gray-50">
      <nav className="flex flex-col gap-1 p-4">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-emerald-100 text-emerald-800"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
