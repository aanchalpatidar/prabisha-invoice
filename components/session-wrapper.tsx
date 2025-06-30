"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { CurrencyProvider } from "@/contexts/currency-context"
import { AppShell } from "@/components/app-shell"
import { Toaster } from "@/components/ui/sonner"
import { usePathname } from "next/navigation"
import { SystemSettingsProvider } from "@/contexts/system-settings-context"

export default function SessionWrapper({ session, children }: { session: any, children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if this is a public page (landing or auth pages)
  const isPublicPage = pathname === "/" || pathname.startsWith("/auth");
  
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SystemSettingsProvider>
          <CurrencyProvider>
            {isPublicPage ? children : <AppShell>{children}</AppShell>}
            <Toaster />
          </CurrencyProvider>
        </SystemSettingsProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 