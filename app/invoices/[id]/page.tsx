"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/loading-button"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { PDFPreview } from "@/components/pdf-preview"
import { ArrowLeft, Edit, Send, Trash2, FileText } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

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
  company: {
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
  customer: {
    id: string
    name: string
    email: string
    phone?: string
    billingAddress: string
    shippingAddress?: string
  }
  lineItems: Array<{
    id: string
    name: string
    description?: string
    quantity: number
    price: number
    taxRate: number
    total: number
  }>
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { formatCurrency } = useCurrency()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showPDFPreview, setShowPDFPreview] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
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

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true)
      const response = await fetch(`/api/invoices/${params.id}/send`, {
        method: "POST",
      })
      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
      if (!response.ok) {
        toast.error(data?.message || "Failed to send invoice")
        return;
      }
      toast.success(data?.message || "Invoice sent successfully!")
      fetchInvoice() // Refresh to update status
    } catch (error) {
      toast.error("Failed to send invoice")
    } finally {
      setSendingEmail(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete invoice")

      toast.success("Invoice deleted successfully")
      router.push("/invoices")
    } catch (error) {
      toast.error("Failed to delete invoice")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "SENT":
        return "bg-blue-100 text-blue-800"
      case "OVERDUE":
        return "bg-red-100 text-red-800"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
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
        <Button variant="ghost" onClick={() => router.push("/invoices")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">Due: {formatDate(new Date(invoice.dueDate))}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPDFPreview(true)}>
              <FileText className="h-4 w-4 mr-2" />
              PDF Preview
            </Button>
            <Button variant="outline" onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <LoadingButton variant="outline" onClick={handleSendEmail} loading={sendingEmail}>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </LoadingButton>
            <Button variant="outline" onClick={() => setDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Issue Date</p>
                  <p className="font-medium">{formatDate(new Date(invoice.issueDate))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">{formatDate(new Date(invoice.dueDate))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Currency</p>
                  <p className="font-medium">{invoice.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                </div>
              </div>
              {invoice.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="font-medium">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {invoice.lineItems.map((item) => (
                      <tr key={item.id} className="border-b">
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
            </CardContent>
          </Card>
        </div>

        {/* Customer & Totals */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{invoice.customer.name}</p>
                <p className="text-sm text-gray-600">{invoice.customer.email}</p>
                {invoice.customer.phone && <p className="text-sm text-gray-600">{invoice.customer.phone}</p>}
                <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.customer.billingAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPDFPreview && (
        <PDFPreview
          type="invoice"
          data={invoice}
          onClose={() => setShowPDFPreview(false)}
          onDownload={() => {
            // Handle PDF download
            toast.success("PDF downloaded successfully")
          }}
        />
      )}

      <ConfirmationDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
