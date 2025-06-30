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
  return <CompanyForm />;
}
