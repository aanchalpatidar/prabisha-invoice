"use client"

import { useCurrency } from "@/contexts/currency-context"
import { formatDate } from "@/lib/utils"

interface InvoiceTemplate5Props {
  data: any
  type: "invoice" | "quotation"
}

export function InvoiceTemplate5({ data, type }: InvoiceTemplate5Props) {
  const { formatCurrency } = useCurrency()

  return (
    <div
      className="bg-white text-black"
      style={{ fontFamily: "Arial, sans-serif", fontSize: "14px", lineHeight: "1.4" }}
    >
      {/* Modern Header with Accent Color */}
      <div className="border-l-8 border-indigo-600 pl-6 py-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">{type === "invoice" ? "INVOICE" : "QUOTATION"}</h1>
            <p className="text-lg font-medium text-gray-700 mt-1">
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
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Items & Services</h3>
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-indigo-50">
                <th className="px-4 py-3 text-left font-medium text-indigo-600 text-sm">Description</th>
                <th className="px-4 py-3 text-center font-medium text-indigo-600 text-sm w-16">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-indigo-600 text-sm w-28">Rate</th>
                <th className="px-4 py-3 text-center font-medium text-indigo-600 text-sm w-16">Tax %</th>
                <th className="px-4 py-3 text-right font-medium text-indigo-600 text-sm w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item: any, index: number) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {item.description && <p className="text-gray-500 text-xs mt-1">{item.description}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-3 text-center">{item.taxRate}%</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    {formatCurrency(item.quantity * item.price)}
                  </td>
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
          <div className="bg-indigo-50 p-5 rounded-md">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-800">{formatCurrency(data.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium text-gray-800">{formatCurrency(data.taxAmount)}</span>
              </div>
              <div className="border-t border-indigo-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-indigo-600">Total:</span>
                  <span className="font-bold text-indigo-600 text-lg">{formatCurrency(data.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-gray-200">
        <p className="font-medium text-gray-800 mb-1">Thank you for your business!</p>
        <div className="mt-2 text-sm text-gray-500">
          <p>
            For any questions, please contact us at {data.company?.email} or {data.company?.phone}
          </p>
        </div>
      </div>
    </div>
  )
}