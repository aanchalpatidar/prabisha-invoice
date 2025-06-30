"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CustomerSelector } from "@/components/customer-selector"
import { LineItemsForm, type LineItem } from "@/components/line-items-form"
import { InvoicePreview } from "@/components/invoice-preview"
import { LoadingButton } from "@/components/loading-button"
import { ArrowLeft } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { toast } from "sonner"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  billingAddress: string
  shippingAddress?: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  total: number
  currency: string
  status: string
  notes?: string
  customer: Customer
  lineItems: LineItem[]
}

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { currency } = useCurrency()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [totals, setTotals] = useState({ subtotal: 0, taxAmount: 0, total: 0 })
  const [notes, setNotes] = useState("")

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
        setSelectedCustomer(data.customer)
        setLineItems(data.lineItems)
        setNotes(data.notes || "")
      } else {
        toast.error("Invoice not found")
        router.push("/invoices")
      }
    } catch (error) {
      toast.error("Failed to fetch invoice")
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setStep(2)
  }

  const handleLineItemsSubmit = (items: LineItem[]) => {
    setLineItems(items)
    setStep(3)
  }

  const handleTotalsChange = (subtotal: number, taxAmount: number, total: number) => {
    setTotals({ subtotal, taxAmount, total })
  }

  const handleSaveInvoice = async () => {
    if (!selectedCustomer || !lineItems.length || !invoice) {
      toast.error("Missing required data")
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`/api/invoices/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          currency,
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          total: totals.total,
          notes,
          lineItems,
          status: invoice.status,
        }),
      })

      if (!response.ok) throw new Error("Failed to update invoice")

      toast.success("Invoice updated successfully!")
      router.push(`/invoices/${params.id}`)
    } catch (error) {
      toast.error("Failed to update invoice")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invoice not found</h1>
          <Button onClick={() => router.push("/invoices")}>Back to Invoices</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push(`/invoices/${params.id}`)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoice
        </Button>
        <h1 className="text-3xl font-bold">Edit Invoice - {invoice.invoiceNumber}</h1>
        <p className="text-gray-600 mt-2">Step {step} of 3</p>
      </div>

      <div className="max-w-full mx-auto">
        {step === 1 && (
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            onCustomerSelect={handleCustomerSelect}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customer Selection
            </Button>
            <LineItemsForm
              onSubmit={handleLineItemsSubmit}
              onTotalsChange={handleTotalsChange}
              initialData={lineItems}
            />
          </div>
        )}

        {step === 3 && selectedCustomer && lineItems.length > 0 && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Line Items
              </Button>
            </div>

            <InvoicePreview
              customer={selectedCustomer}
              lineItems={lineItems}
              totals={totals}
              issueDate={new Date(invoice.issueDate)}
              dueDate={new Date(invoice.dueDate)}
              notes={notes}
              onNotesChange={setNotes}
            />

            <div className="flex gap-4">
              <LoadingButton onClick={handleSaveInvoice} loading={saving} className="flex-1">
                Update Invoice
              </LoadingButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
