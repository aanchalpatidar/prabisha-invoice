"use client"

import { useCurrency } from "@/contexts/currency-context"
import { formatDate } from "@/lib/utils"

interface InvoiceTemplate3Props {
  data: any
  type: "invoice" | "quotation"
}

export function InvoiceTemplate3({ data, type }: InvoiceTemplate3Props) {
  const { formatCurrency } = useCurrency()

  return (
    <div
      className="bg-white text-black"
      style={{ fontFamily: "Arial, sans-serif", fontSize: "14px", lineHeight: "1.4" }}
    >
      {/* Header - Minimal Design */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-300">
        <div className="flex-1">
          {data.company?.logoUrl && (
            <div className="mb-4">
              <img
                src={data.company.logoUrl || "/placeholder.svg"}
                alt="Company Logo"
                className="h-16 w-auto object-contain"
                style={{ maxHeight: "64px", maxWidth: "180px" }}
              />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{data.company?.name || "Your Company"}</h2>
            <div className="text-gray-600 text-sm mt-1 space-y-0.5">
              <p>{data.company?.email}</p>
              <p>{data.company?.phone}</p>
              <div className="whitespace-pre-line">{data.company?.address}</div>
              {data.company?.taxNumber && <p className="text-sm mt-1">Tax ID: {data.company.taxNumber}</p>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{type === "invoice" ? "INVOICE" : "QUOTATION"}</h1>
          <div className="bg-gray-100 px-4 py-2 rounded inline-block">
            <p className="text-lg font-bold text-gray-800"># {type === "invoice" ? data.invoiceNumber : data.quotationNumber}</p>
          </div>
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-semibold">{type === "invoice" ? "Invoice Date" : "Quote Date"}:</span>{" "}
              {formatDate(new Date(data.issueDate))}
            </p>
            <p>
              <span className="font-semibold">{type === "invoice" ? "Due Date" : "Valid Until"}:</span>{" "}
              {formatDate(new Date(type === "invoice" ? data.dueDate : data.validUntil))}
            </p>
          </div>
        </div>
      </div>

      {/* Customer and Payment Info - Compact Layout */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <h3 className="text-base font-bold mb-2 text-gray-700">{type === "invoice" ? "Bill To:" : "Quote For:"}</h3>
          <div className="space-y-1 text-sm">
            <p className="font-bold text-gray-800">{data.customer.name}</p>
            <p className="text-gray-600">{data.customer.email}</p>
            {data.customer.phone && <p className="text-gray-600">{data.customer.phone}</p>}
            <div className="whitespace-pre-line text-xs text-gray-500 mt-1">{data.customer.billingAddress}</div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <h3 className="text-base font-bold mb-2 text-gray-700">Payment Details:</h3>
          {data.company?.bankName ? (
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-600 font-semibold">Bank:</span> {data.company.bankName}
              </p>
              {data.company.bankAccount && (
                <p>
                  <span className="text-gray-600 font-semibold">Account:</span> {data.company.bankAccount}
                </p>
              )}
              {data.company.bankIFSC && (
                <p>
                  <span className="text-gray-600 font-semibold">IFSC/Sort Code:</span> {data.company.bankIFSC}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">Payment details not configured</p>
          )}
        </div>
      </div>

      {/* Line Items Table - Clean Design */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">Items & Services</h3>
        <div className="overflow-hidden rounded border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Description</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 text-sm w-16">Qty</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 text-sm w-28">Rate</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 text-sm w-16">Tax %</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 text-sm w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 border-t border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      {item.description && <p className="text-gray-500 text-xs mt-1">{item.description}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-t border-gray-200">{item.quantity}</td>
                  <td className="px-4 py-3 text-right border-t border-gray-200">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-3 text-center border-t border-gray-200">{item.taxRate}%</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800 border-t border-gray-200">
                    {formatCurrency(item.quantity * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals - Minimal Design */}
      <div className="flex justify-end mb-6">
        <div className="w-72 bg-gray-50 p-4 rounded border border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold text-gray-800">{formatCurrency(data.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span className="font-semibold text-gray-800">{formatCurrency(data.taxAmount)}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">Total:</span>
                <span className="font-bold text-gray-800">{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <h3 className="text-base font-bold mb-2 text-gray-700">Notes:</h3>
            <p className="whitespace-pre-line text-sm text-gray-600">{data.notes}</p>
          </div>
        </div>
      )}

      {/* Footer - Simple */}
      <div className="text-center pt-4 border-t border-gray-300">
        <div className="bg-gray-100 p-4 rounded">
          <p className="font-semibold text-gray-800 mb-1">Thank you for your business!</p>
          {type === "quotation" && (
            <p className="text-sm text-gray-600">This quotation is valid until {formatDate(new Date(data.validUntil))}</p>
          )}
          <div className="mt-2 text-xs text-gray-500">
            <p>
              For any questions, please contact us at {data.company?.email} or {data.company?.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}