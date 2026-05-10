import { getTranslations } from "next-intl/server"
import { getMealTimes } from "@/server/actions/mealtime.actions"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import type { MealTime } from "@prisma/client"

export default async function AdminMealTimesPage() {
  const t = await getTranslations("admin")
  const mealTimes = await getMealTimes()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("mealtimes")}</h1>
        <Link href="/admin/mealtimes/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            {t("addMealTime")}
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {[t("mealTimeName"), t("mealTimeString"), t("mealTimeActive"), ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {(mealTimes as MealTime[]).map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3 font-mono text-gray-600">{m.timeString}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    m.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {m.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/mealtimes/${m.id}`}>
                    <Button variant="outline" size="sm">{t("edit")}</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
