import { getTranslations } from "next-intl/server"
import { getHospitals } from "@/server/actions/hospital.actions"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { HospitalToggle } from "@/components/admin/HospitalToggle"
import type { Hospital } from "@prisma/client"

export default async function AdminHospitalsPage() {
  const t = await getTranslations("admin")
  const hospitals = await getHospitals()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("hospitals")}</h1>
        <Link href="/admin/hospitals/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            {t("addHospital")}
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {[t("hospitalName"), t("hospitalLocation"), t("hospitalActive"), ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {(hospitals as Hospital[]).map((h) => (
              <tr key={h.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{h.name}</td>
                <td className="px-4 py-3 text-gray-600">{h.location}</td>
                <td className="px-4 py-3">
                  <HospitalToggle id={h.id} isActive={h.isActive} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/hospitals/${h.id}`}>
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
