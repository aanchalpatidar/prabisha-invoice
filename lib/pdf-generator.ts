import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function generatePDF(data: any, template: string, type: "invoice" | "quotation", returnBuffer = false) {
  try {
    // Create a temporary div to render the template
    const tempDiv = document.createElement("div")
    tempDiv.style.position = "absolute"
    tempDiv.style.left = "-9999px"
    tempDiv.style.width = "210mm" // A4 width
    tempDiv.style.backgroundColor = "white"
    tempDiv.style.padding = "20px"
    tempDiv.style.margin = "0"
    tempDiv.style.fontFamily = "Arial, sans-serif"
    tempDiv.style.boxSizing = "border-box"
    tempDiv.style.overflow = "hidden"
    tempDiv.style.maxWidth = "210mm" // Ensure it doesn't exceed A4 width

    // Add the template content
    tempDiv.innerHTML = await createHTMLTemplate(data, template, type)

    document.body.appendChild(tempDiv)

    // Apply additional styles to ensure proper rendering
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
      const element = el as HTMLElement;
      if (element.style) {
        element.style.boxSizing = 'border-box';
        
        // Ensure table cells have proper spacing
        if (element.tagName === 'TD' || element.tagName === 'TH') {
          element.style.padding = element.style.padding || '8px';
        }
        
        // Ensure images don't overflow
        if (element.tagName === 'IMG') {
          element.style.maxWidth = '100%';
          element.style.maxHeight = '80px';
          element.style.objectFit = 'contain';
        }

        // Ensure tables don't overflow
        if (element.tagName === 'TABLE') {
          element.style.width = '100%';
          element.style.tableLayout = 'fixed';
          element.style.borderCollapse = 'collapse';
        }

        // Ensure text doesn't overflow
        if (element.tagName === 'P' || element.tagName === 'DIV' || element.tagName === 'SPAN') {
          element.style.wordWrap = 'break-word';
          element.style.overflowWrap = 'break-word';
        }
      }
    });

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
      scale: 3, // Higher scale for better quality
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
          clonedDiv.style.width = "210mm" // A4 width
          clonedDiv.style.margin = "0"
          clonedDiv.style.padding = "20px"
          clonedDiv.style.boxSizing = "border-box"
        }
      },
    })

    // Remove temporary div
    document.body.removeChild(tempDiv)

    // Create PDF with better settings
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
      hotfixes: ["px_scaling"], // Fix scaling issues
    })
    
    const imgData = canvas.toDataURL("image/png", 1.0)

    const pdfWidth = 210 // A4 width in mm
    const pdfHeight = 297 // A4 height in mm
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

    // Return buffer or save file
    if (returnBuffer) {
      return pdf.output('arraybuffer');
    } else {
      // Download the PDF
      const filename = `${type}-${data.invoiceNumber || data.quotationNumber}-${new Date().toISOString().split("T")[0]}.pdf`
      pdf.save(filename)
      return null;
    }
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

async function createHTMLTemplate(data: any, template: string, type: "invoice" | "quotation"): Promise<string> {
  const staticRates = {
    INR: 1,
    USD: 0.012, // 1 INR = 0.012 USD (example)
    GBP: 0.0095, // 1 INR = 0.0095 GBP (example)
  }
  const formatCurrency = (amountInINR: number) => {
    const currency = data.currency || "INR"
    const rate = staticRates[currency] || 1
    const converted = amountInINR * rate
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : currency === 'GBP' ? 'en-GB' : 'en-US', {
      style: "currency",
      currency: currency,
    }).format(converted)
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

  // Get dynamic colors from company data or use defaults
  const primaryColor = data.company?.primaryColor || '#1e40af'
  const secondaryColor = data.company?.secondaryColor || '#ea580c'

  switch (template) {
    case "template3":
      return createTemplate3(data, type, formatCurrency, formatDate, logoBase64, primaryColor, secondaryColor)
    case "template4":
      return createTemplate4(data, type, formatCurrency, formatDate, logoBase64, primaryColor, secondaryColor)
    default:
      return createTemplate1(data, type, formatCurrency, formatDate, logoBase64, primaryColor, secondaryColor)
  }
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
  primaryColor: string,
  secondaryColor: string,
): string {
  // Professional, minimal, left-aligned
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222; background: #fff; width: 750px; min-height: 1000px; padding: 32px;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 32px;">
        <div>
          ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" style="height: 48px; max-width: 140px; object-fit: contain; margin-bottom: 8px;" />` : ''}
          <h2 style="margin: 0; font-size: 22px; color: ${primaryColor}; font-weight: bold;">${data.company?.name || 'Your Company'}</h2>
          <div style="color: #555; font-size: 13px; margin-top: 2px;">${data.company?.email || ''} | ${data.company?.phone || ''}</div>
          <div style="color: #888; font-size: 12px; margin-top: 2px;">${(data.company?.address || '').replace(/\n/g, '<br>')}</div>
        </div>
        <div style="text-align: right;">
          <h1 style="margin: 0; font-size: 28px; color: ${secondaryColor}; font-weight: bold;">${type === 'invoice' ? 'INVOICE' : 'QUOTATION'}</h1>
          <div style="font-size: 15px; color: #333; font-weight: bold; margin-top: 6px;">#${type === 'invoice' ? data.invoiceNumber : data.quotationNumber}</div>
          <div style="font-size: 12px; color: #666; margin-top: 6px;">${type === 'invoice' ? 'Invoice Date' : 'Quote Date'}: ${formatDate(data.issueDate)}</div>
          <div style="font-size: 12px; color: #666;">${type === 'invoice' ? 'Due Date' : 'Valid Until'}: ${formatDate(type === 'invoice' ? data.dueDate : data.validUntil)}</div>
        </div>
      </div>
      <div style="display: flex; gap: 32px; margin-bottom: 32px;">
        <div style="flex: 1; background: #f7f7f7; padding: 14px; border-radius: 6px; border-left: 3px solid ${primaryColor};">
          <h3 style="margin: 0 0 6px 0; font-size: 14px; color: ${primaryColor}; font-weight: bold;">${type === 'invoice' ? 'Bill To:' : 'Quote For:'}</h3>
          <div style="font-weight: bold; color: #222;">${data.customer.name}</div>
          <div style="color: #555; font-size: 13px;">${data.customer.email}</div>
          ${data.customer.phone ? `<div style="color: #555; font-size: 13px;">${data.customer.phone}</div>` : ''}
          <div style="color: #888; font-size: 12px; margin-top: 2px;">${(data.customer.billingAddress || '').replace(/\n/g, '<br>')}</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 14px; border-radius: 6px; border-left: 3px solid ${secondaryColor};">
          <h3 style="margin: 0 0 6px 0; font-size: 14px; color: ${secondaryColor}; font-weight: bold;">Payment Details:</h3>
          ${data.company?.bankName ? `<div style="font-size: 13px; color: #555;">Bank: ${data.company.bankName}<br>${data.company.bankAccount ? 'Account: ' + data.company.bankAccount + '<br>' : ''}${data.company.bankIFSC ? 'IFSC/Sort Code: ' + data.company.bankIFSC : ''}</div>` : '<div style="color: #bbb; font-style: italic;">Payment details not configured</div>'}
        </div>
      </div>
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 15px; color: ${primaryColor}; font-weight: bold; border-bottom: 1px solid ${primaryColor}; padding-bottom: 4px;">Items & Services</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f7f7f7;">
              <th style="padding: 8px; text-align: left; font-weight: bold; color: ${primaryColor};">Description</th>
              <th style="padding: 8px; text-align: center; font-weight: bold; color: ${primaryColor};">Qty</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; color: ${primaryColor};">Rate</th>
              <th style="padding: 8px; text-align: center; font-weight: bold; color: ${primaryColor};">Tax %</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; color: ${primaryColor};">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.lineItems.map((item: any, index: number) => `
              <tr style="background: ${index % 2 === 0 ? '#fff' : '#f7f7f7'};">
                <td style="padding: 8px;">${item.name}${item.description ? `<div style='color: #888; font-size: 12px;'>${item.description}</div>` : ''}</td>
                <td style="padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; text-align: right;">${formatCurrency(item.price)}</td>
                <td style="padding: 8px; text-align: center;">${item.taxRate}%</td>
                <td style="padding: 8px; text-align: right; font-weight: bold; color: ${primaryColor};">${formatCurrency(item.quantity * item.price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
        <div style="width: 320px; background: #f7f7f7; padding: 14px; border-radius: 6px; border: 1px solid ${primaryColor};">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Subtotal:</span><span>${formatCurrency(data.subtotal)}</span></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Tax:</span><span>${formatCurrency(data.taxAmount)}</span></div>
          <div style="border-top: 1px solid ${secondaryColor}; margin-top: 6px; padding-top: 6px; display: flex; justify-content: space-between; font-weight: bold; color: ${secondaryColor};"><span>Total:</span><span>${formatCurrency(data.total)}</span></div>
        </div>
      </div>
      ${data.notes ? `<div style="background: #f7f7f7; padding: 10px; border-radius: 6px; margin-bottom: 32px;"><strong>Notes:</strong><br><span style="color: #555;">${data.notes.replace(/\n/g, '<br>')}</span></div>` : ''}
      <div style="text-align: center; padding-top: 12px; border-top: 1px solid ${primaryColor}; color: #555; font-size: 13px;">
        Thank you for your business!<br>
        For any questions, please contact us at ${data.company?.email} or ${data.company?.phone}
      </div>
    </div>
  `;
}

function createTemplate3(
  data: any,
  type: string,
  formatCurrency: (amount: number) => string,
  formatDate: (date: string) => string,
  logoBase64: string,
  primaryColor: string,
  secondaryColor: string,
): string {
  // Professional, minimal, centered header
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222; background: #fff; width: 750px; min-height: 1000px; padding: 32px;">
      <div style="text-align: center; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 32px;">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" style="height: 48px; max-width: 140px; object-fit: contain; margin-bottom: 8px;" />` : ''}
        <h2 style="margin: 0; font-size: 22px; color: ${primaryColor}; font-weight: bold;">${data.company?.name || 'Your Company'}</h2>
        <div style="color: #555; font-size: 13px; margin-top: 2px;">${data.company?.email || ''} | ${data.company?.phone || ''}</div>
        <div style="color: #888; font-size: 12px; margin-top: 2px;">${(data.company?.address || '').replace(/\n/g, '<br>')}</div>
        <h1 style="margin: 12px 0 0 0; font-size: 28px; color: ${secondaryColor}; font-weight: bold;">${type === 'invoice' ? 'INVOICE' : 'QUOTATION'}</h1>
        <div style="font-size: 15px; color: #333; font-weight: bold; margin-top: 6px;">#${type === 'invoice' ? data.invoiceNumber : data.quotationNumber}</div>
        <div style="font-size: 12px; color: #666; margin-top: 6px;">${type === 'invoice' ? 'Invoice Date' : 'Quote Date'}: ${formatDate(data.issueDate)} | ${type === 'invoice' ? 'Due Date' : 'Valid Until'}: ${formatDate(type === 'invoice' ? data.dueDate : data.validUntil)}</div>
      </div>
      <div style="display: flex; gap: 32px; margin-bottom: 32px;">
        <div style="flex: 1; background: #f7f7f7; padding: 14px; border-radius: 6px; border-left: 3px solid ${primaryColor};">
          <h3 style="margin: 0 0 6px 0; font-size: 14px; color: ${primaryColor}; font-weight: bold;">${type === 'invoice' ? 'Bill To:' : 'Quote For:'}</h3>
          <div style="font-weight: bold; color: #222;">${data.customer.name}</div>
          <div style="color: #555; font-size: 13px;">${data.customer.email}</div>
          ${data.customer.phone ? `<div style="color: #555; font-size: 13px;">${data.customer.phone}</div>` : ''}
          <div style="color: #888; font-size: 12px; margin-top: 2px;">${(data.customer.billingAddress || '').replace(/\n/g, '<br>')}</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 14px; border-radius: 6px; border-left: 3px solid ${secondaryColor};">
          <h3 style="margin: 0 0 6px 0; font-size: 14px; color: ${secondaryColor}; font-weight: bold;">Payment Details:</h3>
          ${data.company?.bankName ? `<div style="font-size: 13px; color: #555;">Bank: ${data.company.bankName}<br>${data.company.bankAccount ? 'Account: ' + data.company.bankAccount + '<br>' : ''}${data.company.bankIFSC ? 'IFSC/Sort Code: ' + data.company.bankIFSC : ''}</div>` : '<div style="color: #bbb; font-style: italic;">Payment details not configured</div>'}
        </div>
      </div>
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 15px; color: ${primaryColor}; font-weight: bold; border-bottom: 1px solid ${primaryColor}; padding-bottom: 4px;">Items & Services</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f7f7f7;">
              <th style="padding: 8px; text-align: left; font-weight: bold; color: ${primaryColor};">Description</th>
              <th style="padding: 8px; text-align: center; font-weight: bold; color: ${primaryColor};">Qty</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; color: ${primaryColor};">Rate</th>
              <th style="padding: 8px; text-align: center; font-weight: bold; color: ${primaryColor};">Tax %</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; color: ${primaryColor};">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.lineItems.map((item: any, index: number) => `
              <tr style="background: ${index % 2 === 0 ? '#fff' : '#f7f7f7'};">
                <td style="padding: 8px;">${item.name}${item.description ? `<div style='color: #888; font-size: 12px;'>${item.description}</div>` : ''}</td>
                <td style="padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; text-align: right;">${formatCurrency(item.price)}</td>
                <td style="padding: 8px; text-align: center;">${item.taxRate}%</td>
                <td style="padding: 8px; text-align: right; font-weight: bold; color: ${primaryColor};">${formatCurrency(item.quantity * item.price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
        <div style="width: 320px; background: #f7f7f7; padding: 14px; border-radius: 6px; border: 1px solid ${primaryColor};">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Subtotal:</span><span>${formatCurrency(data.subtotal)}</span></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Tax:</span><span>${formatCurrency(data.taxAmount)}</span></div>
          <div style="border-top: 1px solid ${secondaryColor}; margin-top: 6px; padding-top: 6px; display: flex; justify-content: space-between; font-weight: bold; color: ${secondaryColor};"><span>Total:</span><span>${formatCurrency(data.total)}</span></div>
        </div>
      </div>
      ${data.notes ? `<div style="background: #f7f7f7; padding: 10px; border-radius: 6px; margin-bottom: 32px;"><strong>Notes:</strong><br><span style="color: #555;">${data.notes.replace(/\n/g, '<br>')}</span></div>` : ''}
      <div style="text-align: center; padding-top: 12px; border-top: 1px solid ${primaryColor}; color: #555; font-size: 13px;">
        Thank you for your business!<br>
        For any questions, please contact us at ${data.company?.email} or ${data.company?.phone}
      </div>
    </div>
  `;
}

function createTemplate4(
  data: any,
  type: string,
  formatCurrency: (amount: number) => string,
  formatDate: (date: string) => string,
  logoBase64: string,
  primaryColor: string,
  secondaryColor: string,
): string {
  // Professional, minimal, right-aligned header
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222; background: #fff; width: 750px; min-height: 1000px; padding: 32px;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 32px;">
        <div>
          <h2 style="margin: 0; font-size: 22px; color: ${primaryColor}; font-weight: bold;">${data.company?.name || 'Your Company'}</h2>
          <div style="color: #555; font-size: 13px; margin-top: 2px;">${data.company?.email || ''} | ${data.company?.phone || ''}</div>
          <div style="color: #888; font-size: 12px; margin-top: 2px;">${(data.company?.address || '').replace(/\n/g, '<br>')}</div>
        </div>
        <div style="text-align: right;">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" style="height: 48px; max-width: 140px; object-fit: contain; margin-bottom: 8px;" />` : ''}
          <h1 style="margin: 0; font-size: 28px; color: ${secondaryColor}; font-weight: bold;">${type === 'invoice' ? 'INVOICE' : 'QUOTATION'}</h1>
          <div style="font-size: 15px; color: #333; font-weight: bold; margin-top: 6px;">#${type === 'invoice' ? data.invoiceNumber : data.quotationNumber}</div>
          <div style="font-size: 12px; color: #666; margin-top: 6px;">${type === 'invoice' ? 'Invoice Date' : 'Quote Date'}: ${formatDate(data.issueDate)}</div>
          <div style="font-size: 12px; color: #666;">${type === 'invoice' ? 'Due Date' : 'Valid Until'}: ${formatDate(type === 'invoice' ? data.dueDate : data.validUntil)}</div>
        </div>
      </div>
      <div style="display: flex; gap: 32px; margin-bottom: 32px;">
        <div style="flex: 1; background: #f7f7f7; padding: 14px; border-radius: 6px; border-left: 3px solid ${primaryColor};">
          <h3 style="margin: 0 0 6px 0; font-size: 14px; color: ${primaryColor}; font-weight: bold;">${type === 'invoice' ? 'Bill To:' : 'Quote For:'}</h3>
          <div style="font-weight: bold; color: #222;">${data.customer.name}</div>
          <div style="color: #555; font-size: 13px;">${data.customer.email}</div>
          ${data.customer.phone ? `<div style="color: #555; font-size: 13px;">${data.customer.phone}</div>` : ''}
          <div style="color: #888; font-size: 12px; margin-top: 2px;">${(data.customer.billingAddress || '').replace(/\n/g, '<br>')}</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 14px; border-radius: 6px; border-left: 3px solid ${secondaryColor};">
          <h3 style="margin: 0 0 6px 0; font-size: 14px; color: ${secondaryColor}; font-weight: bold;">Payment Details:</h3>
          ${data.company?.bankName ? `<div style="font-size: 13px; color: #555;">Bank: ${data.company.bankName}<br>${data.company.bankAccount ? 'Account: ' + data.company.bankAccount + '<br>' : ''}${data.company.bankIFSC ? 'IFSC/Sort Code: ' + data.company.bankIFSC : ''}</div>` : '<div style="color: #bbb; font-style: italic;">Payment details not configured</div>'}
        </div>
      </div>
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 15px; color: ${primaryColor}; font-weight: bold; border-bottom: 1px solid ${primaryColor}; padding-bottom: 4px;">Items & Services</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f7f7f7;">
              <th style="padding: 8px; text-align: left; font-weight: bold; color: ${primaryColor};">Description</th>
              <th style="padding: 8px; text-align: center; font-weight: bold; color: ${primaryColor};">Qty</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; color: ${primaryColor};">Rate</th>
              <th style="padding: 8px; text-align: center; font-weight: bold; color: ${primaryColor};">Tax %</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; color: ${primaryColor};">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.lineItems.map((item: any, index: number) => `
              <tr style="background: ${index % 2 === 0 ? '#fff' : '#f7f7f7'};">
                <td style="padding: 8px;">${item.name}${item.description ? `<div style='color: #888; font-size: 12px;'>${item.description}</div>` : ''}</td>
                <td style="padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; text-align: right;">${formatCurrency(item.price)}</td>
                <td style="padding: 8px; text-align: center;">${item.taxRate}%</td>
                <td style="padding: 8px; text-align: right; font-weight: bold; color: ${primaryColor};">${formatCurrency(item.quantity * item.price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
        <div style="width: 320px; background: #f7f7f7; padding: 14px; border-radius: 6px; border: 1px solid ${primaryColor};">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Subtotal:</span><span>${formatCurrency(data.subtotal)}</span></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Tax:</span><span>${formatCurrency(data.taxAmount)}</span></div>
          <div style="border-top: 1px solid ${secondaryColor}; margin-top: 6px; padding-top: 6px; display: flex; justify-content: space-between; font-weight: bold; color: ${secondaryColor};"><span>Total:</span><span>${formatCurrency(data.total)}</span></div>
        </div>
      </div>
      ${data.notes ? `<div style="background: #f7f7f7; padding: 10px; border-radius: 6px; margin-bottom: 32px;"><strong>Notes:</strong><br><span style="color: #555;">${data.notes.replace(/\n/g, '<br>')}</span></div>` : ''}
      <div style="text-align: center; padding-top: 12px; border-top: 1px solid ${primaryColor}; color: #555; font-size: 13px;">
        Thank you for your business!<br>
        For any questions, please contact us at ${data.company?.email} or ${data.company?.phone}
      </div>
    </div>
  `;
}
