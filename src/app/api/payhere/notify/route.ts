import { prisma } from "@/lib/prisma"
import { verifyPayhereNotification, type PayhereNotifyBody } from "@/lib/payhere"
import { createAuditLog } from "@/lib/audit"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const formData = await request.formData()
  const body = Object.fromEntries(formData) as unknown as PayhereNotifyBody

  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!

  if (!verifyPayhereNotification(body, merchantSecret)) {
    return new Response("Invalid signature", { status: 400 })
  }

  const orderId = body.order_id
  const statusCode = parseInt(body.status_code, 10)
  const payherePaymentId = body.payment_id

  const donation = await prisma.donation.findUnique({
    where: { referenceNumber: orderId },
    include: { payment: true },
  })

  if (!donation) {
    return new Response("Donation not found", { status: 404 })
  }

  // Idempotency: skip if already processed with same payhereReference
  if (
    donation.payment?.payhereReference &&
    donation.payment.payhereReference === payherePaymentId &&
    donation.payment.paymentStatus !== "PENDING"
  ) {
    return new Response("OK")
  }

  const isSuccess = statusCode === 2
  const paymentStatus = isSuccess ? "VERIFIED" : "FAILED"
  const donationStatus = isSuccess ? "CONFIRMED" : donation.status

  if (donation.payment) {
    await prisma.payment.update({
      where: { donationId: donation.id },
      data: {
        paymentStatus,
        payhereReference: payherePaymentId,
      },
    })
  } else {
    await prisma.payment.create({
      data: {
        donationId: donation.id,
        method: "ONLINE",
        amount: parseFloat(body.payhere_amount),
        paymentStatus,
        payhereReference: payherePaymentId,
      },
    })
  }

  if (isSuccess) {
    await prisma.donation.update({
      where: { id: donation.id },
      data: { status: donationStatus },
    })
  }

  await createAuditLog({
    action: isSuccess ? "PAYHERE_PAYMENT_VERIFIED" : "PAYHERE_PAYMENT_FAILED",
    actorId: donation.userId ?? "system",
    targetEntity: "Donation",
    targetId: donation.id,
    details: {
      referenceNumber: orderId,
      statusCode,
      method: body.method,
    },
  })

  return new Response("OK")
}
