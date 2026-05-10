import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { Geist } from "next/font/google"
import { Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google"
import { routing } from "@/i18n/routing"
import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const notoSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  variable: "--font-noto-sinhala",
  weight: ["400", "500", "700"],
})
const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-noto-tamil",
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "VolunteerSL — Sponsor a Hospital Meal",
  description:
    "Support patients at Sri Lankan government hospitals by donating a meal.",
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${geist.variable} ${notoSinhala.variable} ${notoTamil.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
