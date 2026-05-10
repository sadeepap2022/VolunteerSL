"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createDonation } from "@/server/actions/donation.actions"
import { toast } from "sonner"
import type { DonationSelections, CompletedDonation } from "./DonationWizard"
import { MEAL_AMOUNT_LKR } from "@/lib/constants"

interface Props {
  selections: DonationSelections
  onBack: () => void
  onDonationCreated: (donation: CompletedDonation) => void
}

export function StepConfirm({ selections, onBack, onDonationCreated }: Props) {
  const t = useTranslations("donate")
  const tErrors = useTranslations("errors")
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      const result = await createDonation({
        hospitalId: selections.hospitalId,
        mealTimeId: selections.mealTimeId,
        donationDate: selections.donationDate,
      })

      if ("error" in result) {
        if (result.error === "SLOT_TAKEN") {
          toast.error(tErrors("slotTaken"))
          onBack()
        } else {
          toast.error(tErrors("genericError"))
        }
        return
      }

      onDonationCreated({
        id: result.donation.id,
        referenceNumber: result.donation.referenceNumber,
      })
    } catch {
      toast.error(tErrors("genericError"))
    } finally {
      setLoading(false)
    }
  }

  const rows = [
    { label: t("confirmHospital"), value: selections.hospitalName },
    {
      label: t("confirmDate"),
      value: format(new Date(selections.donationDate), "PPP"),
    },
    { label: t("confirmMealTime"), value: selections.mealTimeName },
    {
      label: t("confirmAmount"),
      value: `LKR ${parseFloat(MEAL_AMOUNT_LKR).toLocaleString()}`,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("confirmTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="divide-y rounded-lg border">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between px-4 py-3 text-sm">
              <dt className="font-medium text-gray-600">{label}</dt>
              <dd className="text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            {t("back")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? "..." : t("confirmButton")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
