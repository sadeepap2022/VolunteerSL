import { PrismaClient } from "@prisma/client"
import { fieldEncryptionExtension } from "prisma-field-encryption"

function makeExtendedClient() {
  const client = new PrismaClient()
  return client.$extends(
    fieldEncryptionExtension({
      encryptionKey: process.env.PRISMA_FIELD_ENCRYPTION_KEY!,
    })
  )
}

type ExtendedPrismaClient = ReturnType<typeof makeExtendedClient>

const globalForPrisma = global as unknown as { prisma: ExtendedPrismaClient }

export const prisma = globalForPrisma.prisma ?? makeExtendedClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
