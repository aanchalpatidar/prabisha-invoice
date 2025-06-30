"use client"

import React from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { CurrencySwitcher } from "@/components/currency-switcher"
import { CompanyLogo } from "@/components/company-logo"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { X, Menu, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UserNav } from "@/components/user-nav"

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  
  // Check if current page is public (landing, auth pages)
  const isPublicPage = pathname === "/" || pathname.startsWith("/auth");
  
  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };
  
  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <div className="flex flex-1 items-center gap-4">
            <CompanyLogo />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session?.user && <UserNav user={session.user} />}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 