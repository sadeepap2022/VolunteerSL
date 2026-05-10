"use client"

import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createHospital, updateHospital } from "@/server/actions/hospital.actions"
import { toast } from "sonner"
import { useRouter } from "@/i18n/navigation"

const schema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  isActive: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Hospital {
  id: string
  name: string
  location: string
  isActive: boolean
}

interface Props {
  hospital: Hospital | null
}

export function HospitalForm({ hospital }: Props) {
  const t = useTranslations("admin")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: hospital ?? { name: "", location: "", isActive: true },
  })

  async function onSubmit(data: FormData) {
    try {
      if (hospital) {
        await updateHospital(hospital.id, data)
      } else {
        await createHospital(data)
      }
      toast.success("Saved")
      router.push("/admin/hospitals")
    } catch {
      toast.error("Failed to save")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("hospitalName")}</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">{t("hospitalLocation")}</Label>
        <Input id="location" {...register("location")} />
        {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isActive" {...register("isActive")} />
        <Label htmlFor="isActive">{t("hospitalActive")}</Label>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {isSubmitting ? "..." : t("save")}
      </Button>
    </form>
  )
}
