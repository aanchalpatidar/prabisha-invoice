import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateInvoiceNumber } from "@/lib/utils"

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { customerId, issueDate, dueDate, currency, subtotal, taxAmount, total, notes, lineItems } = data

    // Get company for the invoice
    const company = await prisma.company.findFirst()
    if (!company) {
      return NextResponse.json({ error: "Company not found. Please set up company details first." }, { status: 400 })
    }

    const invoiceNumber = generateInvoiceNumber(company.name)

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        companyId: company.id,
        customerId,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        currency,
        subtotal,
        taxAmount,
        total,
        notes,
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
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
