import nodemailer from "nodemailer"

// Create transporter with correct nodemailer syntax
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates for cPanel
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
  }

  console.log("Email config:", {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
  })

  // Correct method name is createTransport (not createTransporter)
  return nodemailer.createTransport(config)
}

export async function sendInvoiceEmail(invoice: any) {
  try {
    const transporter = createTransporter()

    // Verify connection
    console.log("Verifying SMTP connection...")
    await transporter.verify()
    console.log("SMTP connection verified successfully")

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: invoice.customer.email,
      cc: process.env.FROM_EMAIL, // Send copy to admin
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.company.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            ${
              invoice.company?.logoUrl
                ? `<img src="${invoice.company.logoUrl}" alt="${invoice.company.name}" style="max-height: 80px; margin-bottom: 20px;">`
                : ""
            }
            <h1 style="color: #2563eb; margin: 0;">Invoice ${invoice.invoiceNumber}</h1>
          </div>
          
          <p>Dear ${invoice.customer.name},</p>
          <p>Please find your invoice details below for the amount of <strong>${new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: invoice.currency,
          }).format(invoice.total)}</strong>.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #2563eb;">Invoice Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Invoice Number:</td>
                <td style="padding: 8px 0;">${invoice.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Issue Date:</td>
                <td style="padding: 8px 0;">${new Date(invoice.issueDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Due Date:</td>
                <td style="padding: 8px 0;">${new Date(invoice.dueDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #2563eb;">${new Intl.NumberFormat(
                  "en-US",
                  {
                    style: "currency",
                    currency: invoice.currency,
                  },
                ).format(invoice.total)}</td>
              </tr>
            </table>
          </div>

          ${
            invoice.company?.bankName
              ? `
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #10b981;">Payment Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; font-weight: bold;">Bank:</td>
                  <td style="padding: 4px 0;">${invoice.company.bankName}</td>
                </tr>
                ${
                  invoice.company.bankAccount
                    ? `<tr><td style="padding: 4px 0; font-weight: bold;">Account Number:</td><td style="padding: 4px 0;">${invoice.company.bankAccount}</td></tr>`
                    : ""
                }
                ${
                  invoice.company.bankIFSC
                    ? `<tr><td style="padding: 4px 0; font-weight: bold;">IFSC/Sort Code:</td><td style="padding: 4px 0;">${invoice.company.bankIFSC}</td></tr>`
                    : ""
                }
              </table>
            </div>
          `
              : ""
          }

          <div style="margin: 30px 0;">
            <h3 style="color: #374151;">Items:</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Description</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Rate</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.lineItems
                  .map(
                    (item: any) => `
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">
                      <strong>${item.name}</strong>
                      ${item.description ? `<br><small style="color: #6b7280;">${item.description}</small>` : ""}
                    </td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f3f4f6;">${item.quantity}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f3f4f6;">${new Intl.NumberFormat(
                      "en-US",
                      { style: "currency", currency: invoice.currency },
                    ).format(item.price)}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f3f4f6;">${new Intl.NumberFormat(
                      "en-US",
                      { style: "currency", currency: invoice.currency },
                    ).format(item.quantity * item.price)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <p>If you have any questions about this invoice, please contact us at <a href="mailto:${
            invoice.company.email
          }">${invoice.company.email}</a> or ${invoice.company.phone}.</p>
          
          <p>Thank you for your business!</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <div style="color: #6b7280; font-size: 14px;">
              <strong>${invoice.company.name}</strong><br>
              ${invoice.company.address.replace(/\n/g, "<br>")}<br>
              <a href="mailto:${invoice.company.email}">${invoice.company.email}</a> | ${invoice.company.phone}
              ${invoice.company.taxNumber ? `<br>Tax ID: ${invoice.company.taxNumber}` : ""}
            </div>
          </div>
        </div>
      `,
    }

    console.log("Sending email to:", invoice.customer.email)
    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
    return result
  } catch (error) {
    console.error("Email sending error:", error)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

export async function sendQuotationEmail(quotation: any) {
  try {
    const transporter = createTransporter()

    console.log("Verifying SMTP connection for quotation...")
    await transporter.verify()
    console.log("SMTP connection verified successfully")

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: quotation.customer.email,
      cc: process.env.FROM_EMAIL,
      subject: `Quotation ${quotation.quotationNumber} from ${quotation.company.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            ${
              quotation.company?.logoUrl
                ? `<img src="${quotation.company.logoUrl}" alt="${quotation.company.name}" style="max-height: 80px; margin-bottom: 20px;">`
                : ""
            }
            <h1 style="color: #10b981; margin: 0;">Quotation ${quotation.quotationNumber}</h1>
          </div>
          
          <p>Dear ${quotation.customer.name},</p>
          <p>Thank you for your interest in our services. Please find your quotation details below for the amount of <strong>${new Intl.NumberFormat(
            "en-US",
            {
              style: "currency",
              currency: quotation.currency,
            },
          ).format(quotation.total)}</strong>.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #10b981;">Quotation Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Quotation Number:</td>
                <td style="padding: 8px 0;">${quotation.quotationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Quote Date:</td>
                <td style="padding: 8px 0;">${new Date(quotation.issueDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Valid Until:</td>
                <td style="padding: 8px 0;">${new Date(quotation.validUntil).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #10b981;">${new Intl.NumberFormat(
                  "en-US",
                  {
                    style: "currency",
                    currency: quotation.currency,
                  },
                ).format(quotation.total)}</td>
              </tr>
            </table>
          </div>

          <div style="margin: 30px 0;">
            <h3 style="color: #374151;">Items:</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Description</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Rate</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${quotation.lineItems
                  .map(
                    (item: any) => `
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">
                      <strong>${item.name}</strong>
                      ${item.description ? `<br><small style="color: #6b7280;">${item.description}</small>` : ""}
                    </td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f3f4f6;">${item.quantity}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f3f4f6;">${new Intl.NumberFormat(
                      "en-US",
                      { style: "currency", currency: quotation.currency },
                    ).format(item.price)}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f3f4f6;">${new Intl.NumberFormat(
                      "en-US",
                      { style: "currency", currency: quotation.currency },
                    ).format(item.quantity * item.price)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <p>This quotation is valid until <strong>${new Date(
            quotation.validUntil,
          ).toLocaleDateString()}</strong>. Please let us know if you would like to proceed or if you have any questions.</p>
          
          <p>We look forward to working with you!</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <div style="color: #6b7280; font-size: 14px;">
              <strong>${quotation.company.name}</strong><br>
              ${quotation.company.address.replace(/\n/g, "<br>")}<br>
              <a href="mailto:${quotation.company.email}">${quotation.company.email}</a> | ${quotation.company.phone}
              ${quotation.company.taxNumber ? `<br>Tax ID: ${quotation.company.taxNumber}` : ""}
            </div>
          </div>
        </div>
      `,
    }

    console.log("Sending quotation email to:", quotation.customer.email)
    const result = await transporter.sendMail(mailOptions)
    console.log("Quotation email sent successfully:", result.messageId)
    return result
  } catch (error) {
    console.error("Quotation email sending error:", error)
    throw new Error(`Failed to send quotation email: ${error.message}`)
  }
}

// Test email configuration
export async function testEmailConnection() {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    return { success: true, message: "Email configuration is working!" }
  } catch (error) {
    console.error("Email test failed:", error)
    return { success: false, message: error.message }
  }
}
