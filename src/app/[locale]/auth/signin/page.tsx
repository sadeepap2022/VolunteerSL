export const dynamic = "force-dynamic"

import { setRequestLocale } from "next-intl/server"
import { getTranslations } from "next-intl/server"
import { signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { routing } from "@/i18n/routing"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("nav")

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-3xl font-bold text-emerald-700">VSL</span>
          <p className="mt-1 text-sm text-gray-500">VolunteerSL</p>
        </div>
        <form
          action={async () => {
            "use server"
            await signIn("asgardeo", { redirectTo: `/${locale}` })
          }}
        >
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {t("login")} with WSO2 Asgardeo
          </Button>
        </form>
      </div>
    </div>
  )
}
