"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { getPayhereFormData } from "@/server/actions/payment.actions"
import { toast } from "sonner"

interface Props {
  donationId: string
}

export function OnlinePaymentForm({ donationId }: Props) {
  const t = useTranslations("donate")
  const tErrors = useTranslations("errors")
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPayhereFormData(donationId)
      .then((data) => setFormData(data as unknown as Record<string, string>))
      .catch(() => toast.error(tErrors("genericError")))
      .finally(() => setLoading(false))
  }, [donationId, tErrors])

  function handlePay() {
    formRef.current?.submit()
  }

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>
  if (!formData) return null

  return (
    <div>
      <form
        ref={formRef}
        method="POST"
        action={formData.checkoutUrl}
        className="hidden"
      >
        {Object.entries(formData)
          .filter(([k]) => k !== "checkoutUrl")
          .map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
      </form>
      <Button
        onClick={handlePay}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {t("payNow")}
      </Button>
    </div>
  )
}
