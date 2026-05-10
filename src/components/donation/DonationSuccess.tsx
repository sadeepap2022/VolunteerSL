"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface Props {
  referenceNumber: string
}

export function DonationSuccess({ referenceNumber }: Props) {
  const t = useTranslations("donate")

  return (
    <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
      <CheckCircle className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        {t("successTitle")}
      </h2>
      <p className="mb-6 text-gray-600">{t("successMessage")}</p>

      <div className="mx-auto mb-6 inline-block rounded-lg bg-emerald-50 px-6 py-3">
        <p className="text-xs text-gray-500">{t("successRef")}</p>
        <p className="font-mono text-xl font-bold text-emerald-700">
          {referenceNumber}
        </p>
      </div>

      <Link href="/dashboard">
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          {t("successViewDashboard")}
        </Button>
      </Link>
    </div>
  )
}
