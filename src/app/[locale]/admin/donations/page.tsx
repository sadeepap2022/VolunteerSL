import { getTranslations } from "next-intl/server"
import { getAllDonations } from "@/server/actions/donation.actions"
import { format } from "date-fns"
import type { Donation, Hospital, MealTime, Payment } from "@prisma/client"

type DonationWithRelations = Donation & {
  hospital: Pick<Hospital, "name">
  mealTime: Pick<MealTime, "name">
  payment: Payment | null
}

export default async function AdminDonationsPage() {
  const t = await getTranslations("admin")
  const tCommon = await getTranslations("common")
  const donations = await getAllDonations()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("donations")}</h1>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {[
                tCommon("reference"),
                tCommon("hospital"),
                tCommon("date"),
                tCommon("mealTime"),
                t("paymentMethod"),
                t("paymentStatus"),
                tCommon("status"),
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">
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
                <td className="px-4 py-3 text-gray-600">
                  {format(new Date(d.donationDate), "PP")}
                </td>
                <td className="px-4 py-3">{d.mealTime.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {d.payment?.method ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {d.payment ? (
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      d.payment.paymentStatus === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-700"
                        : d.payment.paymentStatus === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {d.payment.paymentStatus}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    d.status === "CONFIRMED"
                      ? "bg-emerald-100 text-emerald-700"
                      : d.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
