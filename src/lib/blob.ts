import { put, del } from "@vercel/blob"

export async function uploadReceipt(
  file: File,
  userId: string
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin"
  const blob = await put(`receipts/${userId}/${Date.now()}.${ext}`, file, {
    access: "private",
  })
  return blob.url
}

export async function deleteBlob(url: string): Promise<void> {
  await del(url)
}
