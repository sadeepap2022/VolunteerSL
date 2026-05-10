export const SUPPORTED_LOCALES = ["en", "si", "ta"] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = "en"

export const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
export const ALLOWED_RECEIPT_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

export const PAYHERE_CURRENCY = "LKR"
export const MEAL_AMOUNT_LKR = "5000.00" // default donation amount per meal
