"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { format, parseISO } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAvailabilityForDate } from "@/server/actions/donation.actions"
import type { DonationSelections } from "./DonationWizard"

interface InitialValues {
  hospitalId?: string
  mealTimeId?: string
  date?: string
}

interface Props {
  hospitals: { id: string; name: string; location: string }[]
  mealTimes: { id: string; name: string; timeString: string }[]
  onComplete: (data: DonationSelections) => void
  initialValues?: InitialValues
}

export function StepSelectDetails({ hospitals, mealTimes, onComplete, initialValues }: Props) {
  const t = useTranslations("donate")
  const [hospitalId, setHospitalId] = useState(initialValues?.hospitalId ?? "")
  const [date, setDate] = useState<Date | undefined>(
    initialValues?.date ? parseISO(initialValues.date) : undefined
  )
  const [mealTimeId, setMealTimeId] = useState("")
  const [bookedMealTimeIds, setBookedMealTimeIds] = useState<string[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  // Holds the pre-fill mealTimeId; cleared after first successful availability fetch
  const pendingMealTimeId = useRef(initialValues?.mealTimeId)

  useEffect(() => {
    if (!hospitalId || !date) {
      setBookedMealTimeIds([])
      setMealTimeId("")
      return
    }
    setLoadingAvailability(true)
    getAvailabilityForDate(hospitalId, format(date, "yyyy-MM-dd"))
      .then((booked) => {
        setBookedMealTimeIds(booked)
        if (pendingMealTimeId.current && !booked.includes(pendingMealTimeId.current)) {
          setMealTimeId(pendingMealTimeId.current)
        }
        pendingMealTimeId.current = undefined
      })
      .finally(() => setLoadingAvailability(false))
  }, [hospitalId, date])

  const availableMealTimes = mealTimes.filter(
    (mt) => !bookedMealTimeIds.includes(mt.id)
  )

  function handleSubmit() {
    if (!hospitalId || !date || !mealTimeId) return
    const hospital = hospitals.find((h) => h.id === hospitalId)!
    const mealTime = mealTimes.find((m) => m.id === mealTimeId)!
    onComplete({
      hospitalId,
      hospitalName: hospital.name,
      mealTimeId,
      mealTimeName: `${mealTime.name} (${mealTime.timeString})`,
      donationDate: format(date, "yyyy-MM-dd"),
    })
  }

  const canSubmit = !!hospitalId && !!date && !!mealTimeId

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stepDetails")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hospital */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("selectHospital")}</label>
          <Select value={hospitalId} onValueChange={(v) => v && setHospitalId(v)}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectHospitalPlaceholder")} />
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

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("selectDate")}</label>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(d) => d < new Date()}
            className="rounded-md border"
          />
        </div>

        {/* Meal Time */}
        {date && (
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("selectMealTime")}</label>
            {loadingAvailability ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : availableMealTimes.length === 0 ? (
              <p className="text-sm text-amber-600">{t("slotBooked")}</p>
            ) : (
              <Select value={mealTimeId} onValueChange={(v) => v && setMealTimeId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectMealTimePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {availableMealTimes.map((mt) => (
                    <SelectItem key={mt.id} value={mt.id}>
                      {mt.name} ({mt.timeString})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {t("next")}
        </Button>
      </CardContent>
    </Card>
  )
}
