"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitOfflinePayment } from "@/server/actions/payment.actions"
import { toast } from "sonner"

interface Props {
  donationId: string
  onComplete: () => void
}

export function OfflinePaymentForm({ donationId, onComplete }: Props) {
  const t = useTranslations("donate")
  const tErrors = useTranslations("errors")
  const [bankRef, setBankRef] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bankRef || !file) return

    setLoading(true)
    try {
      // Upload file first
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) {
        toast.error(tErrors(uploadData.error ?? "genericError"))
        return
      }

      // Submit payment
      const result = await submitOfflinePayment({
        donationId,
        bankReference: bankRef,
        receiptUrl: uploadData.url,
      })

      if ("error" in result) {
        toast.error(tErrors("genericError"))
        return
      }

      onComplete()
    } catch {
      toast.error(tErrors("genericError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bankRef">{t("offlineBankRef")}</Label>
        <Input
          id="bankRef"
          value={bankRef}
          onChange={(e) => setBankRef(e.target.value)}
          placeholder={t("offlineBankRefPlaceholder")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="receipt">{t("offlineReceipt")}</Label>
        <Input
          id="receipt"
          type="file"
          ref={fileRef}
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
        <p className="text-xs text-gray-500">{t("offlineReceiptHint")}</p>
      </div>

      <Button
        type="submit"
        disabled={loading || !bankRef || !file}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {loading ? "..." : t("submitOffline")}
      </Button>
    </form>
  )
}
