import { getTranslations } from "next-intl/server"
import { getAuditLogs } from "@/server/actions/admin.actions"
import { format } from "date-fns"
import type { AuditLog } from "@prisma/client"

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page = pageStr ? parseInt(pageStr) : 1

  const t = await getTranslations("admin")
  const { logs, total, pageSize } = await getAuditLogs(page)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("audit")}</h1>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {[
                t("auditTimestamp"),
                t("auditAction"),
                t("auditActor"),
                t("auditEntity"),
                t("auditTarget"),
                t("auditDetails"),
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {(logs as AuditLog[]).map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                  {format(new Date(log.createdAt), "PP HH:mm")}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 max-w-[100px] truncate">
                  {log.actorId}
                </td>
                <td className="px-4 py-3 text-gray-600">{log.targetEntity}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 max-w-[100px] truncate">
                  {log.targetId}
                </td>
                <td className="px-4 py-3">
                  <details>
                    <summary className="cursor-pointer text-xs text-gray-500">
                      View
                    </summary>
                    <pre className="mt-1 max-w-xs overflow-auto rounded bg-gray-50 p-2 text-xs text-gray-700">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <p>
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={`?page=${page - 1}`} className="rounded border px-3 py-1 hover:bg-gray-50">
                Previous
              </a>
            )}
            {page < totalPages && (
              <a href={`?page=${page + 1}`} className="rounded border px-3 py-1 hover:bg-gray-50">
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
