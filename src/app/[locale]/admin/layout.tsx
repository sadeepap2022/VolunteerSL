export const dynamic = "force-dynamic"

import { requireAdmin } from "@/lib/auth-helpers"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { routing } from "@/i18n/routing"
import { setRequestLocale } from "next-intl/server"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  await requireAdmin()

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  )
}
