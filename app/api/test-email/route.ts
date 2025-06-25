import { type NextRequest, NextResponse } from "next/server"
import { testEmailConnection } from "@/lib/email"

export async function GET() {
  try {
    const result = await testEmailConnection()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, message: "Email test failed", error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message } = await request.json()

    const nodemailer = require("nodemailer")

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: to || process.env.FROM_EMAIL,
      subject: subject || "Test Email from Invoice Generator",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Test Email</h2>
          <p>${message || "This is a test email to verify your email configuration is working correctly."}</p>
          <p>If you received this email, your SMTP settings are configured properly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent from Invoice Generator<br>
            Host: ${process.env.SMTP_HOST}<br>
            Port: ${process.env.SMTP_PORT}<br>
            User: ${process.env.SMTP_USER}
          </p>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: result.messageId,
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send test email", error: error.message },
      { status: 500 },
    )
  }
}
