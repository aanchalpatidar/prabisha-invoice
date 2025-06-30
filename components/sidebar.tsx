"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  Home, 
  FileText, 
  FileCheck, 
  Users, 
  Settings, 
  Mail, 
  CreditCard,
  Building,
  BarChart,
  Menu,
  X,
  Shield,
  UserPlus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CompanyLogo } from "@/components/company-logo"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "🏠",
    },
    {
      title: "Invoices",
      href: "/invoices",
      icon: "📄",
    },
    {
      title: "Quotations",
      href: "/quotations",
      icon: "📋",
    },
    {
      title: "Customers",
      href: "/customers",
      icon: "👥",
    },
    {
      title: "Reports",
      href: "/reports",
      icon: "📊",
    },
    {
      title: "Help",
      href: "/help",
      icon: "❓",
    },
  ]

  const adminNavigation = [
    {
      title: "Users",
      href: "/admin/users",
      icon: "👤",
    },
    {
      title: "Roles",
      href: "/admin/roles",
      icon: "🔐",
    },
    {
      title: "System Settings",
      href: "/admin/system-settings",
      icon: "⚙️",
    },
  ]

  // Check if user is admin
  const isAdmin = session?.user?.role?.name === 'ADMIN'

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pl-1 pr-0">
          <MobileSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:block", className)}>
        <DesktopSidebar />
      </div>
    </>
  )

  function MobileSidebar() {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <CompanyLogo />
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Main
              </h2>
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href
                        ? "bg-primary-custom text-primary-foreground-custom"
                        : "transparent"
                    )}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            {isAdmin && (
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  Admin
                </h2>
                <div className="space-y-1">
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href
                          ? "bg-primary-custom text-primary-foreground-custom"
                          : "transparent"
                      )}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  function DesktopSidebar() {
    return (
      <div className="flex h-full w-64 flex-col border-r bg-background">
        <div className="flex h-14 items-center border-b px-6">
          <CompanyLogo />
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Main
              </h2>
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href
                        ? "bg-primary-custom text-primary-foreground-custom"
                        : "transparent"
                    )}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            {isAdmin && (
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  Admin
                </h2>
                <div className="space-y-1">
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href
                          ? "bg-primary-custom text-primary-foreground-custom"
                          : "transparent"
                      )}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
}