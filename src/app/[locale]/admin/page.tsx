import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"

export default async function AdminOverviewPage() {
  const t = await getTranslations("admin")

  const [donationCount, pendingVerifications, hospitalCount] = await Promise.all([
    prisma.donation.count(),
    prisma.payment.count({ where: { paymentStatus: "PENDING", method: "OFFLINE" } }),
    prisma.hospital.count({ where: { isActive: true } }),
  ])

  const stats = [
    { label: "Total Donations", value: donationCount },
    { label: "Pending Verifications", value: pendingVerifications },
    { label: "Active Hospitals", value: hospitalCount },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("title")}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-emerald-700">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
