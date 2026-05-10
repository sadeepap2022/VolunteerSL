import { customAlphabet } from "nanoid"

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const nanoid5 = customAlphabet(alphabet, 5)

export function generateReference(): string {
  const year = new Date().getFullYear()
  return `VSL-${year}-${nanoid5()}`
}
