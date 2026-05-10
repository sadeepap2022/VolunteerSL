"use client"

import { SessionProvider } from "next-auth/react"
import { NextIntlClientProvider } from "next-intl"

interface Props {
  children: React.ReactNode
  locale: string
  messages: Record<string, unknown>
}

export function Providers({ children, locale, messages }: Props) {
  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </SessionProvider>
  )
}
