"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CustomerSelector } from "@/components/customer-selector"
import { LineItemsForm, type LineItem } from "@/components/line-items-form"
import { QuotationPreview } from "@/components/quotation-preview"
import { LoadingButton } from "@/components/loading-button"
import { ArrowLeft } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { toast } from "sonner"

interface Customer {
  id?: string
  name: string
  email: string
  phone?: string
  billingAddress: string
  shippingAddress?: string
}

interface QuotationData {
  customer: Customer
  lineItems: LineItem[]
  issueDate: Date
  validUntil: Date
  notes?: string
}

export default function CreateQuotationPage() {
  const router = useRouter()
  const { currency } = useCurrency()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [quotationData, setQuotationData] = useState<Partial<QuotationData>>({
    issueDate: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  })
  const [totals, setTotals] = useState({ subtotal: 0, taxAmount: 0, total: 0 })

  const handleCustomerSubmit = async (customerData: Customer) => {
    try {
      let customer = customerData

      if (!customer.id) {
        const response = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerData),
        })

        if (!response.ok) throw new Error("Failed to create customer")
        customer = await response.json()
      }

      setQuotationData((prev) => ({ ...prev, customer }))
      setStep(2)
    } catch (error) {
      toast.error("Failed to save customer details")
    }
  }

  const handleLineItemsSubmit = (lineItems: LineItem[]) => {
    setQuotationData((prev) => ({ ...prev, lineItems }))
    setStep(3)
  }

  const handleTotalsChange = (subtotal: number, taxAmount: number, total: number) => {
    setTotals({ subtotal, taxAmount, total })
  }

  const handleCreateQuotation = async () => {
    if (!quotationData.customer || !quotationData.lineItems) {
      toast.error("Missing required data")
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: quotationData.customer.id,
          issueDate: quotationData.issueDate,
          validUntil: quotationData.validUntil,
          currency,
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          total: totals.total,
          notes: quotationData.notes,
          lineItems: quotationData.lineItems,
        }),
      })

      if (!response.ok) throw new Error("Failed to create quotation")

      const quotation = await response.json()
      toast.success("Quotation created successfully!")
      router.push(`/quotations/${quotation.id}`)
    } catch (error) {
      toast.error("Failed to create quotation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create Quotation</h1>
        <p className="text-gray-600 mt-2">Step {step} of 3</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {step === 1 && (
          <CustomerSelector
            selectedCustomer={quotationData.customer}
            onCustomerSelect={handleCustomerSubmit}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customer Details
            </Button>
            <LineItemsForm
              onSubmit={handleLineItemsSubmit}
              onTotalsChange={handleTotalsChange}
              initialData={quotationData.lineItems}
            />
          </div>
        )}

        {step === 3 && quotationData.customer && quotationData.lineItems && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Line Items
              </Button>
            </div>

            <QuotationPreview
              customer={quotationData.customer}
              lineItems={quotationData.lineItems}
              totals={totals}
              issueDate={quotationData.issueDate!}
              validUntil={quotationData.validUntil!}
              notes={quotationData.notes}
              onNotesChange={(notes) => setQuotationData((prev) => ({ ...prev, notes }))}
            />

            <div className="flex gap-4">
              <LoadingButton onClick={handleCreateQuotation} loading={loading} className="flex-1">
                Create Quotation
              </LoadingButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
