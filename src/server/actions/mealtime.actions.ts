"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const MealTimeSchema = z.object({
  name: z.string().min(1),
  timeString: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean().default(true),
})

export async function getMealTimes(activeOnly = false) {
  return prisma.mealTime.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { timeString: "asc" },
  })
}

export async function getMealTime(id: string) {
  return prisma.mealTime.findUnique({ where: { id } })
}

export async function createMealTime(input: z.infer<typeof MealTimeSchema>) {
  const session = await requireAdmin()
  const parsed = MealTimeSchema.parse(input)

  const mealTime = await prisma.mealTime.create({ data: parsed })

  await createAuditLog({
    action: "MEALTIME_CREATED",
    actorId: session.user.id,
    targetEntity: "MealTime",
    targetId: mealTime.id,
    details: { name: mealTime.name, timeString: mealTime.timeString },
  })

  revalidatePath("/[locale]/admin/mealtimes", "page")
  return { mealTime }
}

export async function updateMealTime(
  id: string,
  input: z.infer<typeof MealTimeSchema>
) {
  const session = await requireAdmin()
  const parsed = MealTimeSchema.parse(input)

  const mealTime = await prisma.mealTime.update({ where: { id }, data: parsed })

  await createAuditLog({
    action: "MEALTIME_UPDATED",
    actorId: session.user.id,
    targetEntity: "MealTime",
    targetId: id,
    details: { name: mealTime.name, isActive: mealTime.isActive },
  })

  revalidatePath("/[locale]/admin/mealtimes", "page")
  return { mealTime }
}
