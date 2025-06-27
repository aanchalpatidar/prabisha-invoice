import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    return NextResponse.json(invoice)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { customerId, issueDate, dueDate, currency, subtotal, taxAmount, total, notes, lineItems, status } = data

    // Delete existing line items
    await prisma.invoiceLineItem.deleteMany({
      where: { invoiceId: params.id },
    })

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        customerId,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        currency,
        subtotal,
        taxAmount,
        total,
        notes,
        status,
        lineItems: {
          create: lineItems.map((item: any) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            taxRate: item.taxRate,
            total: item.quantity * item.price,
          })),
        },
      },
      include: {
        customer: true,
        lineItems: true,
      },
    })

    return NextResponse.json(invoice)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.invoice.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
  }
}
