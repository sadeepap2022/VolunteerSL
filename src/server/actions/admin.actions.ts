"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"
import { createAuditLog } from "@/lib/audit"
import { generateReference } from "@/lib/reference"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"

export async function verifyOfflinePayment(paymentId: string) {
  const session = await requireAdmin()

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { donation: true },
  })
  if (!payment) throw new Error("NOT_FOUND")

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { paymentStatus: "VERIFIED" },
    }),
    prisma.donation.update({
      where: { id: payment.donationId },
      data: { status: "CONFIRMED" },
    }),
  ])

  await createAuditLog({
    action: "OFFLINE_PAYMENT_VERIFIED",
    actorId: session.user.id,
    targetEntity: "Payment",
    targetId: paymentId,
    details: { donationId: payment.donationId },
  })

  revalidatePath("/[locale]/admin/verification", "page")
}

export async function rejectOfflinePayment(paymentId: string) {
  const session = await requireAdmin()

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { donation: true },
  })
  if (!payment) throw new Error("NOT_FOUND")

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { paymentStatus: "FAILED" },
    }),
    prisma.donation.update({
      where: { id: payment.donationId },
      data: { status: "REJECTED" },
    }),
  ])

  await createAuditLog({
    action: "OFFLINE_PAYMENT_REJECTED",
    actorId: session.user.id,
    targetEntity: "Payment",
    targetId: paymentId,
    details: { donationId: payment.donationId },
  })

  revalidatePath("/[locale]/admin/verification", "page")
}

const ManualDonationSchema = z.object({
  hospitalId: z.string().min(1),
  mealTimeId: z.string().min(1),
  donationDate: z.string().date(),
  donorName: z.string().min(1),
  amount: z.number().positive(),
})

export async function adminCreateDonation(
  input: z.infer<typeof ManualDonationSchema>
) {
  const session = await requireAdmin()
  const parsed = ManualDonationSchema.parse(input)
  const ref = generateReference()

  try {
    const donation = await prisma.donation.create({
      data: {
        referenceNumber: ref,
        userId: null,
        hospitalId: parsed.hospitalId,
        mealTimeId: parsed.mealTimeId,
        donationDate: new Date(parsed.donationDate),
        status: "CONFIRMED",
        isManualEntry: true,
        donorNameOverride: parsed.donorName,
      },
    })

    await prisma.payment.create({
      data: {
        donationId: donation.id,
        method: "CASH_MANUAL",
        amount: parsed.amount,
        paymentStatus: "VERIFIED",
      },
    })

    await createAuditLog({
      action: "MANUAL_DONATION_CREATED",
      actorId: session.user.id,
      targetEntity: "Donation",
      targetId: donation.id,
      details: {
        referenceNumber: ref,
        hospitalId: parsed.hospitalId,
        mealTimeId: parsed.mealTimeId,
        donationDate: parsed.donationDate,
        donorName: parsed.donorName,
      },
    })

    revalidatePath("/[locale]/admin/donations", "page")
    return { donation }
  } catch (e) {
    const err = e as Prisma.PrismaClientKnownRequestError
    if (err.code === "P2002") {
      return { error: "SLOT_TAKEN" as const }
    }
    throw e
  }
}

export async function getPendingVerifications() {
  return prisma.payment.findMany({
    where: { method: "OFFLINE", paymentStatus: "PENDING" },
    include: {
      donation: {
        include: {
          hospital: { select: { name: true } },
          mealTime: { select: { name: true, timeString: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })
}

export async function getAuditLogs(page = 1, pageSize = 50) {
  const skip = (page - 1) * pageSize
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count(),
  ])
  return { logs, total, page, pageSize }
}
