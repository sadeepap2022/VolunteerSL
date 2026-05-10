import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  // Vercel Blob requires serverExternalPackages for streaming
  serverExternalPackages: ["@prisma/client", "prisma-field-encryption"],
}

export default withNextIntl(nextConfig)
