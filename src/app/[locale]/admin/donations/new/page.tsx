import { getTranslations } from "next-intl/server"
import { ManualDonationForm } from "@/components/admin/ManualDonationForm"
import { getHospitals } from "@/server/actions/hospital.actions"
import { getMealTimes } from "@/server/actions/mealtime.actions"

export default async function AdminManualDonationPage() {
  const t = await getTranslations("admin")
  const [hospitals, mealTimes] = await Promise.all([
    getHospitals(true),
    getMealTimes(true),
  ])

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("manualEntry")}</h1>
      <div className="rounded-xl border bg-white p-6">
        <ManualDonationForm hospitals={hospitals} mealTimes={mealTimes} />
      </div>
    </div>
  )
}
