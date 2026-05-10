"use server"

import { prisma } from "@/lib/prisma"

export async function provisionUser(params: {
  sub: string
  name: string
  email: string
  phone?: string
}) {
  return prisma.user.upsert({
    where: { id: params.sub },
    update: { name: params.name, email: params.email },
    create: {
      id: params.sub,
      name: params.name,
      email: params.email,
      role: "DONOR",
    },
  })
}
