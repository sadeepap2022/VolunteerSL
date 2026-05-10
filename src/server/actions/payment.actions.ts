"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { createAuditLog } from "@/lib/audit"
import { buildPayhereHash, getPayhereCheckoutUrl } from "@/lib/payhere"
import { MEAL_AMOUNT_LKR, PAYHERE_CURRENCY } from "@/lib/constants"
import { z } from "zod"

const OfflinePaymentSchema = z.object({
  donationId: z.string().min(1),
  bankReference: z.string().min(1),
  receiptUrl: z.string().url(),
})

export async function submitOfflinePayment(
  input: z.infer<typeof OfflinePaymentSchema>
) {
  const session = await requireAuth()
  const parsed = OfflinePaymentSchema.safeParse(input)
  if (!parsed.success) return { error: "INVALID_INPUT" }

  const { donationId, bankReference, receiptUrl } = parsed.data

  const donation = await prisma.donation.findUnique({
    where: { id: donationId, userId: session.user.id },
  })
  if (!donation) return { error: "NOT_FOUND" }

  const payment = await prisma.payment.create({
    data: {
      donationId,
      method: "OFFLINE",
      amount: parseFloat(MEAL_AMOUNT_LKR),
      receiptUrl,
      paymentStatus: "PENDING",
      payhereReference: bankReference,
    },
  })

  await createAuditLog({
    action: "OFFLINE_PAYMENT_SUBMITTED",
    actorId: session.user.id,
    targetEntity: "Payment",
    targetId: payment.id,
    details: { donationId, bankReference },
  })

  return { payment }
}

export async function getPayhereFormData(donationId: string) {
  const session = await requireAuth()

  const donation = await prisma.donation.findUnique({
    where: { id: donationId, userId: session.user.id },
  })
  if (!donation) throw new Error("NOT_FOUND")

  // Create a pending payment record if not exists
  let payment = await prisma.payment.findUnique({ where: { donationId } })
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        donationId,
        method: "ONLINE",
        amount: parseFloat(MEAL_AMOUNT_LKR),
        paymentStatus: "PENDING",
      },
    })
  }

  const merchantId = process.env.PAYHERE_MERCHANT_ID!
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const hash = buildPayhereHash({
    merchantId,
    orderId: donation.referenceNumber,
    amount: MEAL_AMOUNT_LKR,
    currency: PAYHERE_CURRENCY,
    merchantSecret,
  })

  return {
    checkoutUrl: getPayhereCheckoutUrl(),
    merchantId,
    returnUrl: `${appUrl}/en/donate/success?ref=${donation.referenceNumber}`,
    cancelUrl: `${appUrl}/en/donate`,
    notifyUrl: `${appUrl}/api/payhere/notify`,
    orderId: donation.referenceNumber,
    items: "Hospital Meal Donation",
    amount: MEAL_AMOUNT_LKR,
    currency: PAYHERE_CURRENCY,
    hash,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "Sri Lanka",
    city: "Colombo",
    country: "Sri Lanka",
  }
}
