import { PrismaClient } from "@prisma/client"
import { fieldEncryptionExtension } from "prisma-field-encryption"

function makeExtendedClient() {
  const client = new PrismaClient()
  const key = process.env.PRISMA_FIELD_ENCRYPTION_KEY
  // Skip encryption extension at build time (key absent) — safe because
  // no DB queries run during next build (all data pages are force-dynamic).
  if (!key) return client
  return client.$extends(fieldEncryptionExtension({ encryptionKey: key }))
}

type ExtendedPrismaClient = ReturnType<typeof makeExtendedClient>

const globalForPrisma = global as unknown as { prisma: ExtendedPrismaClient }

export const prisma = globalForPrisma.prisma ?? makeExtendedClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
