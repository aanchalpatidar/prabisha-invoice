"use client"

import { useCurrency } from "@/contexts/currency-context"
import { formatDate } from "@/lib/utils"

interface InvoiceTemplate1Props {
  data: any
  type: "invoice" | "quotation"
}

export function InvoiceTemplate1({ data, type }: InvoiceTemplate1Props) {
  const { formatCurrency } = useCurrency()

  return (
    <div
      className="bg-white text-black"
      style={{ fontFamily: "Arial, sans-serif", fontSize: "14px", lineHeight: "1.4" }}
    >
      {/* Header with Blue and Orange Theme */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b-4 border-blue-700">
        <div className="flex-1">
          {data.company?.logoUrl && (
            <div className="mb-6">
              <img
                src={data.company.logoUrl || "/placeholder.svg"}
                alt="Company Logo"
                className="h-20 w-auto object-contain"
                style={{ maxHeight: "80px", maxWidth: "200px" }}
              />
            </div>
          )}
          <div>
            <h2 className="text-3xl font-bold text-blue-700 mb-2">{data.company?.name || "Your Company"}</h2>
            <div className="text-gray-700 space-y-1">
              <p className="font-semibold">{data.company?.email}</p>
              <p className="font-semibold">{data.company?.phone}</p>
              <div className="whitespace-pre-line text-sm">{data.company?.address}</div>
              {data.company?.taxNumber && <p className="text-sm font-semibold">Tax ID: {data.company.taxNumber}</p>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-bold text-orange-600 mb-4">{type === "invoice" ? "INVOICE" : "QUOTATION"}</h1>
          <div className="bg-gradient-to-r from-blue-700 to-orange-600 text-white px-6 py-3 rounded-lg inline-block">
            <p className="text-xl font-bold">{type === "invoice" ? data.invoiceNumber : data.quotationNumber}</p>
          </div>
          <div className="mt-4 space-y-2 text-gray-700">
            <p className="font-medium">
              <span className="font-bold">{type === "invoice" ? "Invoice Date" : "Quote Date"}:</span>{" "}
              {formatDate(new Date(data.issueDate))}
            </p>
            <p className="font-medium">
              <span className="font-bold">{type === "invoice" ? "Due Date" : "Valid Until"}:</span>{" "}
              {formatDate(new Date(type === "invoice" ? data.dueDate : data.validUntil))}
            </p>
          </div>
        </div>
      </div>

      {/* Customer and Payment Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-700">
          <h3 className="text-xl font-bold mb-4 text-blue-700">{type === "invoice" ? "Bill To:" : "Quote For:"}</h3>
          <div className="space-y-2">
            <p className="font-bold text-lg text-gray-900">{data.customer.name}</p>
            <p className="font-semibold text-gray-700">{data.customer.email}</p>
            {data.customer.phone && <p className="font-semibold text-gray-700">{data.customer.phone}</p>}
            <div className="whitespace-pre-line text-sm text-gray-600">{data.customer.billingAddress}</div>
          </div>
        </div>
        <div className="bg-orange-50 p-6 rounded-xl border-l-4 border-orange-600">
          <h3 className="text-xl font-bold mb-4 text-orange-600">Payment Details:</h3>
          {data.company?.bankName ? (
            <div className="space-y-2">
              <p className="font-semibold">
                <span className="text-gray-600">Bank:</span> {data.company.bankName}
              </p>
              {data.company.bankAccount && (
                <p className="font-semibold">
                  <span className="text-gray-600">Account:</span> {data.company.bankAccount}
                </p>
              )}
              {data.company.bankIFSC && (
                <p className="font-semibold">
                  <span className="text-gray-600">IFSC/Sort Code:</span> {data.company.bankIFSC}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">Payment details not configured</p>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-blue-700 mb-6">Items & Services</h3>
        <div className="overflow-hidden rounded-xl shadow-lg">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-blue-700 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-lg">Description</th>
                <th className="px-6 py-4 text-center font-bold text-lg w-20">Qty</th>
                <th className="px-6 py-4 text-right font-bold text-lg w-32">Rate</th>
                <th className="px-6 py-4 text-center font-bold text-lg w-20">Tax %</th>
                <th className="px-6 py-4 text-right font-bold text-lg w-36">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 border-b border-gray-200">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                      {item.description && <p className="text-gray-600 text-sm mt-1">{item.description}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold border-b border-gray-200">{item.quantity}</td>
                  <td className="px-6 py-4 text-right font-semibold border-b border-gray-200">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold border-b border-gray-200">{item.taxRate}%</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-700 text-lg border-b border-gray-200">
                    {formatCurrency(item.quantity * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-96 bg-gradient-to-br from-blue-50 to-orange-50 p-8 rounded-xl border-2 border-blue-700">
          <div className="space-y-4">
            <div className="flex justify-between text-xl">
              <span className="font-semibold text-gray-700">Subtotal:</span>
              <span className="font-bold text-gray-900">{formatCurrency(data.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xl">
              <span className="font-semibold text-gray-700">Tax:</span>
              <span className="font-bold text-gray-900">{formatCurrency(data.taxAmount)}</span>
            </div>
            <div className="border-t-4 border-orange-600 pt-4">
              <div className="flex justify-between text-2xl">
                <span className="font-bold text-blue-700">Total:</span>
                <span className="font-bold text-orange-600">{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mb-8">
          <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">Additional Notes:</h3>
            <p className="whitespace-pre-line text-gray-800 leading-relaxed">{data.notes}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-8 border-t-4 border-orange-600">
        <div className="bg-gradient-to-r from-blue-700 to-orange-600 text-white p-8 rounded-xl">
          <p className="font-bold text-2xl mb-3">Thank you for your business!</p>
          {type === "quotation" && (
            <p className="text-lg opacity-90">This quotation is valid until {formatDate(new Date(data.validUntil))}</p>
          )}
          <div className="mt-4 text-sm opacity-80">
            <p>
              For any questions, please contact us at {data.company?.email} or {data.company?.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
