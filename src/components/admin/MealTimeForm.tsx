"use client"

import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createMealTime, updateMealTime } from "@/server/actions/mealtime.actions"
import { toast } from "sonner"
import { useRouter } from "@/i18n/navigation"

const schema = z.object({
  name: z.string().min(1),
  timeString: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  isActive: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface MealTime {
  id: string
  name: string
  timeString: string
  isActive: boolean
}

export function MealTimeForm({ mealTime }: { mealTime: MealTime | null }) {
  const t = useTranslations("admin")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: mealTime ?? { name: "", timeString: "", isActive: true },
  })

  async function onSubmit(data: FormData) {
    try {
      if (mealTime) {
        await updateMealTime(mealTime.id, data)
      } else {
        await createMealTime(data)
      }
      toast.success("Saved")
      router.push("/admin/mealtimes")
    } catch {
      toast.error("Failed to save")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("mealTimeName")}</Label>
        <Input id="name" {...register("name")} placeholder="Breakfast" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeString">{t("mealTimeString")}</Label>
        <Input id="timeString" {...register("timeString")} placeholder="07:00" />
        {errors.timeString && <p className="text-xs text-red-500">{errors.timeString.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isActive" {...register("isActive")} />
        <Label htmlFor="isActive">{t("mealTimeActive")}</Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
        {isSubmitting ? "..." : t("save")}
      </Button>
    </form>
  )
}
