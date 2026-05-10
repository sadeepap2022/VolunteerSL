import { getHospital } from "@/server/actions/hospital.actions"
import { HospitalForm } from "@/components/admin/HospitalForm"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

export default async function AdminHospitalEditPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id } = await params
  const t = await getTranslations("admin")

  const isNew = id === "new"
  const hospital = isNew ? null : await getHospital(id)

  if (!isNew && !hospital) notFound()

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {isNew ? t("addHospital") : t("editHospital")}
      </h1>
      <div className="rounded-xl border bg-white p-6">
        <HospitalForm hospital={hospital} />
      </div>
    </div>
  )
}
