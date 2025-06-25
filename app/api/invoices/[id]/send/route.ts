import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendInvoiceEmail } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        customer: true,
        lineItems: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Send email
    await sendInvoiceEmail(invoice)

    // Update invoice status to SENT
    await prisma.invoice.update({
      where: { id: params.id },
      data: { status: "SENT" },
    })

    return NextResponse.json({ success: true, message: "Invoice sent successfully" })
  } catch (error) {
    console.error("Error sending invoice:", error)
    return NextResponse.json({ error: "Failed to send invoice" }, { status: 500 })
  }
}
