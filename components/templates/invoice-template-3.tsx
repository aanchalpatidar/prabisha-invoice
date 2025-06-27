"use client"

import { useCurrency } from "@/contexts/currency-context"
import { formatDate } from "@/lib/utils"

interface InvoiceTemplate3Props {
  data: any
  type: "invoice" | "quotation"
}

export function InvoiceTemplate3({ data, type }: InvoiceTemplate3Props) {
  const { formatCurrency } = useCurrency()
  const primaryColor = data.company?.primaryColor || '#1e40af'
  const secondaryColor = data.company?.secondaryColor || '#ea580c'

  return (
    <div
      className="bg-white text-black"
      style={{ fontFamily: "Arial, sans-serif", fontSize: "14px", lineHeight: "1.4" }}
    >
      {/* Modern Header with Accent Color */}
      <div className="border-l-8 pl-6 py-6 mb-8" style={{ borderLeftColor: primaryColor }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>{type === "invoice" ? "INVOICE" : "QUOTATION"}</h1>
            <p className="text-lg font-medium mt-1" style={{ color: secondaryColor }}>
              # {type === "invoice" ? data.invoiceNumber : data.quotationNumber}
            </p>
          </div>
          
          {data.company?.logoUrl && (
            <div>
              <img
                src={data.company.logoUrl || "/placeholder.svg"}
                alt="Company Logo"
                className="h-16 w-auto object-contain"
                style={{ maxHeight: "64px", maxWidth: "180px" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Company and Customer Info in a Modern Grid */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        <div>
          <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">From</h3>
          <div className="space-y-1">
            <p className="font-bold text-lg text-gray-800">{data.company?.name || "Your Company"}</p>
            <p className="text-gray-600">{data.company?.email}</p>
            <p className="text-gray-600">{data.company?.phone}</p>
            <div className="whitespace-pre-line text-gray-600 text-sm mt-1">{data.company?.address}</div>
            {data.company?.taxNumber && <p className="text-gray-600 text-sm mt-1">Tax ID: {data.company.taxNumber}</p>}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">
            {type === "invoice" ? "Bill To" : "Quote For"}
          </h3>
          <div className="space-y-1">
            <p className="font-bold text-lg text-gray-800">{data.customer.name}</p>
            <p className="text-gray-600">{data.customer.email}</p>
            {data.customer.phone && <p className="text-gray-600">{data.customer.phone}</p>}
            <div className="whitespace-pre-line text-gray-600 text-sm mt-1">{data.customer.billingAddress}</div>
          </div>
        </div>
      </div>

      {/* Important Dates and Payment Info */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        <div className="bg-gray-50 p-5 rounded-md">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Important Dates</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">{type === "invoice" ? "Invoice Date" : "Quote Date"}</p>
              <p className="font-medium text-gray-800">{formatDate(new Date(data.issueDate))}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">{type === "invoice" ? "Due Date" : "Valid Until"}</p>
              <p className="font-medium text-gray-800">{formatDate(new Date(type === "invoice" ? data.dueDate : data.validUntil))}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-md">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Payment Details</h3>
          {data.company?.bankName ? (
            <div className="space-y-1 text-sm">
              <div className="grid grid-cols-2 gap-1">
                <p className="text-gray-500">Bank:</p>
                <p className="text-gray-800">{data.company.bankName}</p>
              </div>
              {data.company.bankAccount && (
                <div className="grid grid-cols-2 gap-1">
                  <p className="text-gray-500">Account:</p>
                  <p className="text-gray-800">{data.company.bankAccount}</p>
                </div>
              )}
              {data.company.bankIFSC && (
                <div className="grid grid-cols-2 gap-1">
                  <p className="text-gray-500">IFSC/Sort Code:</p>
                  <p className="text-gray-800">{data.company.bankIFSC}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">Payment details not configured</p>
          )}
        </div>
      </div>

      {/* Line Items Table - Modern Clean Design */}
      <div className="mb-10">
        <h3 className="text-sm uppercase tracking-wider mb-3" style={{ color: primaryColor }}>Items & Services</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium text-sm" style={{ color: primaryColor }}>Description</th>
                <th className="px-4 py-3 text-center font-medium text-sm w-16" style={{ color: primaryColor }}>Qty</th>
                <th className="px-4 py-3 text-right font-medium text-sm w-28" style={{ color: primaryColor }}>Rate</th>
                <th className="px-4 py-3 text-center font-medium text-sm w-16" style={{ color: primaryColor }}>Tax %</th>
                <th className="px-4 py-3 text-right font-medium text-sm w-32" style={{ color: primaryColor }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-2">{item.name}{item.description && <div className="text-xs text-gray-500">{item.description}</div>}</td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-2 text-center">{item.taxRate}%</td>
                  <td className="px-4 py-2 text-right font-semibold" style={{ color: primaryColor }}>{formatCurrency(item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals and Notes in a Modern Layout */}
      <div className="flex flex-col md:flex-row gap-10 mb-10">
        {/* Notes */}
        <div className="flex-1">
          {data.notes ? (
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="whitespace-pre-line text-gray-600">{data.notes}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Thank You</h3>
              <p className="text-gray-600">We appreciate your business and look forward to working with you again.</p>
              {type === "quotation" && (
                <p className="text-gray-600 mt-2">This quotation is valid until {formatDate(new Date(data.validUntil))}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Totals */}
        <div className="w-full md:w-80">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Summary</h3>
          <div className="bg-indigo-50 p-5 rounded-md" style={{ borderColor: primaryColor }}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium" style={{ color: primaryColor }}>{formatCurrency(data.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium" style={{ color: primaryColor }}>{formatCurrency(data.taxAmount)}</span>
              </div>
              <div className="border-t pt-2 mt-2" style={{ borderColor: secondaryColor }}>
                <div className="flex justify-between">
                  <span className="font-bold" style={{ color: secondaryColor }}>Total:</span>
                  <span className="font-bold text-lg" style={{ color: secondaryColor }}>{formatCurrency(data.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-gray-200">
        <p className="font-medium mb-1" style={{ color: primaryColor }}>Thank you for your business!</p>
        <div className="mt-2 text-sm text-gray-500">
          <p>
            For any questions, please contact us at {data.company?.email} or {data.company?.phone}
          </p>
        </div>
      </div>
    </div>
  )
} 