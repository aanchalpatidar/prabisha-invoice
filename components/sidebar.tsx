"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  X
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Quotations", href: "/quotations", icon: FileCheck },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Company", href: "/company", icon: Building },
    { name: "Reports", href: "/reports", icon: BarChart },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={toggleSidebar} 
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-white md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700",
          "w-64 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="flex items-center justify-center mb-5 p-2">
            <h1 className="text-xl font-bold text-primary">Invoice Generator</h1>
          </div>
          <ul className="space-y-2 font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex items-center p-3 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700",
                      isActive ? "bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90" : "text-gray-900 dark:text-white"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition duration-75",
                      isActive ? "text-white" : "text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                    )} />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href="/help"
              className="flex items-center p-3 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              onClick={() => setIsOpen(false)}
            >
              <Mail className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Help & Support</span>
            </Link>
            <Link 
              href="/billing"
              className="flex items-center p-3 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              onClick={() => setIsOpen(false)}
            >
              <CreditCard className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Billing</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}