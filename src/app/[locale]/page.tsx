import { setRequestLocale, getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { routing } from "@/i18n/routing"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("home")
  const tNav = await getTranslations("nav")

  const steps = [
    { title: t("step1Title"), desc: t("step1Desc"), icon: "🗓️" },
    { title: t("step2Title"), desc: t("step2Desc"), icon: "💳" },
    { title: t("step3Title"), desc: t("step3Desc"), icon: "✅" },
  ]

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-50 to-teal-100 py-24 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-emerald-900 sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mb-8 text-lg text-emerald-700">{t("subtitle")}</p>
            <Link href="/availability">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                {t("cta")}
              </Button>
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              {t("howItWorks")}
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm"
                >
                  <div className="mb-3 text-3xl">{step.icon}</div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
