import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "VolunteerSL — Sponsor a Hospital Meal",
  description:
    "Support patients at Sri Lankan government hospitals by donating a meal.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
