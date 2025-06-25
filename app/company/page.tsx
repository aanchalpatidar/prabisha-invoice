"use client"

import { useState, useEffect } from "react"
import { CompanyForm } from "@/components/company-form"
import { EmailTest } from "@/components/email-test"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Company {
  id: string
  name: string
  email: string
  phone: string
  address: string
  logoUrl?: string
  bankName?: string
  bankAccount?: string
  bankIFSC?: string
  taxNumber?: string
}

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompany()
  }, [])

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

  const handleSubmit = async (data: any) => {
    const response = await fetch("/api/company", {
      method: company ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to save company")
    }

    const savedCompany = await response.json()
    setCompany(savedCompany)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Company Setup</h1>
        <p className="text-gray-600 mt-2">Configure your company details and email settings</p>
      </div>

      <div className="max-w-4xl">
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList>
            <TabsTrigger value="company">Company Details</TabsTrigger>
            <TabsTrigger value="email">Email Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <CompanyForm initialData={company || undefined} onSubmit={handleSubmit} />
          </TabsContent>

          <TabsContent value="email">
            <EmailTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
