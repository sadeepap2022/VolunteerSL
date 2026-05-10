"use client"

import { useState } from "react"
import { toggleHospitalActive } from "@/server/actions/hospital.actions"
import { toast } from "sonner"

interface Props {
  id: string
  isActive: boolean
}

export function HospitalToggle({ id, isActive: initial }: Props) {
  const [isActive, setIsActive] = useState(initial)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      await toggleHospitalActive(id, !isActive)
      setIsActive(!isActive)
    } catch {
      toast.error("Failed to update status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        isActive
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  )
}
