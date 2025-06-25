"use client"

import { useCurrency } from "@/contexts/currency-context"
import { formatDate } from "@/lib/utils"

interface InvoiceTemplate2Props {
  data: any
  type: "invoice" | "quotation"
}

export function InvoiceTemplate2({ data, type }: InvoiceTemplate2Props) {
  const { formatCurrency } = useCurrency()

  return (
    <div
      className="bg-white text-black"
      style={{ fontFamily: "Arial, sans-serif", fontSize: "14px", lineHeight: "1.4" }}
    >
      {/* Header with Orange and Blue Gradient */}
      <div className="bg-gradient-to-r from-orange-600 to-blue-700 text-white p-10 -m-8 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {data.company?.logoUrl && (
              <div className="mb-6">
                <img
                  src={data.company.logoUrl || "/placeholder.svg"}
                  alt="Company Logo"
                  className="h-16 w-auto object-contain bg-white p-3 rounded-lg"
                  style={{ maxHeight: "64px", maxWidth: "200px" }}
                />
              </div>
            )}
            <div>
              <h2 className="text-3xl font-bold mb-3">{data.company?.name || "Your Company"}</h2>
              <div className="text-orange-100 space-y-1">
                <p className="font-semibold">{data.company?.email}</p>
                <p className="font-semibold">{data.company?.phone}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-bold mb-4">{type === "invoice" ? "INVOICE" : "QUOTATION"}</h1>
            <div className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold text-xl">
              {type === "invoice" ? data.invoiceNumber : data.quotationNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Company Address */}
      <div className="text-center border-b-4 border-orange-600 pb-6 mb-8">
        <div className="text-gray-700 whitespace-pre-line font-semibold text-lg">{data.company?.address}</div>
        {data.company?.taxNumber && <p className="mt-3 font-bold text-blue-700">Tax ID: {data.company.taxNumber}</p>}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-t-4 border-blue-700">
          <h3 className="font-bold mb-4 text-blue-700 text-xl">{type === "invoice" ? "Bill To:" : "Quote For:"}</h3>
          <div className="space-y-2">
            <p className="font-bold text-xl text-gray-900">{data.customer.name}</p>
            <p className="font-semibold text-gray-700">{data.customer.email}</p>
            {data.customer.phone && <p className="font-semibold text-gray-700">{data.customer.phone}</p>}
            <div className="text-sm text-gray-600 whitespace-pre-line mt-3">{data.customer.billingAddress}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-t-4 border-orange-600">
          <h3 className="font-bold mb-4 text-orange-600 text-xl">Dates & Payment</h3>
          <div className="space-y-4">
            <div>
              <p className="font-bold text-gray-700">{type === "invoice" ? "Invoice Date:" : "Quote Date:"}</p>
              <p className="text-gray-600 font-semibold">{formatDate(new Date(data.issueDate))}</p>
            </div>
            <div>
              <p className="font-bold text-gray-700">{type === "invoice" ? "Due Date:" : "Valid Until:"}</p>
              <p className="text-gray-600 font-semibold">
                {formatDate(new Date(type === "invoice" ? data.dueDate : data.validUntil))}
              </p>
            </div>
            {data.company?.bankName && (
              <div className="pt-4 border-t border-orange-300">
                <div className="text-sm space-y-1">
                  <p className="font-bold text-gray-700">Bank: {data.company.bankName}</p>
                  {data.company.bankAccount && <p className="text-gray-600">Account: {data.company.bankAccount}</p>}
                  {data.company.bankIFSC && <p className="text-gray-600">Code: {data.company.bankIFSC}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-6 text-blue-700 border-b-4 border-blue-700 pb-3">Items & Services</h3>
        <div className="overflow-hidden rounded-xl shadow-lg">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-lg">Description</th>
                <th className="px-6 py-4 text-center font-bold text-lg w-20">Qty</th>
                <th className="px-6 py-4 text-right font-bold text-lg w-32">Rate</th>
                <th className="px-6 py-4 text-center font-bold text-lg w-20">Tax</th>
                <th className="px-6 py-4 text-right font-bold text-lg w-36">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-orange-25"}>
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
                  <td className="px-6 py-4 text-right font-bold text-orange-600 text-lg border-b border-gray-200">
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
        <div className="w-96 bg-gradient-to-br from-orange-50 to-blue-50 p-8 rounded-xl border-2 border-orange-600">
          <div className="space-y-4">
            <div className="flex justify-between text-xl">
              <span className="font-semibold text-gray-700">Subtotal:</span>
              <span className="font-bold text-gray-900">{formatCurrency(data.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xl">
              <span className="font-semibold text-gray-700">Tax:</span>
              <span className="font-bold text-gray-900">{formatCurrency(data.taxAmount)}</span>
            </div>
            <div className="border-t-4 border-blue-700 pt-4">
              <div className="flex justify-between text-2xl">
                <span className="font-bold text-orange-600">Total:</span>
                <span className="font-bold text-blue-700">{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-6 rounded-xl border-l-4 border-orange-600 mb-8">
          <h3 className="font-bold mb-4 text-orange-600 text-xl">Additional Notes:</h3>
          <p className="whitespace-pre-line text-gray-800 leading-relaxed text-lg">{data.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-8 border-t-4 border-blue-700">
        <div className="bg-gradient-to-r from-orange-600 to-blue-700 text-white p-8 rounded-xl">
          <p className="font-bold text-2xl mb-3">Thank you for choosing us!</p>
          {type === "quotation" && (
            <p className="text-lg opacity-90">This quotation expires on {formatDate(new Date(data.validUntil))}</p>
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
