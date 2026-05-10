import { getMealTime } from "@/server/actions/mealtime.actions"
import { MealTimeForm } from "@/components/admin/MealTimeForm"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

export default async function AdminMealTimeEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getTranslations("admin")

  const isNew = id === "new"
  const mealTime = isNew ? null : await getMealTime(id)

  if (!isNew && !mealTime) notFound()

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {isNew ? t("addMealTime") : t("editMealTime")}
      </h1>
      <div className="rounded-xl border bg-white p-6">
        <MealTimeForm mealTime={mealTime} />
      </div>
    </div>
  )
}
