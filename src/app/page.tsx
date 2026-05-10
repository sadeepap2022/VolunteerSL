import { redirect } from "next/navigation"

// next-intl middleware handles locale detection and redirect.
// This page is a fallback for direct visits to `/`.
export default function RootPage() {
  redirect("/en")
}
