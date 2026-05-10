import { setRequestLocale } from "next-intl/server"
import { getTranslations } from "next-intl/server"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AvailabilityCalendar } from "@/components/availability/AvailabilityCalendar"
import { getHospitals } from "@/server/actions/hospital.actions"
import { getMealTimes } from "@/server/actions/mealtime.actions"
import { getAvailabilityForMonth } from "@/server/actions/donation.actions"
import { routing } from "@/i18n/routing"
import { HospitalSelector } from "@/components/availability/HospitalSelector"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function AvailabilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ hospitalId?: string; month?: string }>
}) {
  const { locale } = await params
  const { hospitalId, month } = await searchParams
  setRequestLocale(locale)

  const t = await getTranslations("calendar")

  const [hospitals, mealTimes] = await Promise.all([
    getHospitals(true),
    getMealTimes(true),
  ])

  const now = new Date()
  const [year, monthNum] = month
    ? month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1]

  const selectedHospitalId = hospitalId ?? hospitals[0]?.id ?? ""

  const slots = selectedHospitalId
    ? await getAvailabilityForMonth(selectedHospitalId, year, monthNum)
    : []

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">{t("title")}</h1>

          <div className="mb-6">
            <HospitalSelector
              hospitals={hospitals}
              selectedId={selectedHospitalId}
            />
          </div>

          <AvailabilityCalendar
            mealTimes={mealTimes}
            initialSlots={slots.map((s) => ({
              ...s,
              donationDate: new Date(s.donationDate),
            }))}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
