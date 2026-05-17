export const dynamic = "force-dynamic"

import { setRequestLocale } from "next-intl/server"
import { getTranslations } from "next-intl/server"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { DonationWizard } from "@/components/donation/DonationWizard"
import { getHospitals } from "@/server/actions/hospital.actions"
import { getMealTimes } from "@/server/actions/mealtime.actions"

export default async function DonatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ hospitalId?: string; mealTimeId?: string; date?: string }>
}) {
  const { locale } = await params
  const { hospitalId, mealTimeId, date } = await searchParams
  setRequestLocale(locale)

  const t = await getTranslations("donate")

  const [hospitals, mealTimes] = await Promise.all([
    getHospitals(true),
    getMealTimes(true),
  ])

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-10">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">{t("title")}</h1>
          <DonationWizard
            hospitals={hospitals}
            mealTimes={mealTimes}
            initialValues={{ hospitalId, mealTimeId, date }}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
