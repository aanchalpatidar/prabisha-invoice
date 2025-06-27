export function createTemplate5(
  data: any,
  type: string,
  formatCurrency: (amount: number) => string,
  formatDate: (date: string) => string,
  logoBase64: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #000000; padding: 30px; background: white; width: 750px; min-height: 1000px;">
      <!-- Modern Header with Accent Color -->
      <div style="border-left: 8px solid #4f46e5; padding-left: 25px; padding-top: 25px; padding-bottom: 25px; margin-bottom: 35px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="margin: 0; font-size: 28px; color: #4f46e5; font-weight: bold;">${type.toUpperCase()}</h1>
            <p style="font-size: 18px; font-weight: 500; color: #4b5563; margin: 5px 0 0 0;">
              # ${type === "invoice" ? data.invoiceNumber : data.quotationNumber}
            </p>
          </div>
          
          ${
            logoBase64
              ? `<div><img src="${logoBase64}" alt="Logo" style="height: 64px; max-width: 180px; object-fit: contain;"></div>`
              : ""
          }
        </div>
      </div>

      <!-- Company and Customer Info in a Modern Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
        <div>
          <h3 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280;">From</h3>
          <div style="line-height: 1.5;">
            <div style="font-weight: bold; font-size: 18px; color: #1f2937; margin-bottom: 5px;">${data.company?.name || "Your Company"}</div>
            <div style="color: #4b5563;">${data.company?.email || ""}</div>
            <div style="color: #4b5563;">${data.company?.phone || ""}</div>
            <div style="color: #4b5563; font-size: 13px; margin-top: 5px;">${(data.company?.address || "").replace(/\n/g, "<br>")}</div>
            ${data.company?.taxNumber ? `<div style="color: #4b5563; font-size: 13px; margin-top: 5px;">Tax ID: ${data.company.taxNumber}</div>` : ""}
          </div>
        </div>
        
        <div>
          <h3 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280;">
            ${type === "invoice" ? "Bill To" : "Quote For"}
          </h3>
          <div style="line-height: 1.5;">
            <div style="font-weight: bold; font-size: 18px; color: #1f2937; margin-bottom: 5px;">${data.customer.name}</div>
            <div style="color: #4b5563;">${data.customer.email}</div>
            ${data.customer.phone ? `<div style="color: #4b5563;">${data.customer.phone}</div>` : ""}
            <div style="color: #4b5563; font-size: 13px; margin-top: 5px;">${(data.customer.billingAddress || "").replace(/\n/g, "<br>")}</div>
          </div>
        </div>
      </div>

      <!-- Important Dates and Payment Info -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
        <div style="background: #f9fafb; padding: 20px; border-radius: 6px;">
          <h3 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280;">Important Dates</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 5px 0;">${type === "invoice" ? "Invoice Date" : "Quote Date"}</p>
              <p style="font-weight: 500; color: #1f2937; margin: 0;">${formatDate(data.issueDate)}</p>
            </div>
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 5px 0;">${type === "invoice" ? "Due Date" : "Valid Until"}</p>
              <p style="font-weight: 500; color: #1f2937; margin: 0;">${formatDate(type === "invoice" ? data.dueDate : data.validUntil)}</p>
            </div>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 6px;">
          <h3 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280;">Payment Details</h3>
          ${
            data.company?.bankName
              ? `
            <div style="font-size: 13px; line-height: 1.5;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 5px;">
                <p style="color: #6b7280; margin: 0;">Bank:</p>
                <p style="color: #1f2937; margin: 0;">${data.company.bankName}</p>
              </div>
              ${
                data.company.bankAccount
                  ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 5px;">
                  <p style="color: #6b7280; margin: 0;">Account:</p>
                  <p style="color: #1f2937; margin: 0;">${data.company.bankAccount}</p>
                </div>
              `
                  : ""
              }
              ${
                data.company.bankIFSC
                  ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                  <p style="color: #6b7280; margin: 0;">IFSC/Sort Code:</p>
                  <p style="color: #1f2937; margin: 0;">${data.company.bankIFSC}</p>
                </div>
              `
                  : ""
              }
            </div>
          `
              : '<p style="color: #9ca3af; font-style: italic; font-size: 13px; margin: 0;">Payment details not configured</p>'
          }
        </div>
      </div>

      <!-- Line Items Table - Modern Clean Design -->
      <div style="margin-bottom: 40px;">
        <h3 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280;">Items & Services</h3>
        <div style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="background: #eef2ff;">
              <tr>
                <th style="padding: 12px 16px; text-align: left; font-weight: 500; color: #4f46e5; font-size: 13px;">Description</th>
                <th style="padding: 12px 16px; text-align: center; font-weight: 500; color: #4f46e5; font-size: 13px; width: 60px;">Qty</th>
                <th style="padding: 12px 16px; text-align: right; font-weight: 500; color: #4f46e5; font-size: 13px; width: 100px;">Rate</th>
                <th style="padding: 12px 16px; text-align: center; font-weight: 500; color: #4f46e5; font-size: 13px; width: 60px;">Tax %</th>
                <th style="padding: 12px 16px; text-align: right; font-weight: 500; color: #4f46e5; font-size: 13px; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.lineItems
                .map(
                  (item: any, index: number) => `
                <tr style="border-top: 1px solid #e5e7eb;">
                  <td style="padding: 12px 16px;">
                    <div>
                      <div style="font-weight: 500; color: #1f2937;">${item.name}</div>
                      ${item.description ? `<div style="color: #6b7280; font-size: 12px; margin-top: 4px;">${item.description}</div>` : ""}
                    </div>
                  </td>
                  <td style="padding: 12px 16px; text-align: center; color: #374151;">${item.quantity}</td>
                  <td style="padding: 12px 16px; text-align: right; color: #374151;">${formatCurrency(item.price)}</td>
                  <td style="padding: 12px 16px; text-align: center; color: #374151;">${item.taxRate}%</td>
                  <td style="padding: 12px 16px; text-align: right; font-weight: 500; color: #1f2937;">${formatCurrency(item.quantity * item.price)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totals and Notes in a Modern Layout -->
      <div style="display: flex; flex-direction: row; gap: 40px; margin-bottom: 40px;">
        <!-- Notes -->
        <div style="flex: 1;">
          ${
            data.notes
              ? `
            <h3 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280;">Notes</h3>
            <div style="background: #f9fafb; padding: 16px; border-radius: 6px;">
              <p style="color: #4b5563; line-height: 1.5; margin: 0;">${data.notes.replace(/\n/g, "<br>")}</p>
            </div>
          `
              : `
            <div style="background: #f9fafb; padding: 16px; border-radius: 6px;">
              <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280;">Thank You</h3>
              <p style="color: #4b5563; margin: 0;">We appreciate your business and look forward to working with you again.</p>
              ${
                type === "quotation"
                  ? `<p style="color: #4b5563; margin: 10px 0 0 0;">This quotation is valid until ${formatDate(data.validUntil)}</p>`
                  : ""
              }
            </div>
          `
          }
        </div>
        
        <!-- Totals -->
        <div style="width: 300px;">
          <h3 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280;">Summary</h3>
          <div style="background: #eef2ff; padding: 20px; border-radius: 6px;">
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #4b5563;">Subtotal:</span>
              <span style="font-weight: 500; color: #1f2937;">${formatCurrency(data.subtotal)}</span>
            </div>
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #4b5563;">Tax:</span>
              <span style="font-weight: 500; color: #1f2937;">${formatCurrency(data.taxAmount)}</span>
            </div>
            <div style="border-top: 1px solid #c7d2fe; padding-top: 10px; margin-top: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; color: #4f46e5;">Total:</span>
                <span style="font-weight: bold; color: #4f46e5; font-size: 18px;">${formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="font-weight: 500; color: #1f2937; margin: 0 0 5px 0;">Thank you for your business!</p>
        <div style="color: #6b7280; font-size: 13px;">
          <p style="margin: 0;">
            For any questions, please contact us at ${data.company?.email} or ${data.company?.phone}
          </p>
        </div>
      </div>
    </div>
  `
}