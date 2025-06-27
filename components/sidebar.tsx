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
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Sidebar({ open = true, setOpen }: { open?: boolean, setOpen?: (open: boolean) => void }) {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Quotations", href: "/quotations", icon: FileCheck },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Company", href: "/company", icon: Building },
    { name: "Reports", href: "/reports", icon: BarChart },
  ]

  // Helper to detect if screen is mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && setOpen) setOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setOpen]);

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setOpen && setOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 font-poppins",
          "w-64 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:-translate-x-64"
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
                      "flex items-center p-3 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200",
                      isActive ? "bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90" : "text-gray-900 dark:text-white"
                    )}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 768 && setOpen) setOpen(false);
                    }}
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
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768 && setOpen) setOpen(false);
              }}
            >
              <Mail className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Help & Support</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}