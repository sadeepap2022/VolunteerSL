import { requireAuth } from "@/lib/auth-helpers"
import { uploadReceipt } from "@/lib/blob"
import { MAX_RECEIPT_SIZE_BYTES, ALLOWED_RECEIPT_MIME_TYPES } from "@/lib/constants"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const session = await requireAuth()

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 })
  }

  if (file.size > MAX_RECEIPT_SIZE_BYTES) {
    return Response.json({ error: "fileTooLarge" }, { status: 400 })
  }

  if (!ALLOWED_RECEIPT_MIME_TYPES.includes(file.type)) {
    return Response.json({ error: "invalidFileType" }, { status: 400 })
  }

  const url = await uploadReceipt(file, session.user.id)
  return Response.json({ url })
}
