"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCurrency } from "@/contexts/currency-context"
import { formatDate } from "@/lib/utils"
import type { LineItem } from "@/components/line-items-form"

interface Customer {
  name: string
  email: string
  phone?: string
  billingAddress: string
  shippingAddress?: string
}

interface Company {
  name: string
  email: string
  phone: string
  address: string
  logoUrl?: string
  taxNumber?: string
}

interface QuotationPreviewProps {
  customer: Customer
  lineItems: LineItem[]
  totals: { subtotal: number; taxAmount: number; total: number }
  issueDate: Date
  validUntil: Date
  notes?: string
  onNotesChange?: (notes: string) => void
}

export function QuotationPreview({
  customer,
  lineItems,
  totals,
  issueDate,
  validUntil,
  notes = "",
  onNotesChange,
}: QuotationPreviewProps) {
  const { formatCurrency } = useCurrency()
  const [company, setCompany] = useState<Company | null>(null)
  const [quotationNumber, setQuotationNumber] = useState("")

  useEffect(() => {
    fetchCompany()
    generateQuotationNumber()
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
    }
  }

  const generateQuotationNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    setQuotationNumber(`QUO-${year}${month}-${random}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quotation Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            {company?.logoUrl && (
              <img
                src={company.logoUrl || "/placeholder.svg"}
                alt="Company Logo"
                className="h-16 w-auto object-contain"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{company?.name || "Your Company"}</h2>
              <p className="text-gray-600">{company?.email}</p>
              <p className="text-gray-600">{company?.phone}</p>
              <p className="text-gray-600 whitespace-pre-line">{company?.address}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-green-600">QUOTATION</h1>
            <p className="text-lg font-semibold">{quotationNumber}</p>
          </div>
        </div>

        <Separator />

        {/* Quotation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Quote For:</h3>
            <div className="space-y-1">
              <p className="font-medium">{customer.name}</p>
              <p className="text-gray-600">{customer.email}</p>
              {customer.phone && <p className="text-gray-600">{customer.phone}</p>}
              <p className="text-gray-600 whitespace-pre-line">{customer.billingAddress}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Quote Date:</span>
              <span>{formatDate(issueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Valid Until:</span>
              <span>{formatDate(validUntil)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Line Items */}
        <div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Rate</th>
                  <th className="text-right py-2">Tax %</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                      </div>
                    </td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">{formatCurrency(item.price)}</td>
                    <td className="text-right py-2">{item.taxRate}%</td>
                    <td className="text-right py-2">{formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(totals.taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes or terms..."
            value={notes}
            onChange={(e) => onNotesChange?.(e.target.value)}
            rows={3}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            This quotation is valid until {formatDate(validUntil)}. Please contact us if you have any questions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
