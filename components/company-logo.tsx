"use client"

import { useState, useEffect } from "react"
import { Building } from "lucide-react"

interface Company {
  id: string
  name: string
  logoUrl?: string
}

export function CompanyLogo({ className = "" }: { className?: string }) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch("/api/company")
        if (response.ok) {
          const data = await response.json()
          setCompany(data)
        }
      } catch (error) {
        console.error("Failed to fetch company:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-32 rounded"></div>
      </div>
    )
  }

  if (company?.logoUrl) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src={company.logoUrl}
          alt={company.name}
          className="h-8 max-w-32 object-contain"
        />
      </div>
    )
  }

  if (company?.name) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <h1 className="text-xl font-bold text-primary">{company.name}</h1>
      </div>
    )
  }

  // Fallback to default text
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-2">
        <Building className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-primary">Invoice Generator</h1>
      </div>
    </div>
  )
} 