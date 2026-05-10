"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { verifyOfflinePayment, rejectOfflinePayment } from "@/server/actions/admin.actions"
import { toast } from "sonner"

interface Props {
  paymentId: string
}

export function VerificationActions({ paymentId }: Props) {
  const t = useTranslations("admin")
  const [loading, setLoading] = useState<"verify" | "reject" | null>(null)
  const [done, setDone] = useState(false)

  async function handleVerify() {
    if (!confirm(t("confirmVerify"))) return
    setLoading("verify")
    try {
      await verifyOfflinePayment(paymentId)
      toast.success("Payment verified")
      setDone(true)
    } catch {
      toast.error("Failed")
    } finally {
      setLoading(null)
    }
  }

  async function handleReject() {
    if (!confirm(t("confirmReject"))) return
    setLoading("reject")
    try {
      await rejectOfflinePayment(paymentId)
      toast.success("Payment rejected")
      setDone(true)
    } catch {
      toast.error("Failed")
    } finally {
      setLoading(null)
    }
  }

  if (done) {
    return <p className="text-sm text-gray-500">Processed.</p>
  }

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleVerify}
        disabled={!!loading}
        className="bg-emerald-600 hover:bg-emerald-700"
        size="sm"
      >
        {loading === "verify" ? "..." : t("verifyPayment")}
      </Button>
      <Button
        onClick={handleReject}
        disabled={!!loading}
        variant="outline"
        size="sm"
        className="border-red-300 text-red-600 hover:bg-red-50"
      >
        {loading === "reject" ? "..." : t("rejectPayment")}
      </Button>
    </div>
  )
}
