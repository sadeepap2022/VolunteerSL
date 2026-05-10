export const dynamic = "force-dynamic"

import { setRequestLocale } from "next-intl/server"
import { getTranslations } from "next-intl/server"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { DonationSuccess } from "@/components/donation/DonationSuccess"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function DonationSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { locale } = await params
  const { ref } = await searchParams
  setRequestLocale(locale)

  if (!ref) notFound()

  const donation = await prisma.donation.findUnique({
    where: { referenceNumber: ref },
    select: { referenceNumber: true },
  })

  if (!donation) notFound()

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-20">
        <div className="mx-auto max-w-xl px-4">
          <DonationSuccess referenceNumber={donation.referenceNumber} />
        </div>
      </main>
      <Footer />
    </>
  )
}
