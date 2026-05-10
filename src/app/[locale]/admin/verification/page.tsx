import { getTranslations } from "next-intl/server"
import { getPendingVerifications } from "@/server/actions/admin.actions"
import { format } from "date-fns"
import { VerificationActions } from "@/components/admin/VerificationActions"
import type { Payment, Donation, Hospital, MealTime } from "@prisma/client"

type PendingItem = Payment & {
  donation: Donation & {
    hospital: Pick<Hospital, "name">
    mealTime: Pick<MealTime, "name" | "timeString">
  }
}

export default async function AdminVerificationPage() {
  const t = await getTranslations("admin")
  const items = await getPendingVerifications()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("verification")}</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center text-gray-500">
          {t("noVerificationItems")}
        </div>
      ) : (
        <div className="space-y-4">
          {(items as PendingItem[]).map((item) => (
            <div key={item.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm font-bold text-emerald-700">
                    {item.donation.referenceNumber}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {item.donation.hospital.name} —{" "}
                    {item.donation.mealTime.name} ({item.donation.mealTime.timeString})
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(item.donation.donationDate), "PPP")}
                  </p>
                  {item.payhereReference && (
                    <p className="text-sm text-gray-500">
                      Bank Ref: <span className="font-mono">{item.payhereReference}</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    LKR {Number(item.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(item.createdAt), "PP")}
                  </p>
                </div>
              </div>

              {item.receiptUrl && (
                <div className="mb-4">
                  <a
                    href={item.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 underline"
                  >
                    {t("viewReceipt")}
                  </a>
                </div>
              )}

              <VerificationActions paymentId={item.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
