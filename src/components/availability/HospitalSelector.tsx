"use client"

import { useTranslations } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Hospital {
  id: string
  name: string
  location: string
}

interface Props {
  hospitals: Hospital[]
  selectedId: string
}

export function HospitalSelector({ hospitals, selectedId }: Props) {
  const t = useTranslations("calendar")
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(value: string | null) {
    if (!value) return
    router.push(`${pathname}?hospitalId=${value}`)
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">
        {t("selectHospital")}
      </label>
      <Select value={selectedId} onValueChange={handleChange}>
        <SelectTrigger className="w-72">
          <SelectValue placeholder={t("selectHospital")} />
        </SelectTrigger>
        <SelectContent>
          {hospitals.map((h) => (
            <SelectItem key={h.id} value={h.id}>
              {h.name} — {h.location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
