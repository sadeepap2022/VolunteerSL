import { createHash } from "crypto"

function md5(value: string): string {
  return createHash("md5").update(value).digest("hex")
}

export function buildPayhereHash(params: {
  merchantId: string
  orderId: string
  amount: string
  currency: string
  merchantSecret: string
}): string {
  const secretHash = md5(params.merchantSecret).toUpperCase()
  return md5(
    params.merchantId +
      params.orderId +
      params.amount +
      params.currency +
      secretHash
  ).toUpperCase()
}

export interface PayhereNotifyBody {
  merchant_id: string
  order_id: string
  payment_id: string
  payhere_amount: string
  payhere_currency: string
  status_code: string
  md5sig: string
  method: string
  status_message: string
  custom_1?: string
  custom_2?: string
}

export function verifyPayhereNotification(
  body: PayhereNotifyBody,
  merchantSecret: string
): boolean {
  const localHash = buildPayhereHash({
    merchantId: body.merchant_id,
    orderId: body.order_id,
    amount: body.payhere_amount,
    currency: body.payhere_currency,
    merchantSecret,
  })
  return localHash === body.md5sig
}

export function getPayhereCheckoutUrl(): string {
  return process.env.PAYHERE_SANDBOX === "true"
    ? "https://sandbox.payhere.lk/pay/checkout"
    : "https://www.payhere.lk/pay/checkout"
}
