"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MealSlotBadge } from "./MealSlotBadge"
import { cn } from "@/lib/utils"

interface MealTime {
  id: string
  name: string
}

interface BookedSlot {
  donationDate: Date
  mealTimeId: string
}

interface Props {
  mealTimes: MealTime[]
  initialSlots: BookedSlot[]
  onMonthChange?: (year: number, month: number) => Promise<BookedSlot[]>
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function AvailabilityCalendar({
  mealTimes,
  initialSlots,
  onMonthChange,
}: Props) {
  const t = useTranslations("calendar")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [slots, setSlots] = useState<BookedSlot[]>(initialSlots)
  const [loading, setLoading] = useState(false)

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  const firstDayOfWeek = getDay(startOfMonth(currentDate))

  function isBooked(date: Date, mealTimeId: string) {
    return slots.some(
      (s) =>
        format(new Date(s.donationDate), "yyyy-MM-dd") ===
          format(date, "yyyy-MM-dd") && s.mealTimeId === mealTimeId
    )
  }

  async function navigate(direction: "prev" | "next") {
    const newDate =
      direction === "prev"
        ? subMonths(currentDate, 1)
        : addMonths(currentDate, 1)
    setCurrentDate(newDate)

    if (onMonthChange) {
      setLoading(true)
      try {
        const newSlots = await onMonthChange(
          newDate.getFullYear(),
          newDate.getMonth() + 1
        )
        setSlots(newSlots)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("prev")}
            disabled={loading}
            aria-label={t("previousMonth")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("next")}
            disabled={loading}
            aria-label={t("nextMonth")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-gray-500"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={cn("grid grid-cols-7", loading && "opacity-50")}>
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="border-r border-b p-2" />
        ))}

        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "min-h-24 border-r border-b p-2",
              !isSameMonth(day, currentDate) && "bg-gray-50"
            )}
          >
            <span className="mb-1 block text-xs font-medium text-gray-700">
              {format(day, "d")}
            </span>
            <div className="flex flex-col gap-1">
              {mealTimes.map((mt) => (
                <MealSlotBadge
                  key={mt.id}
                  mealName={mt.name}
                  isBooked={isBooked(day, mt.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 border-t px-6 py-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="h-3 w-3 rounded-sm bg-emerald-100 border border-emerald-300" />
          {t("available")}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="h-3 w-3 rounded-sm bg-gray-100 border border-gray-300" />
          {t("donated")}
        </div>
      </div>
    </div>
  )
}
