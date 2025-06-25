import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function generatePDF(data: any, template: string, type: "invoice" | "quotation") {
  try {
    // Create a temporary div to render the template
    const tempDiv = document.createElement("div")
    tempDiv.style.position = "absolute"
    tempDiv.style.left = "-9999px"
    tempDiv.style.width = "210mm"
    tempDiv.style.backgroundColor = "white"
    tempDiv.style.padding = "0"
    tempDiv.style.fontFamily = "Arial, sans-serif"

    // Add the template content
    tempDiv.innerHTML = await createHTMLTemplate(data, template, type)

    document.body.appendChild(tempDiv)

    // Wait for images to load
    const images = tempDiv.querySelectorAll("img")
    await Promise.all(
      Array.from(images).map((img) => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(true)
          } else {
            img.onload = () => resolve(true)
            img.onerror = () => resolve(true)
            // Set a timeout to avoid hanging
            setTimeout(() => resolve(true), 3000)
          }
        })
      }),
    )

    // Convert to canvas with better options
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure all styles are applied to cloned document
        const clonedDiv = clonedDoc.querySelector("div")
        if (clonedDiv) {
          clonedDiv.style.fontFamily = "Arial, sans-serif"
          clonedDiv.style.fontSize = "14px"
          clonedDiv.style.lineHeight = "1.4"
          clonedDiv.style.color = "#000000"
        }
      },
    })

    // Remove temporary div
    document.body.removeChild(tempDiv)

    // Create PDF with better settings
    const pdf = new jsPDF("p", "mm", "a4")
    const imgData = canvas.toDataURL("image/png", 1.0)

    const pdfWidth = 210
    const pdfHeight = 297
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * pdfWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST")
    heightLeft -= pdfHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST")
      heightLeft -= pdfHeight
    }

    // Download the PDF
    const filename = `${type}-${data.invoiceNumber || data.quotationNumber}-${new Date().toISOString().split("T")[0]}.pdf`
    pdf.save(filename)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

async function createHTMLTemplate(data: any, template: string, type: "invoice" | "quotation"): Promise<string> {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.currency || "USD",
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  // Convert logo to base64 if it exists
  let logoBase64 = ""
  if (data.company?.logoUrl) {
    try {
      logoBase64 = await convertImageToBase64(data.company.logoUrl)
    } catch (error) {
      console.warn("Failed to convert logo to base64:", error)
    }
  }

  if (template === "template2") {
    return createTemplate2(data, type, formatCurrency, formatDate, logoBase64)
  }

  return createTemplate1(data, type, formatCurrency, formatDate, logoBase64)
}

async function convertImageToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      resolve(canvas.toDataURL("image/png"))
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = url
  })
}

function createTemplate1(
  data: any,
  type: string,
  formatCurrency: (amount: number) => string,
  formatDate: (date: string) => string,
  logoBase64: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #000000; padding: 40px; background: white; width: 750px; min-height: 1000px;">
      <!-- Header with Blue and Orange Theme -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #1e40af;">
        <div style="flex: 1;">
          ${
            logoBase64
              ? `<div style="margin-bottom: 20px;"><img src="${logoBase64}" alt="Logo" style="height: 80px; max-width: 200px; object-fit: contain;"></div>`
              : ""
          }
          <div>
            <h2 style="margin: 0; font-size: 28px; color: #1e40af; font-weight: bold;">${data.company?.name || "Your Company"}</h2>
            <div style="color: #374151; margin-top: 8px; line-height: 1.6;">
              <div style="font-weight: 600;">${data.company?.email || ""}</div>
              <div style="font-weight: 600;">${data.company?.phone || ""}</div>
              <div style="margin-top: 4px;">${(data.company?.address || "").replace(/\n/g, "<br>")}</div>
              ${data.company?.taxNumber ? `<div style="margin-top: 4px; font-weight: bold; color: #1e40af;">Tax ID: ${data.company.taxNumber}</div>` : ""}
            </div>
          </div>
        </div>
        <div style="text-align: right;">
          <h1 style="margin: 0; font-size: 42px; color: #ea580c; font-weight: bold; margin-bottom: 15px;">${type.toUpperCase()}</h1>
          <div style="background: linear-gradient(135deg, #1e40af, #ea580c); color: white; padding: 12px 20px; border-radius: 8px; display: inline-block;">
            <div style="font-size: 20px; font-weight: bold;">${type === "invoice" ? data.invoiceNumber : data.quotationNumber}</div>
          </div>
          <div style="margin-top: 15px; color: #374151;">
            <div style="margin-bottom: 8px;"><strong>${type === "invoice" ? "Invoice Date" : "Quote Date"}:</strong> ${formatDate(data.issueDate)}</div>
            <div><strong>${type === "invoice" ? "Due Date" : "Valid Until"}:</strong> ${formatDate(type === "invoice" ? data.dueDate : data.validUntil)}</div>
          </div>
        </div>
      </div>

      <!-- Customer and Payment Info -->
      <div style="display: flex; gap: 40px; margin-bottom: 40px;">
        <div style="flex: 1; background: #f8fafc; padding: 25px; border-radius: 12px; border-left: 5px solid #1e40af;">
          <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1e40af; font-weight: bold;">${type === "invoice" ? "Bill To:" : "Quote For:"}</h3>
          <div style="line-height: 1.6;">
            <div style="font-weight: bold; font-size: 18px; color: #111827; margin-bottom: 8px;">${data.customer.name}</div>
            <div style="font-weight: 600; color: #374151;">${data.customer.email}</div>
            ${data.customer.phone ? `<div style="font-weight: 600; color: #374151;">${data.customer.phone}</div>` : ""}
            <div style="margin-top: 8px; color: #6b7280; font-size: 13px;">${(data.customer.billingAddress || "").replace(/\n/g, "<br>")}</div>
          </div>
        </div>
        <div style="flex: 1; background: #fff7ed; padding: 25px; border-radius: 12px; border-left: 5px solid #ea580c;">
          <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #ea580c; font-weight: bold;">Payment Details:</h3>
          ${
            data.company?.bankName
              ? `
            <div style="line-height: 1.6;">
              <div style="margin-bottom: 8px;"><strong style="color: #374151;">Bank:</strong> <span style="color: #6b7280;">${data.company.bankName}</span></div>
              ${data.company.bankAccount ? `<div style="margin-bottom: 8px;"><strong style="color: #374151;">Account:</strong> <span style="color: #6b7280;">${data.company.bankAccount}</span></div>` : ""}
              ${data.company.bankIFSC ? `<div><strong style="color: #374151;">IFSC/Sort Code:</strong> <span style="color: #6b7280;">${data.company.bankIFSC}</span></div>` : ""}
            </div>
          `
              : '<div style="color: #9ca3af; font-style: italic;">Payment details not configured</div>'
          }
        </div>
      </div>

      <!-- Line Items Table -->
      <div style="margin-bottom: 40px;">
        <h3 style="font-size: 20px; color: #1e40af; margin-bottom: 20px; font-weight: bold; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">Items & Services</h3>
        <table style="width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <thead style="background: linear-gradient(135deg, #1e40af, #3b82f6);">
            <tr>
              <th style="padding: 18px; text-align: left; font-weight: bold; color: white; font-size: 16px;">Description</th>
              <th style="padding: 18px; text-align: center; font-weight: bold; color: white; font-size: 16px; width: 80px;">Qty</th>
              <th style="padding: 18px; text-align: right; font-weight: bold; color: white; font-size: 16px; width: 120px;">Rate</th>
              <th style="padding: 18px; text-align: center; font-weight: bold; color: white; font-size: 16px; width: 80px;">Tax</th>
              <th style="padding: 18px; text-align: right; font-weight: bold; color: white; font-size: 16px; width: 140px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.lineItems
              .map(
                (item: any, index: number) => `
              <tr style="background: ${index % 2 === 0 ? "#ffffff" : "#f8fafc"}; border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 18px;">
                  <div>
                    <div style="font-weight: bold; color: #111827; font-size: 16px; margin-bottom: 4px;">${item.name}</div>
                    ${item.description ? `<div style="color: #6b7280; font-size: 14px;">${item.description}</div>` : ""}
                  </div>
                </td>
                <td style="padding: 18px; text-align: center; font-weight: 600; color: #374151;">${item.quantity}</td>
                <td style="padding: 18px; text-align: right; font-weight: 600; color: #374151;">${formatCurrency(item.price)}</td>
                <td style="padding: 18px; text-align: center; font-weight: 600; color: #374151;">${item.taxRate}%</td>
                <td style="padding: 18px; text-align: right; font-weight: bold; color: #1e40af; font-size: 16px;">${formatCurrency(item.quantity * item.price)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
        <div style="width: 400px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 30px; border-radius: 12px; border: 2px solid #1e40af;">
          <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 18px; color: #374151; font-weight: 600;">Subtotal:</span>
            <span style="font-size: 18px; font-weight: bold; color: #111827;">${formatCurrency(data.subtotal)}</span>
          </div>
          <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 18px; color: #374151; font-weight: 600;">Tax:</span>
            <span style="font-size: 18px; font-weight: bold; color: #111827;">${formatCurrency(data.taxAmount)}</span>
          </div>
          <div style="border-top: 3px solid #ea580c; padding-top: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 22px; font-weight: bold; color: #ea580c;">Total:</span>
              <span style="font-size: 26px; font-weight: bold; color: #1e40af;">${formatCurrency(data.total)}</span>
            </div>
          </div>
        </div>
      </div>

      ${
        data.notes
          ? `
        <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 25px; border-radius: 12px; border-left: 5px solid #1e40af; margin-bottom: 40px;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af; font-weight: bold; font-size: 18px;">Additional Notes:</h3>
          <div style="color: #374151; line-height: 1.6; font-size: 15px;">${data.notes.replace(/\n/g, "<br>")}</div>
        </div>
      `
          : ""
      }

      <!-- Footer -->
      <div style="text-align: center; padding-top: 30px; border-top: 3px solid #ea580c;">
        <div style="background: linear-gradient(135deg, #ea580c, #1e40af); color: white; padding: 25px; border-radius: 12px;">
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Thank you for your business!</div>
          ${type === "quotation" ? `<div style="font-size: 16px; opacity: 0.9;">This quotation is valid until ${formatDate(data.validUntil)}</div>` : ""}
          <div style="margin-top: 15px; font-size: 14px; opacity: 0.8;">
            For any questions, please contact us at ${data.company?.email} or ${data.company?.phone}
          </div>
        </div>
      </div>
    </div>
  `
}

function createTemplate2(
  data: any,
  type: string,
  formatCurrency: (amount: number) => string,
  formatDate: (date: string) => string,
  logoBase64: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #000000; background: white; width: 750px; min-height: 1000px;">
      <!-- Header with Orange and Blue Gradient -->
      <div style="background: linear-gradient(135deg, #ea580c, #1e40af); color: white; padding: 40px; margin: -40px -40px 40px -40px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            ${
              logoBase64
                ? `<div style="margin-bottom: 20px;"><img src="${logoBase64}" alt="Logo" style="height: 70px; max-width: 200px; background: white; padding: 10px; border-radius: 8px; object-fit: contain;"></div>`
                : ""
            }
            <div>
              <h2 style="margin: 0; font-size: 28px; font-weight: bold;">${data.company?.name || "Your Company"}</h2>
              <div style="color: rgba(255, 255, 255, 0.9); margin-top: 10px; line-height: 1.6;">
                <div style="font-weight: 600;">${data.company?.email || ""}</div>
                <div style="font-weight: 600;">${data.company?.phone || ""}</div>
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <h1 style="margin: 0; font-size: 42px; font-weight: bold; margin-bottom: 15px;">${type.toUpperCase()}</h1>
            <div style="background: white; color: #ea580c; padding: 12px 20px; border-radius: 8px; display: inline-block;">
              <div style="font-size: 20px; font-weight: bold;">${type === "invoice" ? data.invoiceNumber : data.quotationNumber}</div>
            </div>
          </div>
        </div>
      </div>

      <div style="padding: 0 40px;">
        <!-- Company Address -->
        <div style="text-align: center; border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="color: #374151; font-weight: 600; line-height: 1.6;">${(data.company?.address || "").replace(/\n/g, "<br>")}</div>
          ${data.company?.taxNumber ? `<div style="margin-top: 10px; font-weight: bold; color: #1e40af;">Tax ID: ${data.company.taxNumber}</div>` : ""}
        </div>

        <!-- Details Grid -->
        <div style="display: flex; gap: 25px; margin-bottom: 40px;">
          <div style="flex: 1; background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 25px; border-radius: 12px; border-top: 4px solid #1e40af;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: bold;">${type === "invoice" ? "Bill To:" : "Quote For:"}</h3>
            <div style="line-height: 1.6;">
              <div style="font-weight: bold; font-size: 18px; color: #111827; margin-bottom: 8px;">${data.customer.name}</div>
              <div style="font-weight: 600; color: #374151;">${data.customer.email}</div>
              ${data.customer.phone ? `<div style="font-weight: 600; color: #374151;">${data.customer.phone}</div>` : ""}
              <div style="margin-top: 8px; color: #6b7280; font-size: 13px;">${(data.customer.billingAddress || "").replace(/\n/g, "<br>")}</div>
            </div>
          </div>
          
          <div style="flex: 1; background: linear-gradient(135deg, #fff7ed, #fed7aa); padding: 25px; border-radius: 12px; border-top: 4px solid #ea580c;">
            <h3 style="margin: 0 0 15px 0; color: #ea580c; font-size: 18px; font-weight: bold;">Dates & Payment</h3>
            <div style="margin-bottom: 15px;">
              <div style="font-weight: bold; color: #374151; margin-bottom: 4px;">${type === "invoice" ? "Invoice Date:" : "Quote Date:"}</div>
              <div style="color: #6b7280;">${formatDate(data.issueDate)}</div>
            </div>
            <div style="margin-bottom: 15px;">
              <div style="font-weight: bold; color: #374151; margin-bottom: 4px;">${type === "invoice" ? "Due Date:" : "Valid Until:"}</div>
              <div style="color: #6b7280;">${formatDate(type === "invoice" ? data.dueDate : data.validUntil)}</div>
            </div>
            ${
              data.company?.bankName
                ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(234, 88, 12, 0.3);">
                <div style="font-size: 13px; line-height: 1.4;">
                  <div style="font-weight: bold; color: #374151;">Bank: ${data.company.bankName}</div>
                  ${data.company.bankAccount ? `<div style="color: #6b7280;">Account: ${data.company.bankAccount}</div>` : ""}
                  ${data.company.bankIFSC ? `<div style="color: #6b7280;">Code: ${data.company.bankIFSC}</div>` : ""}
                </div>
              </div>
            `
                : ""
            }
          </div>
        </div>

        <!-- Line Items -->
        <div style="margin-bottom: 40px;">
          <h3 style="color: #1e40af; font-size: 20px; margin-bottom: 20px; font-weight: bold; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">Items & Services</h3>
          <table style="width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <thead style="background: linear-gradient(135deg, #ea580c, #fb923c);">
              <tr>
                <th style="padding: 18px; text-align: left; font-weight: bold; color: white; font-size: 16px;">Description</th>
                <th style="padding: 18px; text-align: center; font-weight: bold; color: white; font-size: 16px; width: 80px;">Qty</th>
                <th style="padding: 18px; text-align: right; font-weight: bold; color: white; font-size: 16px; width: 120px;">Rate</th>
                <th style="padding: 18px; text-align: center; font-weight: bold; color: white; font-size: 16px; width: 80px;">Tax</th>
                <th style="padding: 18px; text-align: right; font-weight: bold; color: white; font-size: 16px; width: 140px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.lineItems
                .map(
                  (item: any, index: number) => `
                <tr style="background: ${index % 2 === 0 ? "#ffffff" : "#fef3f2"};">
                  <td style="padding: 18px; border-bottom: 1px solid #f3f4f6;">
                    <div>
                      <div style="font-weight: bold; color: #111827; font-size: 16px; margin-bottom: 4px;">${item.name}</div>
                      ${item.description ? `<div style="color: #6b7280; font-size: 14px;">${item.description}</div>` : ""}
                    </div>
                  </td>
                  <td style="padding: 18px; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #f3f4f6;">${item.quantity}</td>
                  <td style="padding: 18px; text-align: right; font-weight: 600; color: #374151; border-bottom: 1px solid #f3f4f6;">${formatCurrency(item.price)}</td>
                  <td style="padding: 18px; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #f3f4f6;">${item.taxRate}%</td>
                  <td style="padding: 18px; text-align: right; font-weight: bold; color: #ea580c; font-size: 16px; border-bottom: 1px solid #f3f4f6;">${formatCurrency(item.quantity * item.price)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
          <div style="width: 400px; background: linear-gradient(135deg, #fff7ed, #fed7aa); padding: 30px; border-radius: 12px; border: 2px solid #ea580c;">
            <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 18px; color: #374151; font-weight: 600;">Subtotal:</span>
              <span style="font-size: 18px; font-weight: bold; color: #111827;">${formatCurrency(data.subtotal)}</span>
            </div>
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 18px; color: #374151; font-weight: 600;">Tax:</span>
              <span style="font-size: 18px; font-weight: bold; color: #111827;">${formatCurrency(data.taxAmount)}</span>
            </div>
            <div style="border-top: 3px solid #1e40af; padding-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 22px; font-weight: bold; color: #ea580c;">Total:</span>
                <span style="font-size: 26px; font-weight: bold; color: #1e40af;">${formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        </div>

        ${
          data.notes
            ? `
          <div style="background: linear-gradient(135deg, #fef3f2, #fee2e2); padding: 25px; border-radius: 12px; border-left: 5px solid #ea580c; margin-bottom: 40px;">
            <h3 style="margin: 0 0 15px 0; color: #ea580c; font-weight: bold; font-size: 18px;">Additional Notes:</h3>
            <div style="color: #374151; line-height: 1.6; font-size: 15px;">${data.notes.replace(/\n/g, "<br>")}</div>
          </div>
        `
            : ""
        }

        <!-- Footer -->
        <div style="text-align: center; padding-top: 30px; border-top: 3px solid #1e40af;">
          <div style="background: linear-gradient(135deg, #ea580c, #1e40af); color: white; padding: 25px; border-radius: 12px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Thank you for choosing us!</div>
            ${type === "quotation" ? `<div style="font-size: 16px; opacity: 0.9;">This quotation expires on ${formatDate(data.validUntil)}</div>` : ""}
            <div style="margin-top: 15px; font-size: 14px; opacity: 0.8;">
              For any questions, please contact us at ${data.company?.email} or ${data.company?.phone}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}
