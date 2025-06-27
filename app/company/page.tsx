"use client"

import { useState, useEffect } from "react"
import { CompanyForm } from "@/components/company-form"
import { EmailTest } from "@/components/email-test"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Mail, Phone, MapPin, BadgePercent } from "lucide-react"

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
  const [editing, setEditing] = useState(false)

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
      <div className="mb-8 flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Company Setup</h1>
          <p className="text-gray-600 mt-1">Configure your company details and email settings</p>
        </div>
      </div>
      <div className="max-w-4xl">
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList>
            <TabsTrigger value="company">Company Details</TabsTrigger>
            <TabsTrigger value="email">Email Configuration</TabsTrigger>
          </TabsList>
          <TabsContent value="company">
            {company && !editing ? (
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Company Details
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    {company.logoUrl && (
                      <img src={company.logoUrl} alt="Logo" className="h-16 w-16 rounded object-contain border" style={{ maxWidth: 64 }} />
                    )}
                    <div>
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {company.name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" /> {company.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" /> {company.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="whitespace-pre-line">{company.address}</span>
                  </div>
                  {company.taxNumber && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BadgePercent className="h-4 w-4" /> Tax ID: {company.taxNumber}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <CompanyForm initialData={company || undefined} onSubmit={async (data) => { await handleSubmit(data); setEditing(false); }} />
            )}
          </TabsContent>
          <TabsContent value="email">
            <EmailTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
