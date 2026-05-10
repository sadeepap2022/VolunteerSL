"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { generateReference } from "@/lib/reference"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns"
import type { Prisma } from "@prisma/client"

const CreateDonationSchema = z.object({
  hospitalId: z.string().min(1),
  mealTimeId: z.string().min(1),
  donationDate: z.string().date(),
})

export type CreateDonationInput = z.infer<typeof CreateDonationSchema>

export async function createDonation(input: CreateDonationInput) {
  const session = await requireAuth()

  const parsed = CreateDonationSchema.safeParse(input)
  if (!parsed.success) {
    return { error: "INVALID_INPUT" as const }
  }

  const { hospitalId, mealTimeId, donationDate } = parsed.data
  const ref = generateReference()

  try {
    const donation = await prisma.donation.create({
      data: {
        referenceNumber: ref,
        userId: session.user.id,
        hospitalId,
        mealTimeId,
        donationDate: new Date(donationDate),
        status: "PENDING",
      },
    })

    await createAuditLog({
      action: "DONATION_CREATED",
      actorId: session.user.id,
      targetEntity: "Donation",
      targetId: donation.id,
      details: { referenceNumber: ref, hospitalId, mealTimeId, donationDate },
    })

    return { donation }
  } catch (e) {
    const err = e as Prisma.PrismaClientKnownRequestError
    if (err.code === "P2002") {
      return { error: "SLOT_TAKEN" as const }
    }
    throw e
  }
}

export async function getAvailabilityForMonth(
  hospitalId: string,
  year: number,
  month: number
) {
  const start = startOfMonth(new Date(year, month - 1))
  const end = endOfMonth(new Date(year, month - 1))

  const donations = await prisma.donation.findMany({
    where: {
      hospitalId,
      donationDate: { gte: start, lte: end },
      status: { not: "REJECTED" },
    },
    select: {
      donationDate: true,
      mealTimeId: true,
      status: true,
    },
  })

  return donations
}

export async function getAvailabilityForDate(
  hospitalId: string,
  date: string
) {
  const d = new Date(date)
  const donations = await prisma.donation.findMany({
    where: {
      hospitalId,
      donationDate: { gte: startOfDay(d), lte: endOfDay(d) },
      status: { not: "REJECTED" },
    },
    select: { mealTimeId: true },
  })

  return donations.map((d) => d.mealTimeId)
}

export async function getUserDonations(userId: string) {
  return prisma.donation.findMany({
    where: { userId },
    include: {
      hospital: { select: { name: true } },
      mealTime: { select: { name: true, timeString: true } },
      payment: { select: { method: true, paymentStatus: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAllDonations() {
  return prisma.donation.findMany({
    include: {
      hospital: { select: { name: true } },
      mealTime: { select: { name: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  })
}
