"use client"

import React from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { CurrencySwitcher } from "@/components/currency-switcher"
import { usePathname } from "next/navigation"
import { X, Menu } from "lucide-react"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const isLanding = pathname === "/";
  return (
    <>
      {!isLanding && (
        <header className="flex justify-between items-center p-4 border-b">
          <button
            className="md:hidden p-2 rounded bg-primary text-white mr-2"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-xl font-bold">Invoice Generator</h1>
          <div className="flex items-center gap-4">
            <CurrencySwitcher />
            <ThemeToggle />
          </div>
        </header>
      )}
      <div className="flex min-h-screen">
        {!isLanding && (
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        )}
        <div className={isLanding ? "w-full" : sidebarOpen ? "flex-1 md:ml-64" : "flex-1"}>
          <main className={isLanding ? "p-0" : "p-4 md:p-8"}>
            {children}
          </main>
        </div>
      </div>
    </>
  )
} 