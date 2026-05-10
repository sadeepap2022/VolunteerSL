export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
        <p className="font-semibold text-emerald-700">VolunteerSL</p>
        <p className="mt-1">
          Connecting generous hearts with patients who need care.
        </p>
        <p className="mt-4">© {new Date().getFullYear()} VolunteerSL. All rights reserved.</p>
      </div>
    </footer>
  )
}
