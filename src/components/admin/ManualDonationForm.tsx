"use client"

import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { adminCreateDonation } from "@/server/actions/admin.actions"
import { toast } from "sonner"
import { useRouter } from "@/i18n/navigation"
import { Controller } from "react-hook-form"
import { MEAL_AMOUNT_LKR } from "@/lib/constants"

const schema = z.object({
  hospitalId: z.string().min(1),
  mealTimeId: z.string().min(1),
  donationDate: z.string().date(),
  donorName: z.string().min(1),
  amount: z.number().positive(),
})

type FormData = z.infer<typeof schema>

interface Props {
  hospitals: { id: string; name: string }[]
  mealTimes: { id: string; name: string; timeString: string }[]
}

export function ManualDonationForm({ hospitals, mealTimes }: Props) {
  const t = useTranslations("admin")
  const tErrors = useTranslations("errors")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: parseFloat(MEAL_AMOUNT_LKR) },
  })

  async function onSubmit(data: FormData) {
    try {
      const result = await adminCreateDonation(data)
      if ("error" in result && result.error === "SLOT_TAKEN") {
        toast.error(tErrors("slotTaken"))
        return
      }
      toast.success("Donation recorded")
      router.push("/admin/donations")
    } catch {
      toast.error(tErrors("genericError"))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>{t("donorNameOverride")}</Label>
        <Input {...register("donorName")} placeholder="Full name" />
        {errors.donorName && <p className="text-xs text-red-500">{errors.donorName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>{t("hospitals")}</Label>
        <Controller
          name="hospitalId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue placeholder="Select hospital" /></SelectTrigger>
              <SelectContent>
                {hospitals.map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("mealtimes")}</Label>
        <Controller
          name="mealTimeId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue placeholder="Select meal time" /></SelectTrigger>
              <SelectContent>
                {mealTimes.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name} ({m.timeString})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" {...register("donationDate")} />
      </div>

      <div className="space-y-2">
        <Label>{t("amount")} (LKR)</Label>
        <Input
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
        {isSubmitting ? "..." : t("submit")}
      </Button>
    </form>
  )
}
