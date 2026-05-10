"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OfflinePaymentForm } from "./OfflinePaymentForm"
import { OnlinePaymentForm } from "./OnlinePaymentForm"
import type { DonationSelections, CompletedDonation } from "./DonationWizard"

type PaymentMethod = "ONLINE" | "OFFLINE" | null

interface Props {
  donation: CompletedDonation
  selections: DonationSelections
  onComplete: () => void
}

export function StepPayment({ donation, selections, onComplete }: Props) {
  const t = useTranslations("donate")
  const [method, setMethod] = useState<PaymentMethod>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("paymentTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Method selection */}
        {!method && (
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => setMethod("ONLINE")}
              className="rounded-lg border-2 p-4 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50"
            >
              <p className="font-semibold text-gray-900">{t("payOnline")}</p>
              <p className="mt-1 text-sm text-gray-500">{t("payOnlineDesc")}</p>
            </button>
            <button
              onClick={() => setMethod("OFFLINE")}
              className="rounded-lg border-2 p-4 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50"
            >
              <p className="font-semibold text-gray-900">{t("payOffline")}</p>
              <p className="mt-1 text-sm text-gray-500">{t("payOfflineDesc")}</p>
            </button>
          </div>
        )}

        {method === "ONLINE" && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMethod(null)}
              className="mb-2"
            >
              ← {t("back")}
            </Button>
            <OnlinePaymentForm donationId={donation.id} />
          </div>
        )}

        {method === "OFFLINE" && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMethod(null)}
              className="mb-2"
            >
              ← {t("back")}
            </Button>
            <OfflinePaymentForm
              donationId={donation.id}
              onComplete={onComplete}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
