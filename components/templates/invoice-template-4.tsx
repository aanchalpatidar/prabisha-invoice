"use client"

import { useCurrency } from "@/contexts/currency-context"
import { formatDate } from "@/lib/utils"

interface InvoiceTemplate4Props {
  data: any
  type: "invoice" | "quotation"
}

export function InvoiceTemplate4({ data, type }: InvoiceTemplate4Props) {
  const { formatCurrency } = useCurrency()

  return (
    <div
      className="bg-white text-black"
      style={{ fontFamily: "Arial, sans-serif", fontSize: "14px", lineHeight: "1.4" }}
    >
      {/* Header with Side-by-Side Layout */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Logo and Company Info */}
        <div className="col-span-2 border-r border-gray-200 pr-6">
          <div className="flex items-start">
            {data.company?.logoUrl && (
              <div className="mr-4">
                <img
                  src={data.company.logoUrl || "/placeholder.svg"}
                  alt="Company Logo"
                  className="h-16 w-auto object-contain"
                  style={{ maxHeight: "64px", maxWidth: "120px" }}
                />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">{data.company?.name || "Your Company"}</h2>
              <div className="text-gray-600 text-sm mt-1 space-y-0.5">
                <p>{data.company?.email}</p>
                <p>{data.company?.phone}</p>
                <div className="whitespace-pre-line text-xs">{data.company?.address}</div>
                {data.company?.taxNumber && <p className="text-xs mt-1">Tax ID: {data.company.taxNumber}</p>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Document Type and Number */}
        <div className="text-right">
          <div className="inline-block border-b-2 border-gray-800 pb-1 mb-3">
            <h1 className="text-2xl font-bold text-gray-800">{type === "invoice" ? "INVOICE" : "QUOTATION"}</h1>
          </div>
          <p className="text-lg font-bold text-gray-700 mb-3">
            # {type === "invoice" ? data.invoiceNumber : data.quotationNumber}
          </p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-semibold">{type === "invoice" ? "Issue Date" : "Quote Date"}:</span>{" "}
              {formatDate(new Date(data.issueDate))}
            </p>
            <p>
              <span className="font-semibold">{type === "invoice" ? "Due Date" : "Valid Until"}:</span>{" "}
              {formatDate(new Date(type === "invoice" ? data.dueDate : data.validUntil))}
            </p>
          </div>
        </div>
      </div>

      {/* Bill To and Payment Details in a Horizontal Layout */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-base font-bold mb-2 text-gray-800 border-b border-gray-300 pb-1">
            {type === "invoice" ? "Bill To" : "Quote For"}
          </h3>
          <div className="space-y-1">
            <p className="font-bold text-gray-800">{data.customer.name}</p>
            <p className="text-gray-600 text-sm">{data.customer.email}</p>
            {data.customer.phone && <p className="text-gray-600 text-sm">{data.customer.phone}</p>}
            <div className="whitespace-pre-line text-xs text-gray-500 mt-1">{data.customer.billingAddress}</div>
          </div>
        </div>
        
        <div>
          <h3 className="text-base font-bold mb-2 text-gray-800 border-b border-gray-300 pb-1">Payment Details</h3>
          {data.company?.bankName ? (
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">
                <span className="font-semibold">Bank:</span> {data.company.bankName}
              </p>
              {data.company.bankAccount && (
                <p className="text-gray-600">
                  <span className="font-semibold">Account:</span> {data.company.bankAccount}
                </p>
              )}
              {data.company.bankIFSC && (
                <p className="text-gray-600">
                  <span className="font-semibold">IFSC/Sort Code:</span> {data.company.bankIFSC}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">Payment details not configured</p>
          )}
        </div>
      </div>

      {/* Line Items Table - Compact and Clean */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-800 mb-3 uppercase tracking-wider">Items & Services</h3>
        <div className="overflow-hidden rounded border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Description</th>
                <th className="px-3 py-2 text-center font-semibold text-gray-700 text-xs uppercase tracking-wider w-16">Qty</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700 text-xs uppercase tracking-wider w-24">Rate</th>
                <th className="px-3 py-2 text-center font-semibold text-gray-700 text-xs uppercase tracking-wider w-16">Tax</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700 text-xs uppercase tracking-wider w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item: any, index: number) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                      {item.description && <p className="text-gray-500 text-xs">{item.description}</p>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-sm">{item.quantity}</td>
                  <td className="px-3 py-2 text-right text-sm">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-3 py-2 text-center text-sm">{item.taxRate}%</td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-800 text-sm">
                    {formatCurrency(item.quantity * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals and Notes in a Two-Column Layout */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Notes */}
        <div>
          {data.notes ? (
            <div>
              <h3 className="text-base font-bold mb-2 text-gray-800 border-b border-gray-300 pb-1">Notes</h3>
              <p className="whitespace-pre-line text-sm text-gray-600">{data.notes}</p>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              <p>Thank you for your business. We appreciate your prompt payment.</p>
              {type === "quotation" && (
                <p className="mt-2">This quotation is valid until {formatDate(new Date(data.validUntil))}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Totals */}
        <div>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-800">{formatCurrency(data.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold text-gray-800">{formatCurrency(data.taxAmount)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">Total:</span>
                  <span className="font-bold text-gray-800 text-lg">{formatCurrency(data.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-gray-300">
        <p className="font-semibold text-gray-800 mb-1">Thank you for your business!</p>
        <div className="mt-2 text-xs text-gray-500">
          <p>
            For any questions, please contact us at {data.company?.email} or {data.company?.phone}
          </p>
        </div>
      </div>
    </div>
  )
}