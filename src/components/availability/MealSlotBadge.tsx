import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Props {
  mealName: string
  isBooked: boolean
}

export function MealSlotBadge({ mealName, isBooked }: Props) {
  const t = useTranslations("calendar")

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="truncate text-gray-700">{mealName}</span>
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
    </div>
  )
}
