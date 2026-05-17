"use client"

import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

interface Props {
  mealName: string
  isBooked: boolean
  href?: string
}

export function MealSlotBadge({ mealName, isBooked, href }: Props) {
  const t = useTranslations("calendar")

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "ml-1 shrink-0 text-[10px]",
        isBooked
          ? "border-gray-300 bg-gray-100 text-gray-500"
          : "border-emerald-300 bg-emerald-50 text-emerald-700"
      )}
    >
      {isBooked ? t("donated") : t("available")}
    </Badge>
  )

  const row = (
    <div className="flex items-center justify-between text-xs">
      <span className="truncate text-gray-700">{mealName}</span>
      {badge}
    </div>
  )

  if (!isBooked && href) {
    return (
      <Link
        href={href as never}
        className="block rounded hover:bg-emerald-50 transition-colors -mx-1 px-1"
        title={`Book ${mealName}`}
      >
        {row}
      </Link>
    )
  }

  return row
}
