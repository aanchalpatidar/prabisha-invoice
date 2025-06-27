import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CurrencyProvider } from "@/contexts/currency-context"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/app-shell"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Prabisha Invoice & Quotation Generator",
  description: "Professional invoice and quotation generator tool",
  generator: 'prabisha.com'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CurrencyProvider>
            <AppShell>{children}</AppShell>
            <Toaster position="top-right" />
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
