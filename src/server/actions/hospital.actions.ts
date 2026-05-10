"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const HospitalSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  isActive: z.boolean().default(true),
})

export async function getHospitals(activeOnly = false) {
  return prisma.hospital.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { name: "asc" },
  })
}

export async function getHospital(id: string) {
  return prisma.hospital.findUnique({ where: { id } })
}

export async function createHospital(input: z.infer<typeof HospitalSchema>) {
  const session = await requireAdmin()
  const parsed = HospitalSchema.parse(input)

  const hospital = await prisma.hospital.create({ data: parsed })

  await createAuditLog({
    action: "HOSPITAL_CREATED",
    actorId: session.user.id,
    targetEntity: "Hospital",
    targetId: hospital.id,
    details: { name: hospital.name, location: hospital.location },
  })

  revalidatePath("/[locale]/admin/hospitals", "page")
  return { hospital }
}

export async function updateHospital(
  id: string,
  input: z.infer<typeof HospitalSchema>
) {
  const session = await requireAdmin()
  const parsed = HospitalSchema.parse(input)

  const hospital = await prisma.hospital.update({ where: { id }, data: parsed })

  await createAuditLog({
    action: "HOSPITAL_UPDATED",
    actorId: session.user.id,
    targetEntity: "Hospital",
    targetId: id,
    details: { name: hospital.name, isActive: hospital.isActive },
  })

  revalidatePath("/[locale]/admin/hospitals", "page")
  return { hospital }
}

export async function toggleHospitalActive(id: string, isActive: boolean) {
  const session = await requireAdmin()

  await prisma.hospital.update({ where: { id }, data: { isActive } })

  await createAuditLog({
    action: isActive ? "HOSPITAL_ACTIVATED" : "HOSPITAL_DEACTIVATED",
    actorId: session.user.id,
    targetEntity: "Hospital",
    targetId: id,
    details: { isActive },
  })

  revalidatePath("/[locale]/admin/hospitals", "page")
}
