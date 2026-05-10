export const dynamic = "force-dynamic"

import { setRequestLocale } from "next-intl/server"
import { getTranslations } from "next-intl/server"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { requireAuth } from "@/lib/auth-helpers"
import { getUserDonations } from "@/server/actions/donation.actions"
import { format } from "date-fns"
import { Link } from "@/i18n/navigation"
import type { Donation, Hospital, MealTime, Payment } from "@prisma/client"

type DonationWithRelations = Donation & {
  hospital: Pick<Hospital, "name">
  mealTime: Pick<MealTime, "name" | "timeString">
  payment: Pick<Payment, "method" | "paymentStatus" | "amount"> | null
}
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { routing } from "@/i18n/routing"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await requireAuth()
  const t = await getTranslations("dashboard")
  const tCommon = await getTranslations("common")

  const donations = await getUserDonations(session.user.id)

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-10">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">{t("title")}</h1>

          {donations.length === 0 ? (
            <div className="rounded-xl border bg-white p-12 text-center">
              <p className="mb-4 text-gray-500">{t("noDonations")}</p>
              <Link href="/donate">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  {t("donateNow")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-white">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    {[
                      tCommon("reference"),
                      tCommon("hospital"),
                      tCommon("date"),
                      tCommon("mealTime"),
                      tCommon("status"),
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(donations as DonationWithRelations[]).map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-emerald-700">
                        {d.referenceNumber}
                      </td>
                      <td className="px-4 py-3">{d.hospital.name}</td>
                      <td className="px-4 py-3">
                        {format(new Date(d.donationDate), "PP")}
                      </td>
                      <td className="px-4 py-3">{d.mealTime.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[d.status]}`}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
