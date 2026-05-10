import { prisma } from "@/lib/prisma"

const PII_KEYS = [
  "name",
  "email",
  "phone",
  "donorNameOverride",
  "first_name",
  "last_name",
]

function scrubPII(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      PII_KEYS.includes(k)
        ? "[REDACTED]"
        : typeof v === "object" && v !== null && !Array.isArray(v)
          ? scrubPII(v as Record<string, unknown>)
          : v,
    ])
  )
}

export async function createAuditLog(params: {
  action: string
  actorId: string
  targetEntity: string
  targetId: string
  details?: Record<string, unknown>
}) {
  await prisma.auditLog.create({
    data: {
      action: params.action,
      actorId: params.actorId,
      targetEntity: params.targetEntity,
      targetId: params.targetId,
      details: params.details ? scrubPII(params.details) : {},
    },
  })
}
